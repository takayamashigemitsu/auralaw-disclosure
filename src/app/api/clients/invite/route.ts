import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { email, caseId } = await request.json();

  if (!email || !caseId) {
    return NextResponse.json({ error: "メールアドレスと案件IDが必要です" }, { status: 400 });
  }

  const caseData = await prisma.case.findUnique({ where: { id: caseId } });
  if (!caseData) {
    return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
  }

  // Check for existing unused invitation
  const existing = await prisma.clientInvitation.findFirst({
    where: { email, caseId, usedAt: null },
  });
  if (existing) {
    return NextResponse.json({ error: "この案件への招待は既に送信済みです" }, { status: 409 });
  }

  const invitation = await prisma.clientInvitation.create({
    data: {
      email,
      caseId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://auralaw-disclosure.vercel.app";
  const registerUrl = `${appUrl}/portal/register?token=${invitation.token}`;

  await sendEmail({
    to: email,
    subject: "【弁護士法人AURA】クライアントポータルへの招待",
    html: `
      <p>${caseData.clientName} 様</p>
      <p>弁護士法人AURAのクライアントポータルにご招待します。</p>
      <p>以下のリンクからアカウントを作成し、案件の進捗確認やメッセージのやり取りが可能になります。</p>
      <p><a href="${registerUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">アカウントを作成する</a></p>
      <p style="color:#666;font-size:12px;">このリンクの有効期限は7日間です。</p>
      <p>弁護士法人AURA<br>TEL: 03-6555-5370</p>
    `,
  });

  return NextResponse.json({ success: true });
}
