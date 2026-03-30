import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateAndSendOTP } from "@/lib/otp";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // Only ADMIN/STAFF need 2FA
  if (!["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ verified: true });
  }

  try {
    await generateAndSendOTP(session.user.id, session.user.email!);
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: "OTP送信に失敗しました" }, { status: 500 });
  }
}
