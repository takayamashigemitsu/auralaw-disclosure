import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_STATUSES = ["ESTIMATED", "CONFIRMED", "INVOICED", "PAID"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; billingId: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id: caseId, billingId } = await params;

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
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; billingId: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id: caseId, billingId } = await params;

  try {
    const billing = await prisma.caseBilling.findFirst({
      where: { id: billingId, caseId },
    });
    if (!billing) {
      return NextResponse.json({ error: "費用項目が見つかりません" }, { status: 404 });
    }

    await prisma.caseBilling.delete({ where: { id: billingId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
