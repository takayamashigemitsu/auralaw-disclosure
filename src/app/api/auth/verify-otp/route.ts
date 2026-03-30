import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const email = body.email as string;
  const otp = body.otp as string;

  if (!email || !otp) {
    return NextResponse.json({ error: "メールアドレスとOTPコードが必要です" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.otpCode || !user.otpExpiresAt) {
    return NextResponse.json({ error: "無効なOTPです" }, { status: 400 });
  }

  if (user.otpExpiresAt < new Date()) {
    // Clear expired OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null },
    });
    return NextResponse.json({ error: "OTPの有効期限が切れています" }, { status: 400 });
  }

  if (user.otpCode !== otp) {
    return NextResponse.json({ error: "OTPコードが一致しません" }, { status: 400 });
  }

  // Clear OTP after successful verification
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpExpiresAt: null, emailVerified: new Date() },
  });

  return NextResponse.json({ verified: true });
}
