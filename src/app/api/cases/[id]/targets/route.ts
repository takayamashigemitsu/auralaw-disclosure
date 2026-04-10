import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCaseAccess, requireStaffCaseAccess } from "@/lib/case-auth";
import { auditLog } from "@/lib/audit-log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params;
  const gate = await requireStaffCaseAccess(caseId);
  if (!gate.ok) return gate.response;
  const { session } = gate;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body.snsType || typeof body.snsType !== "string") {
    return NextResponse.json({ error: "対象サイトは必須です" }, { status: 400 });
  }

  try {
    const target = await prisma.caseTarget.create({
      data: {
        caseId,
        snsType: body.snsType as string,
        url: (body.url as string) || null,
        postContent: (body.postContent as string) || null,
        defendant: (body.defendant as string) || null,
        note: (body.note as string) || null,
      },
    });

    await auditLog({
      action: "TARGET_CREATED",
      userId: session.user.id,
      details: { caseId, targetId: target.id, snsType: body.snsType },
      path: `/api/cases/${caseId}/targets`,
    });

    return NextResponse.json(target);
  } catch {
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params;
  const gate = await requireCaseAccess(caseId);
  if (!gate.ok) return gate.response;

  try {
    const targets = await prisma.caseTarget.findMany({
      where: { caseId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(targets);
  } catch {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
