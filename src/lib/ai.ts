type AIAnalysisResult = {
  defamationLikelihood: "HIGH" | "MEDIUM" | "LOW";
  recommendedProcedure: string;
  estimatedCost: string;
  keyPoints: string[];
  rawResponse: string;
  isPlaceholder: boolean;
};

export async function analyzeScreenshots(
  images: Array<{ data: string; mimeType: string }>,
  context?: string
): Promise<AIAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      defamationLikelihood: "MEDIUM",
      recommendedProcedure: "発信者情報開示命令（新制度）",
      estimatedCost: "33万円〜44万円",
      keyPoints: [
        "APIキーが設定されていないため、プレースホルダーの結果です",
        "Anthropic APIキーを環境変数 ANTHROPIC_API_KEY に設定してください",
        "設定後、このボタンで実際のAI分析が利用可能になります",
      ],
      rawResponse: "",
      isPlaceholder: true,
    };
  }

  const content: Array<Record<string, unknown>> = [];

  for (const img of images) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mimeType,
        data: img.data,
      },
    });
  }

  content.push({
    type: "text",
    text: `以下のスクリーンショットを分析してください。${context ? `追加情報: ${context}` : ""}

以下のJSON形式で回答してください:
{
  "defamationLikelihood": "HIGH" or "MEDIUM" or "LOW",
  "recommendedProcedure": "推奨する法的手続き",
  "estimatedCost": "概算費用（例: 33万円〜44万円）",
  "keyPoints": ["ポイント1", "ポイント2", "ポイント3"]
}

判断基準:
- 投稿内容が名誉毀損・侮辱・プライバシー侵害に該当するか
- 発信者情報開示請求が認められる見込みがあるか
- どのSNS/サイトかを特定
- 推奨する手続き（開示命令/仮処分+訴訟）
- 概算費用の目安`,
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content }],
    }),
  });

  const data = await response.json();
  const text =
    data.content?.[0]?.type === "text" ? data.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        defamationLikelihood: parsed.defamationLikelihood || "MEDIUM",
        recommendedProcedure:
          parsed.recommendedProcedure || "要相談",
        estimatedCost: parsed.estimatedCost || "要見積もり",
        keyPoints: parsed.keyPoints || [],
        rawResponse: text,
        isPlaceholder: false,
      };
    }
  } catch {
    // JSON parse failed, return raw text
  }

  return {
    defamationLikelihood: "MEDIUM",
    recommendedProcedure: "要相談",
    estimatedCost: "要見積もり",
    keyPoints: ["AI分析結果の解析に失敗しました。生データを確認してください。"],
    rawResponse: text,
    isPlaceholder: false,
  };
}
