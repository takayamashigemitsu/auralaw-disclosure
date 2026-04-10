"use client";

/**
 * A6 リリースゲート Client コンポーネント (6 軸 + 運用の芯 版)
 *
 * - 全サンプルに対する「全件実行」ボタン
 * - 各サンプルの AI 出力表示 + 弁護士採点ガイド (EvaluationHints 4 セクション)
 * - 各サンプルの 6 軸採点フォーム
 * - Gate 総合判定（pass/fail/incomplete/no_data） + 失敗理由
 * - PASS 時: 本番 AI 解放承認ボタン (ReleaseGateApproval 作成)
 * - 直近の承認履歴
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type {
  ReleaseSample,
  GateEvaluation,
  EvaluationHints,
} from "@/lib/ai/release-samples";
import { toast } from "sonner";
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Clock,
  ListChecks,
  SearchCheck,
  AlertTriangle,
  Ban,
} from "lucide-react";

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
    scorePracticalPriority: number | null;
    scoreNotes: string | null;
    scoredAt: string | null;
    organizeResult: OrganizeResultLite | null;
  } | null;
};

type RecentApproval = {
  id: string;
  createdAt: string;
  promptVersion: string;
  result: string;
  reviewerName: string | null;
  reviewerEmail: string | null;
  notes: string | null;
};

type AiMode = {
  forceStub: boolean;
  releaseGateUseReal: boolean;
  hasApiKey: boolean;
};

const AXES = [
  { key: "scoreFactAccuracy", label: "事実正確性", short: "事実" },
  { key: "scoreCompressionRate", label: "圧縮率", short: "圧縮" },
  { key: "scoreForbiddenCompliance", label: "禁止ワード遵守", short: "禁止" },
  { key: "scoreMissingInfoDetection", label: "不足情報指摘力", short: "不足" },
  { key: "scoreStructureConsistency", label: "構造整合", short: "構造" },
  { key: "scorePracticalPriority", label: "実務優先順位", short: "実務" },
] as const;

type AxisKey = (typeof AXES)[number]["key"];

export function ReleaseGateClient({
  rows,
  evaluation,
  currentPromptVersion,
  aiMode,
  recentApprovals,
}: {
  rows: SampleRow[];
  evaluation: GateEvaluation;
  currentPromptVersion: string;
  aiMode: AiMode;
  recentApprovals: RecentApproval[];
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
            {rows.length} サンプルを AI 整理に通し、6 軸（事実正確性・圧縮率・禁止ワード遵守・不足情報指摘・構造整合・実務優先順位）で採点します。
            <br />
            現在の prompt version:{" "}
            <span className="font-mono text-gray-700">{currentPromptVersion}</span>
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

      <AiModeBanner aiMode={aiMode} />

      <GateStatusCard
        evaluation={evaluation}
        currentPromptVersion={currentPromptVersion}
        rows={rows}
      />

      <div className="space-y-8">
        {rows.map((row) => (
          <SampleBlock
            key={row.sample.key}
            row={row}
            onSaved={() => router.refresh()}
          />
        ))}
      </div>

      <RecentApprovalsSection approvals={recentApprovals} />
    </div>
  );
}

// ==================================================================
// AI モード表示バナー (Stub / 本物 / 混在 を視覚化)
// ==================================================================

function AiModeBanner({ aiMode }: { aiMode: AiMode }) {
  const { forceStub, releaseGateUseReal, hasApiKey } = aiMode;

  // 実効モード判定:
  //  - forceStub=true + releaseGateUseReal=true + hasApiKey=true → bypass (ゲートのみ本物)
  //  - forceStub=false + hasApiKey=true → 本番AI解放済み (全体で本物)
  //  - hasApiKey=false → 強制Stub (何もできない)
  //  - それ以外 → Stub モード

  if (!hasApiKey) {
    return (
      <Card className="border-gray-300 bg-gray-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <AlertCircle className="h-5 w-5 shrink-0 text-gray-500" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-gray-700">
              Stub モード (ANTHROPIC_API_KEY 未設定)
            </p>
            <p className="text-xs text-gray-500">
              実際の AI 整理は実行されません。Vercel 環境変数{" "}
              <span className="font-mono">ANTHROPIC_API_KEY</span> を設定してください。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (forceStub && releaseGateUseReal) {
    return (
      <Card className="border-blue-300 bg-blue-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <ShieldCheck className="h-5 w-5 shrink-0 text-blue-700" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-blue-900">
              リリースゲート専用バイパスモード (推奨)
            </p>
            <p className="text-xs text-blue-800">
              全体は Stub のまま、**このエンドポイントだけ** 本物の Anthropic を呼びます。
              /consultations 等の本番エンドポイントは引き続き Stub です。
              cost guard は通常通り適用されます。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (forceStub && !releaseGateUseReal) {
    return (
      <Card className="border-yellow-300 bg-yellow-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-700" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-yellow-900">
              全体 Stub モード — ゲート実行しても採点不可
            </p>
            <p className="text-xs text-yellow-800">
              現在 <span className="font-mono">AI_PROVIDER_FORCE_STUB=true</span>{" "}
              のため、全サンプル実行を押しても stub プレースホルダーが返ります。
              <br />
              ゲート採点するには Vercel 環境変数に{" "}
              <span className="font-mono">AI_RELEASE_GATE_USE_REAL=true</span>{" "}
              を追加して Redeploy してください。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // forceStub=false → 本番 AI 完全解放中
  return (
    <Card className="border-green-300 bg-green-50">
      <CardContent className="flex items-center gap-3 pt-6">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-700" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-green-900">
            本番 AI 解放中 (AI_PROVIDER_FORCE_STUB=false)
          </p>
          <p className="text-xs text-green-800">
            全エンドポイントで本物の Anthropic が呼ばれます。
            並行運用期間中は CLAUDE.md の R5 ルールに従ってください。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================================================================
// Gate 総合判定カード (失敗理由・承認ボタン含む)
// ==================================================================

function GateStatusCard({
  evaluation,
  currentPromptVersion,
  rows,
}: {
  evaluation: GateEvaluation;
  currentPromptVersion: string;
  rows: SampleRow[];
}) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const {
    status,
    averages,
    sampleCount,
    scoredCount,
    missingKeys,
    failureReasons,
  } = evaluation;

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

  // prompt version 不一致の検出
  const runPromptVersions = new Set(
    rows.filter((r) => r.run).map((r) => r.run!.promptVersion)
  );
  const hasVersionMismatch =
    runPromptVersions.size > 0 &&
    (runPromptVersions.size > 1 || !runPromptVersions.has(currentPromptVersion));

  async function approve() {
    if (status !== "pass") return;
    if (hasVersionMismatch) {
      toast.error(
        "prompt version が一致していません。全サンプルを再実行してください"
      );
      return;
    }
    setApproving(true);
    try {
      const res = await fetch("/api/admin/release-gate/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: approvalNotes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "承認に失敗しました");
        return;
      }
      toast.success(
        "合格承認を記録しました。本番解放は Vercel 環境変数を手動更新してください"
      );
      setApprovalNotes("");
      router.refresh();
    } catch {
      toast.error("ネットワークエラー");
    } finally {
      setApproving(false);
    }
  }

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
                  <> · 未採点/未完了: {missingKeys.join(", ")}</>
                )}
              </p>
            </div>
            {averages.overall !== null && (
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-7">
                <AvgBox label="総合" value={averages.overall} highlight />
                <AvgBox
                  label="事実"
                  value={averages.factAccuracy}
                  threshold={4.0}
                />
                <AvgBox
                  label="圧縮"
                  value={averages.compressionRate}
                  threshold={3.5}
                />
                <AvgBox
                  label="禁止"
                  value={averages.forbiddenCompliance}
                  threshold={5.0}
                />
                <AvgBox
                  label="不足"
                  value={averages.missingInfoDetection}
                  threshold={4.0}
                />
                <AvgBox
                  label="構造"
                  value={averages.structureConsistency}
                  threshold={4.0}
                />
                <AvgBox
                  label="実務"
                  value={averages.practicalPriority}
                  threshold={4.0}
                />
              </div>
            )}

            {failureReasons.length > 0 && (
              <div className="rounded border border-red-200 bg-white p-3">
                <p className="flex items-center gap-1 text-xs font-semibold text-red-700">
                  <AlertTriangle className="h-3.5 w-3.5" /> 不合格理由 (
                  {failureReasons.length})
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-700">
                  {failureReasons.map((r, i) => (
                    <li key={i}>{r.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {hasVersionMismatch && (
              <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-800">
                <p className="font-semibold">
                  ⚠ prompt version 不一致: 実行済み ={" "}
                  <span className="font-mono">
                    {Array.from(runPromptVersions).join(", ")}
                  </span>{" "}
                  / 現在 ={" "}
                  <span className="font-mono">{currentPromptVersion}</span>
                </p>
                <p className="mt-1">
                  承認前に「全サンプル実行」で再実行してください。
                </p>
              </div>
            )}

            {status === "pass" && !hasVersionMismatch && (
              <div className="rounded border border-green-300 bg-white p-3 space-y-2">
                <p className="flex items-center gap-1 text-xs font-semibold text-green-800">
                  <ShieldCheck className="h-3.5 w-3.5" /> 本番 AI 解放承認
                </p>
                <p className="text-xs text-gray-600">
                  承認すると ReleaseGateApproval に immutable スナップショットを保存します。
                  本番 AI 解放は承認後、Vercel 環境変数{" "}
                  <span className="font-mono">AI_PROVIDER_FORCE_STUB=false</span>{" "}
                  を人間が手動設定することで反映されます。
                </p>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={2}
                  className="text-xs"
                  placeholder="承認メモ（任意）: レビュー方針・気になる点など"
                />
                <Button
                  size="sm"
                  onClick={approve}
                  disabled={approving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approving ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> 承認中...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-3.5 w-3.5" /> 本番解放を承認
                    </>
                  )}
                </Button>
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
  threshold = 4.0,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
  threshold?: number;
}) {
  const v = value === null ? "—" : value.toFixed(2);
  const pass = value !== null && value >= threshold;
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

// ==================================================================
// サンプルブロック
// ==================================================================

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
    scorePracticalPriority: run?.scorePracticalPriority?.toString() ?? "",
  });
  const [notes, setNotes] = useState(run?.scoreNotes ?? "");

  async function saveScores() {
    if (!run) return;
    setSaving(true);
    try {
      const payload: Record<string, number | string | null> = {
        scoreNotes: notes,
      };
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
                  prompt:{" "}
                  <span className="font-mono">{run.promptVersion}</span>
                  {" · "}
                  実行: {new Date(run.createdAt).toLocaleString("ja-JP")}
                </>
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 弁護士採点ガイド (EvaluationHints 4 セクション) */}
        <details className="rounded border bg-amber-50/50 p-3 text-xs">
          <summary className="cursor-pointer font-medium text-amber-900">
            弁護士採点ガイド (topQuestions / mustDetect / practicalSignals / forbiddenChecks)
          </summary>
          <div className="mt-3">
            <HintsView hints={sample.hints} />
          </div>
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
            <p className="text-sm font-medium text-gray-900">6 軸採点</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
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

