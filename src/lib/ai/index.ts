import type { AIProvider, AIRequest, AIResponse } from "./provider";
import { AnthropicProvider } from "./anthropic";
import { StubAIProvider } from "./stub";
import {
  reserveDailyCost,
  commitDailyCost,
  releaseDailyCost,
  assertSingleRequestLimit,
  recordCost,
  AICostLimitError,
} from "./cost-guard";
import { isSafeToSendToAI } from "./pii-filter";

export type { AIProvider, AIRequest, AIResponse } from "./provider";
export { maskPII, unmaskPII, isSafeToSendToAI } from "./pii-filter";
export { AICostLimitError, AI_COST_LIMITS } from "./cost-guard";

/**
 * 呼び出し側が明示的にリアルAI実行を要求するオプション。
 *
 * 用途: A6 リリースゲートでサンプル実行する時のみ、本体の
 * `AI_PROVIDER_FORCE_STUB=true` を維持したまま、このエンドポイント
 * だけ本物の Anthropic を叩きたい、というケース。
 *
 * 重要:
 *  - forceReal は認証済みの信頼できる呼び出し元 (ADMIN 以上) のみ許可
 *  - callAI 側でこのフラグが渡ってきたら audit log に必ず記録する
 *  - ANTHROPIC_API_KEY が未設定の場合は例外を投げる (Stub フォールバックしない)
 */
export type CallAIOptions = {
  /** true にすると `AI_PROVIDER_FORCE_STUB` を無視して本物の AI を呼ぶ */
  forceReal?: boolean;
};

/**
 * 現在の環境設定から利用するプロバイダを返す
 *
 * 環境変数:
 *  - AI_PROVIDER_FORCE_STUB = "true"  → 常にStub
 *  - ANTHROPIC_API_KEY 未設定 → 自動的にStub
 *
 * forceReal オプション:
 *  - true を渡すと AI_PROVIDER_FORCE_STUB チェックをスキップ
 *  - ただし ANTHROPIC_API_KEY 未設定なら Error を投げる (Stub にフォールバックしない)
 */
export function getProvider(options?: CallAIOptions): AIProvider {
  if (options?.forceReal) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "forceReal が要求されましたが ANTHROPIC_API_KEY が設定されていません。Vercel 環境変数を確認してください。"
      );
    }
    return new AnthropicProvider(apiKey);
  }
  if (process.env.AI_PROVIDER_FORCE_STUB === "true") {
    return new StubAIProvider();
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new StubAIProvider();
  }
  return new AnthropicProvider(apiKey);
}

/**
 * AI呼び出しの共通ラッパー
 *
 * 以下をすべて実施する:
 *  1. 入力の簡易セーフティチェック（PII filter の safety gate）
 *  2. 日次コスト上限チェック
 *  3. プロバイダを呼ぶ
 *  4. コストを AppLog に記録
 *  5. 1リクエスト上限の事後チェック（使いすぎ検出）
 *
 * 直接 provider.chat() を呼ぶのは禁止。必ず callAI() を使うこと。
 *
 * options.forceReal:
 *  - A6 リリースゲートなど、システム全体は Stub のままでも
 *    特定エンドポイントのみ本物 AI を呼びたい場合に true を渡す
 *  - cost guard は引き続き適用されるので暴走リスクはない
 */
export async function callAI(
  req: AIRequest,
  options?: CallAIOptions
): Promise<AIResponse> {
  // 1. safety check (text-only messages)
  for (const m of req.messages) {
    if (typeof m.content === "string") {
      const check = isSafeToSendToAI(m.content);
      if (!check.safe) {
        throw new Error(`AI送信ブロック: ${check.reason}`);
      }
    }
  }

  // 2. reserve daily budget atomically (Redis incrby)
  //    Stub is free → skip reservation entirely.
  const provider = getProvider(options);
  const reservation =
    provider.name !== "stub" ? await reserveDailyCost() : null;

  // 3. call provider (release on failure)
  let res: AIResponse;
  try {
    res = await provider.chat(req);
  } catch (e) {
    await releaseDailyCost(reservation);
    throw e;
  }

  // 4. commit actual cost delta + audit log
  if (!res.isStub) {
    await commitDailyCost(reservation, res.estimatedCostUsd);
    await recordCost({
      userId: req.userId,
      purpose: req.purpose,
      provider: res.provider,
      model: res.model,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      costUsd: res.estimatedCostUsd,
    });
    // 5. single-request post-check（異常に大きい応答を次回以降防ぐ）
    assertSingleRequestLimit(res.estimatedCostUsd);
  } else {
    // Stub でも予約が存在することは無いが、念のため解放
    await releaseDailyCost(reservation);
  }

  return res;
}
