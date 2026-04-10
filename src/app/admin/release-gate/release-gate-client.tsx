"use client";

/**
 * A6 リリースゲート Client コンポーネント
 *
 * - 全サンプルに対する「全件実行」ボタン
 * - 各サンプルの AI 出力表示
 * - 各サンプルの 5 軸採点フォーム
 * - Gate 総合判定（pass/fail/incomplete）
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ReleaseSample, GateEvaluation } from "@/lib/ai/release-samples";
import { toast } from "sonner";
import { Play, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

type TimelineEntry = { when: string; what: string; gap?: boolean };
type Party = { role: string; name?: string; handle?: string };
type RiskFlag = { type: string; detail: string };

type OrganizeResultLite = {
  id: string;
  summary: string;
  facts: string[];
  parties: Party[];
  timeline: TimelineEntry[];
  suggestedQuestions: string[];
  riskFlags: RiskFlag[];
  missingInfo: string[];
  createdAt: string;
};

type SampleRow = {
  sample: ReleaseSample;
  run: {
    id: string;
    promptVersion: string;
    errorMessage: string | null;
    createdAt: string;
    scoreFactAccuracy: number | null;
    scoreCompressionRate: number | null;
    scoreForbiddenCompliance: number | null;
    scoreMissingInfoDetection: number | null;
    scoreStructureConsistency: number | null;
    scoreNotes: string | null;
    scoredAt: string | null;
    organizeResult: OrganizeResultLite | null;
  } | null;
};

const AXES = [
  { key: "scoreFactAccuracy", label: "事実正確性", short: "事実" },
  { key: "scoreCompressionRate", label: "圧縮率", short: "圧縮" },
  { key: "scoreForbiddenCompliance", label: "禁止ワード遵守", short: "禁止" },
  { key: "scoreMissingInfoDetection", label: "不足情報指摘力", short: "不足" },
  { key: "scoreStructureConsistency", label: "構造整合", short: "構造" },
] as const;

type AxisKey = (typeof AXES)[number]["key"];

export function ReleaseGateClient({
  rows,
  evaluation,
}: {
  rows: SampleRow[];
  evaluation: GateEvaluation;
}) {
  const router = useRouter();
  const [isRunning, startRunning] = useTransition();

  async function runAll() {
    startRunning(async () => {
      try {
        const res = await fetch("/api/admin/release-gate/run", {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "実行に失敗しました");
          return;
        }
        const okCount = data.results.filter(
          (r: { ok: boolean }) => r.ok
        ).length;
        toast.success(
          `${okCount}/${data.results.length} サンプル実行完了 (prompt: ${data.promptVersion})`
        );
        router.refresh();
      } catch {
        toast.error("ネットワークエラー");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A6 リリースゲート</h1>
          <p className="mt-1 text-sm text-gray-500">
            5 サンプルを AI 整理に通し、5 軸（事実正確性・圧縮率・禁止ワード遵守・不足情報指摘・構造整合）で採点します。
            全軸平均 4.0 以上で本番 AI 解放可。
          </p>
        </div>
        <Button onClick={runAll} disabled={isRunning}>
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 実行中...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> 全サンプル実行
            </>
          )}
        </Button>
      </div>

      <GateStatusCard evaluation={evaluation} />

      <div className="space-y-8">
        {rows.map((row) => (
          <SampleBlock key={row.sample.key} row={row} onSaved={() => router.refresh()} />
        ))}
      </div>
    </div>
  );
}

function GateStatusCard({ evaluation }: { evaluation: GateEvaluation }) {
  const { status, averages, sampleCount, scoredCount, missingKeys } = evaluation;

  const statusInfo = {
    pass: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      label: "PASS — 本番解放可",
    },
    fail: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      label: "FAIL — プロンプト改善が必要",
    },
    incomplete: {
      icon: AlertCircle,
      color: "text-yellow-700",
      bg: "bg-yellow-50 border-yellow-200",
      label: "INCOMPLETE — 採点未完了",
    },
    no_data: {
      icon: AlertCircle,
      color: "text-gray-500",
      bg: "bg-gray-50 border-gray-200",
      label: "NO DATA — 未実行",
    },
  }[status];

  const Icon = statusInfo.icon;

  return (
    <Card className={statusInfo.bg}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Icon className={`h-8 w-8 shrink-0 ${statusInfo.color}`} />
          <div className="flex-1 space-y-3">
            <div>
              <p className={`text-lg font-bold ${statusInfo.color}`}>
                {statusInfo.label}
              </p>
              <p className="text-xs text-gray-600">
                採点済 {scoredCount}/{sampleCount}
                {missingKeys.length > 0 && (
                  <> · 未採点: {missingKeys.join(", ")}</>
                )}
              </p>
            </div>
            {averages.overall !== null && (
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-6">
                <AvgBox label="総合" value={averages.overall} highlight />
                <AvgBox label="事実" value={averages.factAccuracy} />
                <AvgBox label="圧縮" value={averages.compressionRate} />
                <AvgBox label="禁止" value={averages.forbiddenCompliance} />
                <AvgBox label="不足" value={averages.missingInfoDetection} />
                <AvgBox label="構造" value={averages.structureConsistency} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AvgBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
}) {
  const v = value === null ? "—" : value.toFixed(2);
  const pass = value !== null && value >= 4.0;
  return (
    <div
      className={`rounded border p-2 ${highlight ? "border-gray-400 bg-white" : "bg-white/60"}`}
    >
      <p className="text-[10px] uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={`text-base font-mono font-bold ${
          value === null
            ? "text-gray-400"
            : pass
              ? "text-green-600"
              : "text-red-600"
        }`}
      >
        {v}
      </p>
    </div>
  );
}

function SampleBlock({
  row,
  onSaved,
}: {
  row: SampleRow;
  onSaved: () => void;
}) {
  const { sample, run } = row;
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<Record<AxisKey, string>>({
    scoreFactAccuracy: run?.scoreFactAccuracy?.toString() ?? "",
    scoreCompressionRate: run?.scoreCompressionRate?.toString() ?? "",
    scoreForbiddenCompliance: run?.scoreForbiddenCompliance?.toString() ?? "",
    scoreMissingInfoDetection: run?.scoreMissingInfoDetection?.toString() ?? "",
    scoreStructureConsistency: run?.scoreStructureConsistency?.toString() ?? "",
  });
  const [notes, setNotes] = useState(run?.scoreNotes ?? "");

  async function saveScores() {
    if (!run) return;
    setSaving(true);
    try {
      const payload: Record<string, number | string | null> = { scoreNotes: notes };
      for (const axis of AXES) {
        const v = scores[axis.key];
        payload[axis.key] = v === "" ? null : Number(v);
      }
      const res = await fetch(`/api/admin/release-gate/${run.id}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "保存に失敗しました");
        return;
      }
      toast.success("採点を保存しました");
      onSaved();
    } catch {
      toast.error("ネットワークエラー");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">{sample.label}</CardTitle>
            <p className="mt-1 text-xs text-gray-500">
              <Badge variant="outline" className="mr-2">
                {sample.snsType}
              </Badge>
              <span className="font-mono">{sample.key}</span>
              {run && (
                <>
                  {" · "}
                  prompt: <span className="font-mono">{run.promptVersion}</span>
                  {" · "}
                  実行: {new Date(run.createdAt).toLocaleString("ja-JP")}
                </>
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 評価ポイントヒント */}
        <details className="rounded border bg-gray-50 p-3 text-xs">
          <summary className="cursor-pointer font-medium text-gray-700">
            評価ポイント（{sample.evaluationHints.length}件）
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600">
            {sample.evaluationHints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </details>

        {/* 相談内容原文 */}
        <details className="rounded border p-3 text-xs">
          <summary className="cursor-pointer font-medium text-gray-700">
            相談内容（原文）
          </summary>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-gray-700">
            {sample.content}
          </pre>
        </details>

        {!run && (
          <div className="rounded border border-dashed bg-gray-50 p-4 text-center text-sm text-gray-500">
            まだ実行されていません。上の「全サンプル実行」ボタンを押してください。
          </div>
        )}

        {run?.errorMessage && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            実行エラー: {run.errorMessage}
          </div>
        )}

        {run?.organizeResult && (
          <div className="rounded border bg-white p-3">
            <OrganizeResultView result={run.organizeResult} />
          </div>
        )}

        {run && !run.errorMessage && (
          <div className="space-y-3 rounded border bg-white p-3">
            <p className="text-sm font-medium text-gray-900">5 軸採点</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {AXES.map((axis) => (
                <div key={axis.key}>
                  <Label className="text-xs text-gray-600">{axis.label}</Label>
                  <select
                    className="mt-1 w-full rounded border px-2 py-1 text-sm"
                    value={scores[axis.key]}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [axis.key]: e.target.value,
                      }))
                    }
                  >
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div>
              <Label className="text-xs text-gray-600">採点メモ</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 text-sm"
                placeholder="気になった点・改善アイデアなど"
              />
            </div>
            <div className="flex items-center justify-between">
              {run.scoredAt && (
                <p className="text-xs text-gray-500">
                  最終採点: {new Date(run.scoredAt).toLocaleString("ja-JP")}
                </p>
              )}
              <Button size="sm" onClick={saveScores} disabled={saving}>
                {saving ? "保存中..." : "採点を保存"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrganizeResultView({ result }: { result: OrganizeResultLite }) {
  return (
    <div className="space-y-3 text-sm">
      <Section title="要約">
        <p className="whitespace-pre-wrap text-gray-700">{result.summary}</p>
      </Section>
      <Section title={`事実 (${result.facts.length})`}>
        <ul className="list-disc space-y-0.5 pl-5 text-gray-700">
          {result.facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </Section>
      {result.parties.length > 0 && (
        <Section title={`関係者 (${result.parties.length})`}>
          <ul className="space-y-0.5 text-gray-700">
            {result.parties.map((p, i) => (
              <li key={i}>
                <span className="font-medium">{p.role}</span>
                {p.name && <> — {p.name}</>}
                {p.handle && <> ({p.handle})</>}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {result.timeline.length > 0 && (
        <Section title={`時系列 (${result.timeline.length})`}>
          <ul className="space-y-0.5 text-gray-700">
            {result.timeline.map((t, i) => (
              <li key={i}>
                <span className="font-mono text-xs text-gray-500">
                  {t.when}
                </span>{" "}
                — {t.what}
                {t.gap && (
                  <Badge variant="outline" className="ml-2 text-[10px]">
                    gap
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {result.riskFlags.length > 0 && (
        <Section title={`Risk Flags (${result.riskFlags.length})`}>
          <ul className="space-y-0.5 text-gray-700">
            {result.riskFlags.map((r, i) => (
              <li key={i}>
                <Badge variant="outline" className="mr-2 font-mono text-[10px]">
                  {r.type}
                </Badge>
                {r.detail}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {result.suggestedQuestions.length > 0 && (
        <Section title={`確認質問 (${result.suggestedQuestions.length})`}>
          <ul className="list-decimal space-y-0.5 pl-5 text-gray-700">
            {result.suggestedQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </Section>
      )}
      {result.missingInfo.length > 0 && (
        <Section title={`不足情報 (${result.missingInfo.length})`}>
          <ul className="list-disc space-y-0.5 pl-5 text-gray-700">
            {result.missingInfo.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>
      {children}
    </div>
  );
}
