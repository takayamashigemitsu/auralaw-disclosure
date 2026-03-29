import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "DISCLOSED", "IDENTIFIED", "SETTLED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; targetId: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id: caseId, targetId } = await params;

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
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; targetId: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id: caseId, targetId } = await params;

  try {
    const target = await prisma.caseTarget.findFirst({
      where: { id: targetId, caseId },
    });
    if (!target) {
      return NextResponse.json({ error: "対象が見つかりません" }, { status: 404 });
    }

    await prisma.caseTarget.delete({ where: { id: targetId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
