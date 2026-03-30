import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
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

  // バリデーション
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }
  if (!body.date) {
    return NextResponse.json({ error: "日付は必須です" }, { status: 400 });
  }

  const date = new Date(body.date as string);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "無効な日付形式です" }, { status: 400 });
  }

  try {
    const timeline = await prisma.caseTimeline.create({
      data: {
        caseId: id,
        title: (body.title as string).trim(),
        description: (body.description as string)?.trim() || null,
        date,
        isVisibleToClient: (body.isVisibleToClient as boolean) ?? true,
      },
    });
    return NextResponse.json(timeline);
  } catch {
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }
}
