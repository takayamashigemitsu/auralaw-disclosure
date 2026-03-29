"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";

type AnalysisResult = {
  defamationLikelihood: string;
  recommendedProcedure: string;
  estimatedCost: string;
  keyPoints: string[];
  isPlaceholder: boolean;
};

const likelihoodConfig: Record<string, { label: string; color: string }> = {
  HIGH: { label: "高い", color: "bg-red-100 text-red-800" },
  MEDIUM: { label: "中程度", color: "bg-yellow-100 text-yellow-800" },
  LOW: { label: "低い", color: "bg-gray-100 text-gray-600" },
};

export function AIAnalysisButton({
  consultationId,
  caseId,
  hasImages,
  existingResult,
}: {
  consultationId?: string;
  caseId?: string;
  hasImages: boolean;
  existingResult?: AnalysisResult | null;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(
    existingResult || null
  );
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId, caseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "分析に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleAnalyze}
        disabled={loading || !hasImages}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-purple-600" />
        )}
        {loading ? "分析中..." : "AI分析"}
      </Button>
      {!hasImages && (
        <p className="text-xs text-gray-400">画像がないため分析できません</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <Card className={result.isPlaceholder ? "border-dashed" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI分析結果
              {result.isPlaceholder && (
                <Badge variant="outline" className="text-xs">
                  プレースホルダー
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">名誉毀損の可能性</span>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                  likelihoodConfig[result.defamationLikelihood]?.color ||
                  "bg-gray-100"
                }`}
              >
                {likelihoodConfig[result.defamationLikelihood]?.label ||
                  result.defamationLikelihood}
              </span>
            </div>
            <div>
              <span className="text-gray-600">推奨手続き</span>
              <p className="font-medium">{result.recommendedProcedure}</p>
            </div>
            <div>
              <span className="text-gray-600">概算費用</span>
              <p className="font-medium">{result.estimatedCost}</p>
            </div>
            {result.keyPoints.length > 0 && (
              <div>
                <span className="text-gray-600">ポイント</span>
                <ul className="mt-1 space-y-1">
                  {result.keyPoints.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1 text-xs text-gray-700"
                    >
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
