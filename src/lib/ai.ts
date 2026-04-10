/**
 * Legacy screenshot analysis helper.
 *
 * ⚠️ NOTE (CAIO 2026-04-10):
 *  本関数は従来の「AIで法的判断」フローの名残です。
 *  新方針「AIで判断するな、AIで圧縮しろ」に基づき、以下を遵守すること:
 *  - 出力は必ず弁護士レビューを経てから利用する
 *  - 画像送信は弁護士目視確認後のみ許可
 *  - 全AI呼び出しは src/lib/ai/index.ts の callAI() を経由
 *  - 新規の内部AI機能はすべて src/lib/ai/ 配下の新抽象化層を使うこと
 */
import { callAI } from "@/lib/ai/index";
import type { AIMessage } from "@/lib/ai/provider";

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
  context: string | undefined,
  userId: string
): Promise<AIAnalysisResult> {
  const userContent: AIMessage["content"] = [];

  for (const img of images) {
    userContent.push({
      type: "image",
      mimeType: img.mimeType,
      data: img.data,
    });
  }

  userContent.push({
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

  const res = await callAI({
    purpose: "extract_keypoints",
    system:
      "あなたは弁護士の業務補助AIです。法的判断は行わず、情報の整理と参考情報の提示のみを行います。出力は必ず弁護士のレビューを経てから利用されます。",
    messages: [{ role: "user", content: userContent }],
    maxTokens: 1024,
    userId,
  });

  if (res.isStub) {
    return {
      defamationLikelihood: "MEDIUM",
      recommendedProcedure: "発信者情報開示命令（新制度）",
      estimatedCost: "33万円〜44万円",
      keyPoints: [
        "APIキーが設定されていないため、プレースホルダーの結果です",
        "Anthropic APIキーを環境変数 ANTHROPIC_API_KEY に設定してください",
        "設定後、このボタンで実際のAI分析が利用可能になります",
      ],
      rawResponse: res.text,
      isPlaceholder: true,
    };
  }

  const text = res.text;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        defamationLikelihood: parsed.defamationLikelihood || "MEDIUM",
        recommendedProcedure: parsed.recommendedProcedure || "要相談",
        estimatedCost: parsed.estimatedCost || "要見積もり",
        keyPoints: parsed.keyPoints || [],
        rawResponse: text,
        isPlaceholder: false,
      };
    }
  } catch {
    // JSON parse failed
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
