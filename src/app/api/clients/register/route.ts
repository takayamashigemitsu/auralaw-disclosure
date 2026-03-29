import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1, "お名前を入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "トークンが必要です" }, { status: 400 });
  }

  const invitation = await prisma.clientInvitation.findUnique({
    where: { token },
    include: { case: { select: { clientName: true } } },
  });

  if (!invitation) {
    return NextResponse.json({ error: "無効な招待リンクです" }, { status: 404 });
  }
  if (invitation.usedAt) {
    return NextResponse.json({ error: "この招待は既に使用済みです" }, { status: 410 });
  }
  if (invitation.expiresAt < new Date()) {
    return NextResponse.json({ error: "招待リンクの有効期限が切れています" }, { status: 410 });
  }

  return NextResponse.json({
    valid: true,
    email: invitation.email,
    clientName: invitation.case.clientName,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const invitation = await prisma.clientInvitation.findUnique({
      where: { token: data.token },
    });

    if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: "無効または期限切れの招待です" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const user = await prisma.user.create({
        data: {
          email: invitation.email,
          hashedPassword: hashSync(data.password, 10),
          name: data.name,
          role: "CLIENT",
        },
      });
      userId = user.id;
    }

    // Link user to case
    await prisma.case.update({
      where: { id: invitation.caseId },
      data: { clientUserId: userId },
    });

    // Mark invitation as used
    await prisma.clientInvitation.update({
      where: { id: invitation.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}
