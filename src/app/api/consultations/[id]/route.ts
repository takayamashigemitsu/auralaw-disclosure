import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_STATUSES = ["NEW", "IN_PROGRESS", "RESPONDED", "CONVERTED", "CLOSED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  // 入力バリデーション
  if (body.status && (typeof body.status !== "string" || !VALID_STATUSES.includes(body.status))) {
    return NextResponse.json({ error: "無効なステータスです" }, { status: 400 });
  }
  if (body.memo !== undefined && typeof body.memo !== "string") {
    return NextResponse.json({ error: "メモは文字列で入力してください" }, { status: 400 });
  }
  if (typeof body.memo === "string" && body.memo.length > 5000) {
    return NextResponse.json({ error: "メモは5000文字以内で入力してください" }, { status: 400 });
  }

  try {
    const existing = await prisma.consultation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "相談が見つかりません" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.memo !== undefined) updateData.memo = body.memo;

    const consultation = await prisma.consultation.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(consultation);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
