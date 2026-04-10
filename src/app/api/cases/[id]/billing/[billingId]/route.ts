import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffCaseAccess } from "@/lib/case-auth";
import { auditLog } from "@/lib/audit-log";

const VALID_STATUSES = ["ESTIMATED", "CONFIRMED", "INVOICED", "PAID"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; billingId: string }> }
) {
  const { id: caseId, billingId } = await params;
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

  if (body.amount !== undefined && (typeof body.amount !== "number" || body.amount < 0)) {
    return NextResponse.json({ error: "金額は0以上の数値で入力してください" }, { status: 400 });
  }

  try {
    const billing = await prisma.caseBilling.findFirst({
      where: { id: billingId, caseId },
    });
    if (!billing) {
      return NextResponse.json({ error: "費用項目が見つかりません" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.note !== undefined) updateData.note = body.note;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.isVisibleToClient !== undefined) updateData.isVisibleToClient = body.isVisibleToClient;

    const updated = await prisma.caseBilling.update({
      where: { id: billingId },
      data: updateData,
    });

    await auditLog({
      action: "BILLING_UPDATED",
      userId: session.user.id,
      details: { caseId, billingId, changes: updateData },
      path: `/api/cases/${caseId}/billing/${billingId}`,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; billingId: string }> }
) {
  const { id: caseId, billingId } = await params;
  const gate = await requireStaffCaseAccess(caseId);
  if (!gate.ok) return gate.response;
  const { session } = gate;

  try {
    const billing = await prisma.caseBilling.findFirst({
      where: { id: billingId, caseId },
    });
    if (!billing) {
      return NextResponse.json({ error: "費用項目が見つかりません" }, { status: 404 });
    }

    await prisma.caseBilling.delete({ where: { id: billingId } });

    await auditLog({
      action: "BILLING_DELETED",
      userId: session.user.id,
      details: { caseId, billingId, label: billing.label, amount: billing.amount },
      path: `/api/cases/${caseId}/billing/${billingId}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
