import type { AIProvider, AIRequest, AIResponse, AIMessage } from "./provider";

/**
 * Anthropic Claude provider
 *
 * - 通常APIを使用（ZDRなし）
 * - 呼び出し元で必ず PII filter + cost guard を通すこと
 * - 直接 process.env.ANTHROPIC_API_KEY を参照せず、constructor経由で受け取る
 */

// 価格表（USD / 1M tokens）。モデル切替時に更新すること。
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-5-20250929": { input: 3.0, output: 15.0 },
  "claude-opus-4-5": { input: 15.0, output: 75.0 },
  "claude-haiku-4-5-20251001": { input: 1.0, output: 5.0 },
};

function convertMessages(messages: AIMessage[]): Array<Record<string, unknown>> {
  return messages.map((m) => {
    if (typeof m.content === "string") {
      return { role: m.role, content: m.content };
    }
    return {
      role: m.role,
      content: m.content.map((block) => {
        if (block.type === "text") {
          return { type: "text", text: block.text };
        }
        return {
          type: "image",
          source: {
            type: "base64",
            media_type: block.mimeType,
            data: block.data,
          },
        };
      }),
    };
  });
}

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly model: string;
  private apiKey: string;

  constructor(apiKey: string, model = "claude-sonnet-4-5-20250929") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(req: AIRequest): Promise<AIResponse> {
    const body = {
      model: this.model,
      max_tokens: req.maxTokens ?? 1024,
      system: req.system,
      messages: convertMessages(req.messages),
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Anthropic API error ${response.status}: ${errText.slice(0, 500)}`
      );
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    const text =
      data.content?.find((c) => c.type === "text")?.text ?? "";
    const inputTokens = data.usage?.input_tokens ?? 0;
    const outputTokens = data.usage?.output_tokens ?? 0;

    const pricing = PRICING[this.model] ?? { input: 3.0, output: 15.0 };
    const estimatedCostUsd =
      (inputTokens / 1_000_000) * pricing.input +
      (outputTokens / 1_000_000) * pricing.output;

    return {
      text,
      inputTokens,
      outputTokens,
      estimatedCostUsd,
      provider: this.name,
      model: this.model,
      isStub: false,
    };
  }
}
