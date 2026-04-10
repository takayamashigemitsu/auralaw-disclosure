/**
 * POST /api/admin/release-gate/[runId]/score
 *
 * AISampleRun に 5 軸スコアを記録する（ADMIN限定）。
 * スコアは 1-5 の整数、null で未採点に戻せる。
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseScore(v: unknown): number | null | "invalid" {
  if (v === null || v === undefined) return null;
  if (typeof v !== "number") return "invalid";
  if (!Number.isInteger(v)) return "invalid";
  if (v < 1 || v > 5) return "invalid";
  return v;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ runId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "ADMIN権限が必要です" }, { status: 403 });
  }

  const { runId } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const scoreFactAccuracy = parseScore(body.scoreFactAccuracy);
  const scoreCompressionRate = parseScore(body.scoreCompressionRate);
  const scoreForbiddenCompliance = parseScore(body.scoreForbiddenCompliance);
  const scoreMissingInfoDetection = parseScore(body.scoreMissingInfoDetection);
  const scoreStructureConsistency = parseScore(body.scoreStructureConsistency);
  const scorePracticalPriority = parseScore(body.scorePracticalPriority);
  const scoreNotes =
    typeof body.scoreNotes === "string" ? body.scoreNotes.slice(0, 2000) : null;

  for (const v of [
    scoreFactAccuracy,
    scoreCompressionRate,
    scoreForbiddenCompliance,
    scoreMissingInfoDetection,
    scoreStructureConsistency,
    scorePracticalPriority,
  ]) {
    if (v === "invalid") {
      return NextResponse.json(
        { error: "スコアは 1〜5 の整数で指定してください" },
        { status: 400 }
      );
    }
  }

  const run = await prisma.aISampleRun.findUnique({
    where: { id: runId },
    select: { id: true },
  });
  if (!run) {
    return NextResponse.json({ error: "実行記録が見つかりません" }, { status: 404 });
  }

  const updated = await prisma.aISampleRun.update({
    where: { id: runId },
    data: {
      scoreFactAccuracy: scoreFactAccuracy as number | null,
      scoreCompressionRate: scoreCompressionRate as number | null,
      scoreForbiddenCompliance: scoreForbiddenCompliance as number | null,
      scoreMissingInfoDetection: scoreMissingInfoDetection as number | null,
      scoreStructureConsistency: scoreStructureConsistency as number | null,
      scorePracticalPriority: scorePracticalPriority as number | null,
      scoreNotes,
      scoredBy: session.user.id,
      scoredAt: new Date(),
    },
    select: {
      id: true,
      scoreFactAccuracy: true,
      scoreCompressionRate: true,
      scoreForbiddenCompliance: true,
      scoreMissingInfoDetection: true,
      scoreStructureConsistency: true,
      scorePracticalPriority: true,
      scoreNotes: true,
      scoredAt: true,
    },
  });

  return NextResponse.json(updated);
}
