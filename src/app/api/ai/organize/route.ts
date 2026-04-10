/**
 * POST /api/ai/organize
 *
 * CAIO方針: 「AIで判断するな、AIで圧縮しろ」
 *  - ADMIN / STAFF 限定
 *  - 入力: { consultationId }  （画像は扱わない。テキストのみ）
 *  - 出力: AIOrganizeResult の永続化済みレコード
 *  - callAI() 経由で cost guard / PII filter を通る
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizeConsultation } from "@/lib/ai/organize";
import { AICostLimitError } from "@/lib/ai/cost-guard";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const consultationId = typeof body.consultationId === "string" ? body.consultationId : undefined;
  const caseId = typeof body.caseId === "string" ? body.caseId : undefined;

  if (!consultationId && !caseId) {
    return NextResponse.json(
      { error: "consultationId または caseId が必須です" },
      { status: 400 }
    );
  }

  let contentText = "";
  let resolvedConsultationId: string | null = null;
  let resolvedCaseId: string | null = null;

  if (consultationId) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { id: true, content: true, snsType: true },
    });
    if (!consultation) {
      return NextResponse.json({ error: "相談が見つかりません" }, { status: 404 });
    }
    resolvedConsultationId = consultation.id;
    contentText = `SNS: ${consultation.snsType}\n相談内容:\n${consultation.content}`;
  } else if (caseId) {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        snsType: true,
        description: true,
        consultation: { select: { id: true, content: true } },
      },
    });
    if (!caseData) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }
    resolvedCaseId = caseData.id;
    contentText = [
      `SNS: ${caseData.snsType}`,
      caseData.description ? `案件概要: ${caseData.description}` : null,
      caseData.consultation?.content ? `相談内容:\n${caseData.consultation.content}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (!contentText.trim()) {
    return NextResponse.json(
      { error: "整理対象のテキストがありません" },
      { status: 400 }
    );
  }

  try {
    const result = await organizeConsultation({
      content: contentText,
      userId: session.user.id,
    });

    const saved = await prisma.aIOrganizeResult.create({
      data: {
        consultationId: resolvedConsultationId,
        caseId: resolvedCaseId,
        createdBy: session.user.id,
        promptVersion: result.promptVersion,
        summary: result.summary,
        facts: JSON.stringify(result.facts),
        parties: JSON.stringify(result.parties),
        timeline: JSON.stringify(result.timeline),
        suggestedQuestions: JSON.stringify(result.suggestedQuestions),
        riskFlags: JSON.stringify(result.riskFlags),
        missingInfo: JSON.stringify(result.missingInfo),
        rawResponse: result.rawResponse,
      },
    });

    if (result.hadForbiddenWords) {
      // 禁止ワード検知は監査ログに残す（UIには表示しない）
      await prisma.appLog.create({
        data: {
          level: "warn",
          category: "ai_safety",
          message: "organize_consultation: forbidden words stripped",
          context: JSON.stringify({
            organizeResultId: saved.id,
            promptVersion: result.promptVersion,
          }),
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      id: saved.id,
      promptVersion: result.promptVersion,
      summary: result.summary,
      facts: result.facts,
      parties: result.parties,
      timeline: result.timeline,
      suggestedQuestions: result.suggestedQuestions,
      riskFlags: result.riskFlags,
      missingInfo: result.missingInfo,
      createdAt: saved.createdAt,
    });
  } catch (err) {
    if (err instanceof AICostLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    const message = err instanceof Error ? err.message : "AI整理に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
