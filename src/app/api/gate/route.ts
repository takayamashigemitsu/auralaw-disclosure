import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// サイト閲覧パスワード（環境変数で管理、デフォルト: aura2026）
const SITE_PASSWORD = process.env.SITE_PASSWORD || "aura2026";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password !== SITE_PASSWORD) {
      return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const response = NextResponse.json({ success: true });

    // 7日間有効なcookieを設定
    cookieStore.set("site_access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "エラーが発生しました" }, { status: 400 });
  }
}
