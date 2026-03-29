import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 認証ミドルウェア + セキュリティヘッダー
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
 *   - /api/consultations GET/PATCH, /api/cases/*, /api/ai/*, /api/documents/*, /api/clients/invite, /api/files/*
 *
 * ■ portal（CLIENT — ただしメッセージ送信はAPIレベルで案件所有者チェック）
 *   - /portal/*（login, register除く）
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // ─── セキュリティヘッダー付きレスポンスを生成 ───
  function withSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    return response;
  }

  // ─── 公開ルート（認証不要） ───
  if (pathname === "/admin/login") return withSecurityHeaders(NextResponse.next());
  if (pathname === "/portal/login") return withSecurityHeaders(NextResponse.next());
  if (pathname === "/portal/register") return withSecurityHeaders(NextResponse.next());
  if (pathname.startsWith("/api/auth")) return withSecurityHeaders(NextResponse.next());

  // 公開APIエンドポイント
  if (pathname === "/api/consultations" && method === "POST") return withSecurityHeaders(NextResponse.next());
  if (pathname === "/api/upload" && method === "POST") return withSecurityHeaders(NextResponse.next());
  if (pathname.startsWith("/api/clients/register")) return withSecurityHeaders(NextResponse.next());

  // ─── 認証チェック ───
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return withSecurityHeaders(
        NextResponse.json({ error: "認証が必要です" }, { status: 401 })
      );
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (pathname.startsWith("/portal")) {
      return NextResponse.redirect(new URL("/portal/login", req.url));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  const role = token.role as string;

  // ─── ロールチェック ───
  if (pathname.startsWith("/admin") && !["ADMIN", "STAFF"].includes(role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 管理系API — ADMIN/STAFFのみ（CLIENTはメッセージAPIのみエンドポイント内で許可）
  const adminApiPaths = [
    "/api/consultations",
    "/api/cases",
    "/api/ai",
    "/api/documents",
    "/api/clients/invite",
    "/api/files",
  ];

  const isAdminApi = adminApiPaths.some((p) => pathname.startsWith(p));
  const isMessageEndpoint = /^\/api\/cases\/[^/]+\/messages$/.test(pathname);

  // メッセージAPIはCLIENTも許可（案件所有者チェックはAPI内で実施）
  if (isAdminApi && !isMessageEndpoint && !["ADMIN", "STAFF"].includes(role)) {
    return withSecurityHeaders(
      NextResponse.json({ error: "権限がありません" }, { status: 403 })
    );
  }

  // ポータルはCLIENTのみ
  if (pathname.startsWith("/portal") && role !== "CLIENT") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return withSecurityHeaders(NextResponse.next());
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
    "/api/files/:path*",
  ],
};
