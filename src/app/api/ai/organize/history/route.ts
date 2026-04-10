/**
 * GET /api/ai/organize/history?consultationId=... | ?caseId=...
 *
 * 過去のAI整理結果を新しい順で返す。
 * ADMIN / STAFF 限定。
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const url = new URL(request.url);
  const consultationId = url.searchParams.get("consultationId");
  const caseId = url.searchParams.get("caseId");

  if (!consultationId && !caseId) {
    return NextResponse.json(
      { error: "consultationId または caseId が必須です" },
      { status: 400 }
    );
  }

  const results = await prisma.aIOrganizeResult.findMany({
    where: {
      ...(consultationId ? { consultationId } : {}),
      ...(caseId ? { caseId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      promptVersion: true,
      summary: true,
      facts: true,
      parties: true,
      timeline: true,
      suggestedQuestions: true,
      riskFlags: true,
      missingInfo: true,
      createdAt: true,
      createdByUser: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({
    results: results.map((r) => ({
      id: r.id,
      promptVersion: r.promptVersion,
      summary: r.summary,
      facts: JSON.parse(r.facts),
      parties: JSON.parse(r.parties),
      timeline: JSON.parse(r.timeline),
      suggestedQuestions: JSON.parse(r.suggestedQuestions),
      riskFlags: JSON.parse(r.riskFlags),
      missingInfo: JSON.parse(r.missingInfo),
      createdAt: r.createdAt,
      createdByName: r.createdByUser.name,
    })),
  });
}
