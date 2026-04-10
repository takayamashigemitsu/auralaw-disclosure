/**
 * POST /api/admin/release-gate/approve
 *
 * A6 リリースゲート: 現在の最新スコアで evaluateGate() を再計算し、
 * 結果が "pass" であれば ReleaseGateApproval として immutable スナップショット
 * を保存する。
 *
 * 重要:
 *  - 本エンドポイントは AI_PROVIDER_FORCE_STUB を自動で外さない。
 *    本番 AI 解放は人間が Vercel 環境変数を手動変更するのが設計。
 *  - スナップショットは後日の検証用。誰がどの prompt version で
 *    どのスコアで合格判定したかを不変で記録する。
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  RELEASE_SAMPLES,
  evaluateGate,
  type SampleScore,
} from "@/lib/ai/release-samples";
import { ORGANIZE_PROMPT_VERSION } from "@/lib/ai/organize";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "ADMIN権限が必要です" }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // body 空は許容
  }
  const notes =
    typeof body.notes === "string" ? body.notes.slice(0, 2000) : null;

  // 各 sampleKey の最新 run を取得
  const runs = await prisma.aISampleRun.findMany({
    where: { sampleKey: { in: RELEASE_SAMPLES.map((s) => s.key) } },
    orderBy: { createdAt: "desc" },
  });
  const latestByKey = new Map<string, (typeof runs)[number]>();
  for (const r of runs) {
    if (!latestByKey.has(r.sampleKey)) {
      latestByKey.set(r.sampleKey, r);
    }
  }

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

  if (evaluation.status !== "pass") {
    return NextResponse.json(
      {
        error: `現在の判定は ${evaluation.status.toUpperCase()} です。PASS でない状態では承認できません。`,
        evaluation,
      },
      { status: 400 }
    );
  }

  // prompt version の確認: 最新の run が現在の ORGANIZE_PROMPT_VERSION と一致すること
  const distinctPromptVersions = new Set(
    Array.from(latestByKey.values()).map((r) => r.promptVersion)
  );
  if (
    distinctPromptVersions.size !== 1 ||
    !distinctPromptVersions.has(ORGANIZE_PROMPT_VERSION)
  ) {
    return NextResponse.json(
      {
        error: `サンプル実行時の prompt version (${Array.from(distinctPromptVersions).join(", ")}) が現在の ${ORGANIZE_PROMPT_VERSION} と一致しません。再実行後に承認してください。`,
      },
      { status: 400 }
    );
  }

  const approval = await prisma.releaseGateApproval.create({
    data: {
      promptVersion: ORGANIZE_PROMPT_VERSION,
      result: "PASS",
      samplesJson: JSON.stringify(scores),
      evaluationJson: JSON.stringify(evaluation),
      notes,
      reviewerId: session.user.id,
    },
    select: {
      id: true,
      createdAt: true,
      promptVersion: true,
      result: true,
    },
  });

  // 監査ログにも残す（app_log の audit カテゴリ）
  await prisma.appLog.create({
    data: {
      level: "info",
      category: "audit",
      message: "release_gate: PASS approved",
      context: JSON.stringify({
        approvalId: approval.id,
        promptVersion: ORGANIZE_PROMPT_VERSION,
        overall: evaluation.averages.overall,
      }),
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    approval,
    message:
      "合格承認を記録しました。本番 AI を解放するには Vercel 環境変数 AI_PROVIDER_FORCE_STUB=false を設定してください。",
  });
}

/**
 * GET /api/admin/release-gate/approve
 * 過去の承認履歴を返す（最新 20 件）
 */
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "ADMIN権限が必要です" }, { status: 403 });
  }

  const approvals = await prisma.releaseGateApproval.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      reviewer: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ approvals });
}
