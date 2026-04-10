import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/rate-limit";

/**
 * AI Cost Guard
 *
 * 目的:
 *  - 暴走（バグ・プロンプトインジェクション・誤用）による課金爆発を防ぐ
 *  - 1日あたりの合計コスト上限 / 1リクエストあたりの上限を設ける
 *
 * 設計（2026-04-10 C4監査指摘対応）:
 *  - Redis 上のカウンタをプライマリソースとする（TOCTOU レース排除）
 *  - 予約フロー: 呼び出し前に 1req 上限分を atomic incrby で確保 → 上限超過なら decrby ロールバック
 *  - 呼び出し後: actual との差分を delta として incrby（通常は負の値で解放）
 *  - AppLog への記録は継続（監査ログ、日次ダッシュボード用）
 *  - Redis 未設定時は従来の DB 集計にフォールバック（開発用のみ、レース排除は保証しない）
 *
 * 金額はすべて micro USD (USD × 1e6) の整数で扱う。浮動小数のズレ回避。
 *
 * 環境変数:
 *  AI_DAILY_COST_LIMIT_USD  (default: 10)
 *  AI_SINGLE_REQUEST_LIMIT_USD (default: 1)
 */

const DAILY_LIMIT_USD = Number(process.env.AI_DAILY_COST_LIMIT_USD ?? 10);
const SINGLE_REQUEST_LIMIT_USD = Number(
  process.env.AI_SINGLE_REQUEST_LIMIT_USD ?? 1
);

const DAILY_LIMIT_MICRO = Math.floor(DAILY_LIMIT_USD * 1_000_000);
const SINGLE_REQUEST_LIMIT_MICRO = Math.floor(
  SINGLE_REQUEST_LIMIT_USD * 1_000_000
);
const TTL_SECONDS = 48 * 60 * 60;

export class AICostLimitError extends Error {
  constructor(
    message: string,
    public readonly kind: "daily" | "single",
    public readonly currentUsd: number,
    public readonly limitUsd: number
  ) {
    super(message);
    this.name = "AICostLimitError";
  }
}

/**
 * JST ベースの日次キーを返す。00:00 JST でリセット。
 */
function todayKey(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const ymd = jst.toISOString().slice(0, 10).replace(/-/g, "");
  return `ai:cost:daily:${ymd}`;
}

function toUsd(micro: number): number {
  return micro / 1_000_000;
}

export type CostReservation = {
  reservedMicro: number;
  key: string;
} | null;

/**
 * DB フォールバック: Redis 未設定時のみ使用。
 * レース排除は保証しない（開発環境用）。
 */
async function getTodaysCostUsdFromDb(): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const logs = await prisma.appLog.findMany({
    where: {
      category: "ai_cost",
      createdAt: { gte: startOfDay },
    },
    select: { context: true },
  });

  let total = 0;
  for (const log of logs) {
    if (!log.context) continue;
    try {
      const ctx = JSON.parse(log.context) as { costUsd?: number };
      if (typeof ctx.costUsd === "number") total += ctx.costUsd;
    } catch {
      // ignore malformed entries
    }
  }
  return total;
}

/**
 * 呼び出し前に 1req 上限分を予約する。
 * 予約済み合計が日次上限を超えたらロールバックして throw。
 *
 * 戻り値: 予約トークン。必ず commitDailyCost() または releaseDailyCost() を呼ぶこと。
 */
export async function reserveDailyCost(): Promise<CostReservation> {
  if (!redis) {
    // Fallback: DB aggregation. TOCTOU は残るが開発環境のみ。
    const today = await getTodaysCostUsdFromDb();
    if (today >= DAILY_LIMIT_USD) {
      throw new AICostLimitError(
        `AIの日次コスト上限 ${DAILY_LIMIT_USD} USD に到達しました（現在 ${today.toFixed(4)} USD）。明日再試行してください。`,
        "daily",
        today,
        DAILY_LIMIT_USD
      );
    }
    return null;
  }

  const key = todayKey();
  const newTotal = await redis.incrby(key, SINGLE_REQUEST_LIMIT_MICRO);

  // 初回 incr のときだけ TTL を付ける（48h）
  if (newTotal === SINGLE_REQUEST_LIMIT_MICRO) {
    await redis.expire(key, TTL_SECONDS);
  }

  if (newTotal > DAILY_LIMIT_MICRO) {
    // ロールバック
    await redis.decrby(key, SINGLE_REQUEST_LIMIT_MICRO);
    const currentMicro = newTotal - SINGLE_REQUEST_LIMIT_MICRO;
    throw new AICostLimitError(
      `AIの日次コスト上限 ${DAILY_LIMIT_USD} USD に到達しました（現在 ${toUsd(currentMicro).toFixed(4)} USD）。明日再試行してください。`,
      "daily",
      toUsd(currentMicro),
      DAILY_LIMIT_USD
    );
  }

  return { reservedMicro: SINGLE_REQUEST_LIMIT_MICRO, key };
}

/**
 * 呼び出し成功後に actual コストで予約を確定する。
 * 差分 (actual - reserved) を atomic incrby で反映する（通常は負）。
 */
export async function commitDailyCost(
  reservation: CostReservation,
  actualCostUsd: number
): Promise<void> {
  if (!redis || !reservation) return;
  const actualMicro = Math.floor(actualCostUsd * 1_000_000);
  const delta = actualMicro - reservation.reservedMicro;
  if (delta === 0) return;
  if (delta > 0) {
    await redis.incrby(reservation.key, delta);
  } else {
    await redis.decrby(reservation.key, -delta);
  }
}

/**
 * 呼び出しが失敗したとき予約を全解放する。
 */
export async function releaseDailyCost(
  reservation: CostReservation
): Promise<void> {
  if (!redis || !reservation) return;
  await redis.decrby(reservation.key, reservation.reservedMicro);
}

/**
 * 現在の日次コスト（USD）を返す。ダッシュボード/デバッグ用。
 */
export async function getTodaysCostUsd(): Promise<number> {
  if (!redis) return getTodaysCostUsdFromDb();
  const key = todayKey();
  const raw = await redis.get<string | number>(key);
  if (raw == null) return 0;
  const micro = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(micro) ? toUsd(micro) : 0;
}

export function assertSingleRequestLimit(estimatedCostUsd: number): void {
  if (estimatedCostUsd > SINGLE_REQUEST_LIMIT_USD) {
    throw new AICostLimitError(
      `1リクエストあたりのコスト上限 ${SINGLE_REQUEST_LIMIT_USD} USD を超えています（概算 ${estimatedCostUsd.toFixed(4)} USD）。`,
      "single",
      estimatedCostUsd,
      SINGLE_REQUEST_LIMIT_USD
    );
  }
}

/**
 * AI呼び出し後、コストを AppLog に監査記録する。
 * （Redis カウンタとは別、監査・集計用）
 */
export async function recordCost(params: {
  userId: string;
  purpose: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}): Promise<void> {
  try {
    await prisma.appLog.create({
      data: {
        level: "info",
        category: "ai_cost",
        message: `ai_call:${params.purpose}`,
        context: JSON.stringify(params),
        userId: params.userId,
      },
    });
  } catch (e) {
    // Cost log failure must not crash the AI call
    console.error("AI cost log failed:", e);
  }
}

export const AI_COST_LIMITS = {
  dailyLimitUsd: DAILY_LIMIT_USD,
  singleRequestLimitUsd: SINGLE_REQUEST_LIMIT_USD,
};
