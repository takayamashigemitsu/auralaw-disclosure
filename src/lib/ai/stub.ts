import type { AIProvider, AIRequest, AIResponse } from "./provider";

/**
 * Stub AI provider
 *
 * 用途:
 *  - ローカル開発でAnthropic APIキーが未設定の場合のフォールバック
 *  - 単体テスト・CI
 *  - P0 公開時にAI機能を「UI上は存在するが内部は無効」にするためのスイッチ
 */
export class StubAIProvider implements AIProvider {
  readonly name = "stub";
  readonly model = "stub-v0";

  async chat(req: AIRequest): Promise<AIResponse> {
    const stubText = `[STUB AI RESPONSE - purpose: ${req.purpose}]\n本番ではここにAIの出力が入ります。APIキー未設定またはスタブモードです。`;
    return {
      text: stubText,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUsd: 0,
      provider: this.name,
      model: this.model,
      isStub: true,
    };
  }
}
