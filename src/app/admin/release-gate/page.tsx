/**
 * /admin/release-gate
 *
 * A6 リリースゲート: 6 サンプル実行 + 6 軸採点のダッシュボード。
 * ADMIN 限定。各サンプルの最新実行 + 採点状態を一覧表示し、
 * gate 判定（pass / fail / incomplete）を出す。PASS 時は承認ボタンで
 * ReleaseGateApproval スナップショットを作成可能。
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  RELEASE_SAMPLES,
  evaluateGate,
  type SampleScore,
} from "@/lib/ai/release-samples";
import { ORGANIZE_PROMPT_VERSION } from "@/lib/ai/organize";
import { ReleaseGateClient } from "./release-gate-client";

export const dynamic = "force-dynamic";

export default async function ReleaseGatePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/admin/login");

  // 各 sampleKey の最新 run を取得
  const runs = await prisma.aISampleRun.findMany({
    where: { sampleKey: { in: RELEASE_SAMPLES.map((s) => s.key) } },
    orderBy: { createdAt: "desc" },
    include: {
      organizeResult: {
        select: {
          id: true,
          summary: true,
          facts: true,
          parties: true,
          timeline: true,
          suggestedQuestions: true,
          riskFlags: true,
          missingInfo: true,
          createdAt: true,
        },
      },
    },
  });

  const latestByKey = new Map<string, (typeof runs)[number]>();
  for (const r of runs) {
    if (!latestByKey.has(r.sampleKey)) {
      latestByKey.set(r.sampleKey, r);
    }
  }

  // Gate 評価（6 軸）
  const scores: SampleScore[] = Array.from(latestByKey.values()).map((r) => ({
    sampleKey: r.sampleKey,
    scoreFactAccuracy: r.scoreFactAccuracy,
    scoreCompressionRate: r.scoreCompressionRate,
    scoreForbiddenCompliance: r.scoreForbiddenCompliance,
    scoreMissingInfoDetection: r.scoreMissingInfoDetection,
    scoreStructureConsistency: r.scoreStructureConsistency,
    scorePracticalPriority: r.scorePracticalPriority,
  }));
  const evaluation = evaluateGate(scores);

  // 直近の承認履歴（3 件のみ表示）
  const recentApprovals = await prisma.releaseGateApproval.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      reviewer: { select: { name: true, email: true } },
    },
  });

  // AI モード状態 (サーバ側でのみ判定、client には boolean で渡す)
  const aiMode = {
    forceStub: process.env.AI_PROVIDER_FORCE_STUB === "true",
    releaseGateUseReal: process.env.AI_RELEASE_GATE_USE_REAL === "true",
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
  };

  // Client 用シリアライズ
  const sampleRows = RELEASE_SAMPLES.map((sample) => {
    const run = latestByKey.get(sample.key);
    if (!run) {
      return { sample, run: null as null };
    }
    const organizeResult = run.organizeResult
      ? {
          id: run.organizeResult.id,
          summary: run.organizeResult.summary,
          facts: safeParseArr(run.organizeResult.facts) as string[],
          parties: safeParseArr(run.organizeResult.parties) as Array<{
            role: string;
            name?: string;
            handle?: string;
          }>,
          timeline: safeParseArr(run.organizeResult.timeline) as Array<{
            when: string;
            what: string;
            gap?: boolean;
          }>,
          suggestedQuestions: safeParseArr(
            run.organizeResult.suggestedQuestions
          ) as string[],
          riskFlags: safeParseArr(run.organizeResult.riskFlags) as Array<{
            type: string;
            detail: string;
          }>,
          missingInfo: safeParseArr(run.organizeResult.missingInfo) as string[],
          createdAt: run.organizeResult.createdAt.toISOString(),
        }
      : null;
    return {
      sample,
      run: {
        id: run.id,
        promptVersion: run.promptVersion,
        errorMessage: run.errorMessage,
        createdAt: run.createdAt.toISOString(),
        scoreFactAccuracy: run.scoreFactAccuracy,
        scoreCompressionRate: run.scoreCompressionRate,
        scoreForbiddenCompliance: run.scoreForbiddenCompliance,
        scoreMissingInfoDetection: run.scoreMissingInfoDetection,
        scoreStructureConsistency: run.scoreStructureConsistency,
        scorePracticalPriority: run.scorePracticalPriority,
        scoreNotes: run.scoreNotes,
        scoredAt: run.scoredAt?.toISOString() ?? null,
        organizeResult,
      },
    };
  });

  return (
    <ReleaseGateClient
      rows={sampleRows}
      evaluation={evaluation}
      currentPromptVersion={ORGANIZE_PROMPT_VERSION}
      aiMode={aiMode}
      recentApprovals={recentApprovals.map((a) => ({
        id: a.id,
        createdAt: a.createdAt.toISOString(),
        promptVersion: a.promptVersion,
        result: a.result,
        reviewerName: a.reviewer.name,
        reviewerEmail: a.reviewer.email,
        notes: a.notes,
      }))}
    />
  );
}

function safeParseArr(s: string): unknown[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
