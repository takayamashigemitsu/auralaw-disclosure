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
 * 現在の環境設定から利用するプロバイダを返す
 *
 * 環境変数:
 *  - AI_PROVIDER_FORCE_STUB = "true"  → 常にStub
 *  - ANTHROPIC_API_KEY 未設定 → 自動的にStub
 */
export function getProvider(): AIProvider {
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
 */
export async function callAI(req: AIRequest): Promise<AIResponse> {
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
  const provider = getProvider();
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
