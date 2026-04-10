/**
 * POST /api/ai/organize
 *
 * CAIO方針: 「AIで判断するな、AIで圧縮しろ」
 *  - ADMIN / STAFF 限定
 *  - 入力: { consultationId }  （画像は扱わない。テキストのみ）
 *  - 出力: AIOrganizeResult の永続化済みレコード
 *  - callAI() 経由で cost guard / PII filter を通る
 */
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  organizeConsultation,
  ORGANIZE_PROMPT_VERSION,
  normalizeContentForIdempotency,
} from "@/lib/ai/organize";
import { AICostLimitError } from "@/lib/ai/cost-guard";

/**
 * Idempotency key: 連打・リトライで同一内容に対する重複 AI 呼び出しを防ぐ。
 * 構成: sha256(scope + normalizedContent + promptVersion)
 * - promptVersion を含めることで「プロンプトを改善したら再実行できる」
 * - normalizedContent で空白・改行差分を吸収
 */
function buildIdempotencyKey(
  scope: string,
  content: string,
  promptVersion: string
): string {
  const normalized = normalizeContentForIdempotency(content);
  const input = `${scope}\u0000${promptVersion}\u0000${normalized}`;
  return createHash("sha256").update(input, "utf8").digest("hex");
}

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

  // ---------------------------------------------------------------
  // Idempotency: 連打・リトライで AI コストが重複発生しないよう、
  // (scope + normalizedContent + promptVersion) の hash で事前ルックアップ。
  // ---------------------------------------------------------------
  const scope = resolvedConsultationId
    ? `consultation:${resolvedConsultationId}`
    : `case:${resolvedCaseId}`;
  const idempotencyKey = buildIdempotencyKey(
    scope,
    contentText,
    ORGANIZE_PROMPT_VERSION
  );

  const existing = await prisma.aIOrganizeResult.findUnique({
    where: { idempotencyKey },
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
    },
  });
  if (existing) {
    // 既存結果をそのまま返す（AI呼び出しをスキップ）
    return NextResponse.json({
      id: existing.id,
      promptVersion: existing.promptVersion,
      summary: existing.summary,
      facts: safeParseArray(existing.facts),
      parties: safeParseArray(existing.parties),
      timeline: safeParseArray(existing.timeline),
      suggestedQuestions: safeParseArray(existing.suggestedQuestions),
      riskFlags: safeParseArray(existing.riskFlags),
      missingInfo: safeParseArray(existing.missingInfo),
      createdAt: existing.createdAt,
      idempotent: true,
    });
  }

  try {
    const result = await organizeConsultation({
      content: contentText,
      userId: session.user.id,
    });

    // ---------------------------------------------------------------
    // C3: AIOrganizeResult 保存 + ai_safety ログを 1 トランザクションで
    // 書き込む。片方だけ成功してもう片方が失敗する不整合を防ぐ。
    // ---------------------------------------------------------------
    const saved = await prisma.$transaction(async (tx) => {
      const created = await tx.aIOrganizeResult.create({
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
          idempotencyKey,
        },
      });

      if (result.hadForbiddenWords) {
        // 禁止ワード検知は監査ログに残す（UIには表示しない）
        await tx.appLog.create({
          data: {
            level: "warn",
            category: "ai_safety",
            message: "organize_consultation: forbidden words stripped",
            context: JSON.stringify({
              organizeResultId: created.id,
              promptVersion: result.promptVersion,
            }),
            userId: session.user.id,
          },
        });
      }

      return created;
    });

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
    // 並行して同じ idempotencyKey が挿入された場合（P2002）は既存レコードを返す
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const race = await prisma.aIOrganizeResult.findUnique({
        where: { idempotencyKey },
      });
      if (race) {
        return NextResponse.json({
          id: race.id,
          promptVersion: race.promptVersion,
          summary: race.summary,
          facts: safeParseArray(race.facts),
          parties: safeParseArray(race.parties),
          timeline: safeParseArray(race.timeline),
          suggestedQuestions: safeParseArray(race.suggestedQuestions),
          riskFlags: safeParseArray(race.riskFlags),
          missingInfo: safeParseArray(race.missingInfo),
          createdAt: race.createdAt,
          idempotent: true,
        });
      }
    }
    console.error("[api/ai/organize] error", err);
    return NextResponse.json(
      { error: "AI整理に失敗しました" },
      { status: 500 }
    );
  }
}

function safeParseArray(s: string): unknown[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