// ==================================================================
// EvaluationHints 4 セクション表示
// ==================================================================

function HintsView({ hints }: { hints: EvaluationHints }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <HintSection
        icon={ListChecks}
        title="topQuestions"
        subtitle="面談で最初に必ず聞く質問"
        items={hints.topQuestions}
        color="text-blue-700"
      />
      <HintSection
        icon={SearchCheck}
        title="mustDetect"
        subtitle="missingInfo / riskFlags で必ず指摘すべき項目"
        items={hints.mustDetect}
        color="text-purple-700"
      />
      <HintSection
        icon={Clock}
        title="practicalSignals"
        subtitle="実務優先順位 (緊急性・次アクション・証拠保全)"
        items={hints.practicalSignals}
        color="text-orange-700"
      />
      <HintSection
        icon={Ban}
        title="forbiddenChecks"
        subtitle="1 件でも混入したら満点失う表現"
        items={hints.forbiddenChecks}
        color="text-red-700"
        mono
      />
    </div>
  );
}

function HintSection({
  icon: Icon,
  title,
  subtitle,
  items,
  color,
  mono = false,
}: {
  icon: typeof ListChecks;
  title: string;
  subtitle: string;
  items: string[];
  color: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded border bg-white p-2">
      <p className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
        <Icon className="h-3.5 w-3.5" /> {title}
        <span className="ml-1 text-[10px] font-normal text-gray-400">
          ({items.length})
        </span>
      </p>
      <p className="text-[10px] text-gray-500">{subtitle}</p>
      <ul
        className={`mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-gray-700 ${mono ? "font-mono" : ""}`}
      >
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

// ==================================================================
// AI 整理結果ビュー
// ==================================================================

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
                <Badge
                  variant="outline"
                  className="mr-2 font-mono text-[10px]"
                >
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

// ==================================================================
// 直近の承認履歴
// ==================================================================

function RecentApprovalsSection({ approvals }: { approvals: RecentApproval[] }) {
  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">直近の承認履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">まだ承認記録はありません。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">直近の承認履歴 (最新 3 件)</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {approvals.map((a) => (
            <li
              key={a.id}
              className="rounded border border-green-200 bg-green-50/50 p-3 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-700" />
                  <span className="font-semibold text-green-800">
                    {a.result}
                  </span>
                  <span className="font-mono text-gray-600">
                    {a.promptVersion}
                  </span>
                </div>
                <span className="text-gray-500">
                  {new Date(a.createdAt).toLocaleString("ja-JP")}
                </span>
              </div>
              <p className="mt-1 text-gray-700">
                承認者: {a.reviewerName ?? "—"}
                {a.reviewerEmail && (
                  <span className="ml-1 text-gray-500">
                    ({a.reviewerEmail})
                  </span>
                )}
              </p>
              {a.notes && (
                <p className="mt-1 whitespace-pre-wrap text-gray-600">
                  📝 {a.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
