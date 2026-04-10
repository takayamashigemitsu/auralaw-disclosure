import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCaseAccess } from "@/lib/case-auth";
import { notifyNewMessage } from "@/lib/notifications";
import { auditLog } from "@/lib/audit-log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gate = await requireCaseAccess(id);
  if (!gate.ok) return gate.response;
  const { session } = gate;

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

  // isFromClientはロールから自動判定（リクエストから操作不可）
  const isFromClient = session.user.role === "CLIENT";

  try {
    const message = await prisma.caseMessage.create({
      data: {
        caseId: id,
        content: body.content.trim(),
        isFromClient,
        userId: session.user.id,
      },
    });

    await auditLog({
      action: "MESSAGE_SENT",
      userId: session.user.id,
      details: { caseId: id, messageId: message.id, isFromClient },
      path: `/api/cases/${id}/messages`,
    });

    // Notify the other party
    notifyNewMessage(id, isFromClient).catch(console.error);

    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
