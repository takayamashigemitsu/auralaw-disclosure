import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffCaseAccess } from "@/lib/case-auth";
import { auditLog } from "@/lib/audit-log";

const VALID_STATUSES = ["PENDING", "DISCLOSED", "IDENTIFIED", "SETTLED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; targetId: string }> }
) {
  const { id: caseId, targetId } = await params;
  const gate = await requireStaffCaseAccess(caseId);
  if (!gate.ok) return gate.response;
  const { session } = gate;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (body.status && !VALID_STATUSES.includes(body.status as string)) {
    return NextResponse.json({ error: "無効なステータスです" }, { status: 400 });
  }

  try {
    const target = await prisma.caseTarget.findFirst({
      where: { id: targetId, caseId },
    });
    if (!target) {
      return NextResponse.json({ error: "対象が見つかりません" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.postContent !== undefined) updateData.postContent = body.postContent;
    if (body.defendant !== undefined) updateData.defendant = body.defendant;
    if (body.note !== undefined) updateData.note = body.note;

    const updated = await prisma.caseTarget.update({
      where: { id: targetId },
      data: updateData,
    });

    await auditLog({
      action: "TARGET_UPDATED",
      userId: session.user.id,
      details: { caseId, targetId, changes: updateData },
      path: `/api/cases/${caseId}/targets/${targetId}`,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; targetId: string }> }
) {
  const { id: caseId, targetId } = await params;
  const gate = await requireStaffCaseAccess(caseId);
  if (!gate.ok) return gate.response;
  const { session } = gate;

  try {
    const target = await prisma.caseTarget.findFirst({
      where: { id: targetId, caseId },
    });
    if (!target) {
      return NextResponse.json({ error: "対象が見つかりません" }, { status: 404 });
    }

    await prisma.caseTarget.delete({ where: { id: targetId } });

    await auditLog({
      action: "TARGET_DELETED",
      userId: session.user.id,
      details: { caseId, targetId, snsType: target.snsType },
      path: `/api/cases/${caseId}/targets/${targetId}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
