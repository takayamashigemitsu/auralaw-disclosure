import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyStatusChange } from "@/lib/notifications";
import { generateTasksForStatusChange } from "@/lib/task-engine";

const VALID_STATUSES = [
  "ACCEPTED",
  "PROVIDER_REQUEST",
  "INJUNCTION_FILED",
  "DISCLOSURE_REQUESTED",
  "DISCLOSURE_RECEIVED",
  "LAWSUIT_FILED",
  "SETTLED",
  "CLOSED",
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const role = session.user.role;

  try {
    // CLIENT は自分の案件のみ閲覧可能
    const where =
      role === "CLIENT"
        ? { id, clientUserId: session.user.id }
        : { id };

    const caseData = await prisma.case.findFirst({
      where,
      include: {
        timelines: { orderBy: { date: "asc" } },
        messages: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        consultation: true,
      },
    });
    if (!caseData) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(caseData);
  } catch {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

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
  if (body.description !== undefined && typeof body.description !== "string") {
    return NextResponse.json({ error: "説明は文字列で入力してください" }, { status: 400 });
  }
  if (typeof body.description === "string" && body.description.length > 10000) {
    return NextResponse.json({ error: "説明は10000文字以内で入力してください" }, { status: 400 });
  }

  try {
    const oldCase = await prisma.case.findUnique({ where: { id } });
    if (!oldCase) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }
    const oldStatus = oldCase.status;

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;

    const caseData = await prisma.case.update({
      where: { id },
      data: updateData,
    });

    if (body.status && oldStatus && body.status !== oldStatus) {
      notifyStatusChange(id, oldStatus, body.status as string).catch(console.error);
      // タスク自動生成
      generateTasksForStatusChange(id, body.status as string, new Date(), session.user.id).catch(console.error);
    }

    return NextResponse.json(caseData);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
