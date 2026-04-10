import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCaseAccess, requireStaffCaseAccess } from "@/lib/case-auth";
import { getFeeItem } from "@/lib/fees";
import { auditLog } from "@/lib/audit-log";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params;
  const gate = await requireCaseAccess(caseId);
  if (!gate.ok) return gate.response;
  const { session } = gate;

  try {
    const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
    const billings = await prisma.caseBilling.findMany({
      where: isStaff ? { caseId } : { caseId, isVisibleToClient: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(billings);
  } catch {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

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

  if (!body.feeId || typeof body.feeId !== "string") {
    return NextResponse.json({ error: "料金IDは必須です" }, { status: 400 });
  }

  let label: string;
  let amount: number;

  if (body.feeId === "custom") {
    if (!body.label || typeof body.label !== "string") {
      return NextResponse.json({ error: "カスタム費用には名称が必須です" }, { status: 400 });
    }
    if (body.amount === undefined || typeof body.amount !== "number") {
      return NextResponse.json({ error: "カスタム費用には金額が必須です" }, { status: 400 });
    }
    label = body.label;
    amount = body.amount;
  } else {
    const feeItem = getFeeItem(body.feeId);
    if (!feeItem) {
      return NextResponse.json({ error: "無効な料金IDです" }, { status: 400 });
    }
    label = feeItem.name;
    amount = feeItem.amount;
  }

  if (amount < 0) {
    return NextResponse.json({ error: "金額は0以上で入力してください" }, { status: 400 });
  }

  try {
    const billing = await prisma.caseBilling.create({
      data: {
        caseId,
        feeId: body.feeId,
        label,
        amount,
        status: "ESTIMATED",
        note: (body.note as string) || null,
        isVisibleToClient: Boolean(body.isVisibleToClient) || false,
      },
    });

    await auditLog({
      action: "BILLING_CREATED",
      userId: session.user.id,
      details: { caseId, billingId: billing.id, label, amount },
      path: `/api/cases/${caseId}/billing`,
    });

    return NextResponse.json(billing);
  } catch {
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }
}
