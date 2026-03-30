import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyNewMessage } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body.content || typeof body.content !== "string" || body.content.trim().length === 0) {
    return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  }

  // メッセージ長制限（10,000文字）
  if (body.content.length > 10000) {
    return NextResponse.json({ error: "メッセージが長すぎます" }, { status: 400 });
  }

  // 認可チェック: CLIENTは自分の案件のみ、ADMIN/STAFFは全案件
  const role = session.user.role;
  if (role === "CLIENT") {
    const caseData = await prisma.case.findFirst({
      where: { id, clientUserId: session.user.id },
    });
    if (!caseData) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }
  }

  // isFromClientはロールから自動判定（リクエストから操作不可）
  const isFromClient = role === "CLIENT";

  try {
    const message = await prisma.caseMessage.create({
      data: {
        caseId: id,
        content: body.content.trim(),
        isFromClient,
        userId: session.user.id,
      },
    });

    // Notify the other party
    notifyNewMessage(id, isFromClient).catch(console.error);

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
