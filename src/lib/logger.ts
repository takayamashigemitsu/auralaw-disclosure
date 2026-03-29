import { prisma } from "@/lib/prisma";

/**
 * 構造化ログシステム
 *
 * レベル:
 *   info  — 正常な重要操作（ログイン、ステータス更新、書類生成等）
 *   warn  — 想定外だが回復可能（バリデーション失敗、権限不足等）
 *   error — 障害（DB接続エラー、外部API失敗等）
 *
 * カテゴリ:
 *   auth      — 認証・認可
 *   db        — データベース操作
 *   api       — API呼び出し
 *   business  — ビジネスロジック（案件化、ステータス変更等）
 *   email     — メール送信
 *   file      — ファイル操作
 *   ui        — フロントエンドエラー
 */

export type LogLevel = "info" | "warn" | "error";
export type LogCategory = "auth" | "db" | "api" | "business" | "email" | "file" | "ui";

export interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  path?: string;
  userAgent?: string;
  duration?: number;
}

/**
 * ログをDBに保存（非同期・fire-and-forget）
 * ログ保存の失敗がアプリケーションをクラッシュさせない
 */
export async function log(entry: LogEntry): Promise<void> {
  // コンソールにも常に出力（Vercel Logsに残る）
  const consoleMsg = `[${entry.level.toUpperCase()}][${entry.category}] ${entry.message}`;
  if (entry.level === "error") {
    console.error(consoleMsg, entry.context ?? "");
  } else if (entry.level === "warn") {
    console.warn(consoleMsg, entry.context ?? "");
  } else {
    console.log(consoleMsg);
  }

  // DB保存（失敗してもアプリを止めない）
  try {
    await prisma.appLog.create({
      data: {
        level: entry.level,
        category: entry.category,
        message: entry.message,
        context: entry.context ? JSON.stringify(maskPII(entry.context)) : null,
        userId: entry.userId ?? null,
        path: entry.path ?? null,
        userAgent: entry.userAgent ?? null,
        duration: entry.duration ?? null,
      },
    });
  } catch (e) {
    // ログ保存自体の失敗はconsoleのみ（無限ループ防止）
    console.error("[Logger] Failed to save log to DB:", e);
  }
}

/**
 * 便利メソッド
 */
export const logger = {
  info: (category: LogCategory, message: string, extra?: Partial<LogEntry>) =>
    log({ level: "info", category, message, ...extra }),

  warn: (category: LogCategory, message: string, extra?: Partial<LogEntry>) =>
    log({ level: "warn", category, message, ...extra }),

  error: (category: LogCategory, message: string, error?: unknown, extra?: Partial<LogEntry>) =>
    log({
      level: "error",
      category,
      message,
      context: {
        ...(extra?.context ?? {}),
        error: serializeError(error),
      },
      ...extra,
    }),
};

/**
 * エラーオブジェクトをシリアライズ可能な形に変換
 */
function serializeError(err: unknown): Record<string, unknown> | string {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack?.split("\n").slice(0, 5).join("\n"), // スタック5行まで
    };
  }
  if (typeof err === "string") return err;
  return String(err);
}

/**
 * PIIマスク — メールアドレスと電話番号を部分マスク
 */
function maskPII(obj: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...obj };
  for (const key of Object.keys(masked)) {
    const val = masked[key];
    if (typeof val === "string") {
      // メールアドレスマスク: user@example.com → u***@example.com
      if (key.toLowerCase().includes("email") && val.includes("@")) {
        const [local, domain] = val.split("@");
        masked[key] = `${local[0]}***@${domain}`;
      }
      // 電話番号マスク: 090-1234-5678 → 090-****-5678
      if (key.toLowerCase().includes("phone") && val.length >= 8) {
        masked[key] = val.slice(0, 4) + "****" + val.slice(-4);
      }
    }
    // ネストされたオブジェクトは再帰しない（パフォーマンス）
  }
  return masked;
}

/**
 * 処理時間計測ラッパー
 * 使用例: const result = await withLogging("api", "consultation.create", async () => { ... })
 */
export async function withLogging<T>(
  category: LogCategory,
  operation: string,
  fn: () => Promise<T>,
  extra?: Partial<LogEntry>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    // 500ms以上かかった場合はwarnログ
    if (duration > 500) {
      logger.warn(category, `Slow operation: ${operation} (${duration}ms)`, {
        ...extra,
        duration,
      });
    }
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    logger.error(category, `Failed: ${operation}`, err, {
      ...extra,
      duration,
    });
    throw err; // 元のエラーを再throw
  }
}
