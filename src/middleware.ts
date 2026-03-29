import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 認証ミドルウェア — 全保護対象ルートの認証を一元管理
 *
 * ■ public（認証不要）
 *   - /admin/login
 *   - /portal/login, /portal/register
 *   - POST /api/consultations（公開フォーム）
 *   - POST /api/upload（公開フォーム用）
 *   - /api/auth/*（NextAuth内部）
 *   - /api/clients/register（招待トークンベース）
 *
 * ■ admin（ADMIN or STAFF）
 *   - /admin/*（login除く）
 *   - /api/consultations GET/PATCH, /api/cases/*, /api/ai/*, /api/documents/*, /api/clients/invite
 *
 * ■ portal（CLIENT）
 *   - /portal/*（login, register除く）
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // ─── 公開ルート（認証不要） ───
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/portal/login") return NextResponse.next();
  if (pathname === "/portal/register") return NextResponse.next();
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // 公開APIエンドポイント
  if (pathname === "/api/consultations" && method === "POST") return NextResponse.next();
  if (pathname === "/api/upload" && method === "POST") return NextResponse.next();
  if (pathname.startsWith("/api/clients/register")) return NextResponse.next();

  // ─── 認証チェック ───
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // APIリクエスト → 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }
    // 管理画面 → ログインへリダイレクト
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // ポータル → ログインへリダイレクト
    if (pathname.startsWith("/portal")) {
      return NextResponse.redirect(new URL("/portal/login", req.url));
    }
    return NextResponse.next();
  }

  const role = token.role as string;

  // ─── ロールチェック ───
  // 管理画面はADMIN/STAFFのみ
  if (pathname.startsWith("/admin") && !["ADMIN", "STAFF"].includes(role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 管理系APIもADMIN/STAFFのみ
  const adminApiPaths = [
    "/api/consultations",
    "/api/cases",
    "/api/ai",
    "/api/documents",
    "/api/clients/invite",
  ];
  if (adminApiPaths.some((p) => pathname.startsWith(p)) && !["ADMIN", "STAFF"].includes(role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  // ポータルはCLIENTのみ
  if (pathname.startsWith("/portal") && role !== "CLIENT") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/api/consultations/:path*",
    "/api/cases/:path*",
    "/api/ai/:path*",
    "/api/documents/:path*",
    "/api/clients/:path*",
    "/api/notifications/:path*",
    // /api/logs と /api/upload は matcher に含めない（公開）
  ],
};
