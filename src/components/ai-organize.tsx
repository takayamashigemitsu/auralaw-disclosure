"use client";

/**
 * AI整理コンポーネント（A6）
 *
 * 設計原則:
 *  - 2秒以内に何か出る（skeleton即表示）
 *  - summary は3行以内、facts は最大7個
 *  - timeline は「時系列の穴」が見える（gap ハイライト）
 *  - 最上部に「弁護士確認必須」バナー常時表示
 *  - 3秒超え時に「バックグラウンド処理中」表示（QStash導入後に非同期化）
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Users,
  Clock,
  FileText,
  History,
} from "lucide-react";
import { toast } from "sonner";

type RiskFlagType =
  | "EVIDENCE_GAP"
  | "MISSING_METADATA"
  | "IDENTITY_UNCLEAR"
  | "SOURCE_UNVERIFIED"
  | "TIMELINE_INCOMPLETE";

type RiskFlag = { type: RiskFlagType; detail: string };
type TimelineEntry = { when: string; what: string; gap?: boolean };
type Party = { role: string; name?: string; handle?: string };

type OrganizeResult = {
  id: string;
  promptVersion: string;
  summary: string;
  facts: string[];
  parties: Party[];
  timeline: TimelineEntry[];
  suggestedQuestions: string[];
  riskFlags: RiskFlag[];
  missingInfo: string[];
  createdAt: string;
  createdByName?: string;
};

const RISK_LABELS: Record<RiskFlagType, string> = {
  EVIDENCE_GAP: "証拠不足",
  MISSING_METADATA: "メタデータ欠如",
  IDENTITY_UNCLEAR: "投稿者特定不可",
  SOURCE_UNVERIFIED: "出典未確認",
  TIMELINE_INCOMPLETE: "時系列に穴",
};

export function AIOrganize({
  consultationId,
  caseId,
}: {
  consultationId?: string;
  caseId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false); // 3秒超えたら true
  const [current, setCurrent] = useState<OrganizeResult | null>(null);
  const [history, setHistory] = useState<OrganizeResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const targetParam = consultationId
    ? `consultationId=${consultationId}`
    : caseId
      ? `caseId=${caseId}`
      : "";

  const loadHistory = useCallback(async () => {
    if (!targetParam) return;
    try {
      const res = await fetch(`/api/ai/organize/history?${targetParam}`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.results);
      if (data.results.length > 0 && !current) {
        setCurrent(data.results[0]);
      }
    } catch {
      // ignore
    }
  }, [targetParam, current]);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId, caseId]);

  async function runOrganize() {
    setLoading(true);
    setSlow(false);

    const slowTimer = setTimeout(() => setSlow(true), 3000);

    try {
      const res = await fetch("/api/ai/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consultationId ? { consultationId } : { caseId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "AI整理に失敗しました");
      }

      const data: OrganizeResult = await res.json();
      setCurrent(data);
      setHistory((prev) => [data, ...prev]);
      toast.success("AI整理が完了しました");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI整理に失敗しました";
      toast.error(msg);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlow(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-amber-500" />
          AI整理
        </CardTitle>
        {history.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowHistory((v) => !v)}
            className="h-7 text-xs"
          >
            <History className="mr-1 h-3 w-3" />
            履歴 ({history.length})
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 弁護士確認必須バナー（常時表示） */}
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <p>
              AI整理結果は<strong>必ず弁護士確認が必要</strong>です。法的判断は含まれません。事実整理と不足情報の提示のみです。
            </p>
          </div>
        </div>

        {/* Run button */}
        <Button
          size="sm"
          onClick={runOrganize}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              {slow ? "処理中...（時間がかかっています）" : "整理中..."}
            </>
          ) : (
            <>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {current ? "再整理する" : "AI整理を実行"}
            </>
          )}
        </Button>

        {/* Skeleton while loading (first time) */}
        {loading && !current && <OrganizeSkeleton />}

        {/* Current result */}
        {current && <OrganizeView result={current} />}

        {/* History */}
        {showHistory && history.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-600">過去の整理結果</p>
            {history.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setCurrent(h)}
                className={`w-full rounded border p-2 text-left text-xs transition hover:bg-gray-50 ${
                  current?.id === h.id ? "border-amber-400 bg-amber-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gray-500">
                    {h.promptVersion}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(h.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-gray-700">
                  {h.summary.split("\n")[0]}
                </p>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrganizeSkeleton() {
  return (
    <div className="space-y-2 pt-1">
      <div className="h-3 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-3/5 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-2 w-1/3 animate-pulse rounded bg-gray-200" />
      <div className="h-3 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

function OrganizeView({ result }: { result: OrganizeResult }) {
  return (
    <div className="space-y-4 pt-1 text-sm">
      {/* Summary — 3行以内、目立つ */}
      <section>
        <SectionLabel icon={<FileText className="h-3 w-3" />} label="要約" />
        <p className="whitespace-pre-wrap rounded bg-gray-50 p-2 text-sm leading-relaxed text-gray-800">
          {result.summary || "（要約なし）"}
        </p>
      </section>

      {/* Facts — 最大7個 */}
      {result.facts.length > 0 && (
        <section>
          <SectionLabel icon={<CheckCircle2 className="h-3 w-3" />} label="事実" />
          <ul className="space-y-1">
            {result.facts.map((f, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-gray-700">
                <span className="text-gray-400">・</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Parties */}
      {result.parties.length > 0 && (
        <section>
          <SectionLabel icon={<Users className="h-3 w-3" />} label="関係者" />
          <div className="flex flex-wrap gap-1.5">
            {result.parties.map((p, i) => (
              <span
                key={i}
                className="rounded-full border bg-white px-2 py-0.5 text-[11px] text-gray-700"
              >
                <span className="font-semibold">{p.role}</span>
                {(p.name || p.handle) && (
                  <span className="text-gray-500">
                    {" "}
                    {p.name}
                    {p.handle && ` @${p.handle}`}
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Timeline — gap が見える */}
      {result.timeline.length > 0 && (
        <section>
          <SectionLabel icon={<Clock className="h-3 w-3" />} label="時系列" />
          <ol className="space-y-1.5">
            {result.timeline.map((t, i) => (
              <li
                key={i}
                className={`rounded border-l-2 pl-2 text-xs ${
                  t.gap
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-gray-500">{t.when}</span>
                  {t.gap && (
                    <span className="rounded bg-red-100 px-1 text-[9px] font-semibold text-red-700">
                      時系列の穴
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{t.what}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Suggested Questions */}
      {result.suggestedQuestions.length > 0 && (
        <section>
          <SectionLabel icon={<HelpCircle className="h-3 w-3" />} label="確認すべき質問" />
          <ul className="space-y-1">
            {result.suggestedQuestions.map((q, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 rounded bg-blue-50 p-1.5 text-xs text-blue-900"
              >
                <span className="font-bold">Q{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Risk Flags (構造化) */}
      {result.riskFlags.length > 0 && (
        <section>
          <SectionLabel icon={<AlertCircle className="h-3 w-3" />} label="気づき" />
          <ul className="space-y-1">
            {result.riskFlags.map((r, i) => (
              <li key={i} className="rounded border border-amber-200 bg-amber-50 p-1.5 text-xs">
                <div className="mb-0.5 text-[10px] font-semibold text-amber-700">
                  {RISK_LABELS[r.type]}
                </div>
                <div className="text-gray-700">{r.detail}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Missing Info */}
      {result.missingInfo.length > 0 && (
        <section>
          <SectionLabel icon={<AlertCircle className="h-3 w-3 text-red-500" />} label="不足情報" />
          <ul className="space-y-1">
            {result.missingInfo.map((m, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-red-700">
                <span>・</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Separator />
      <div className="flex items-center justify-between text-[10px] text-gray-400">
        <span className="font-mono">{result.promptVersion}</span>
        <span>
          {new Date(result.createdAt).toLocaleString("ja-JP")}
          {result.createdByName && ` / ${result.createdByName}`}
        </span>
      </div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
      {icon}
      {label}
    </div>
  );
}
