import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  loginLimiter,
  consultationLimiter,
  uploadLimiter,
  apiLimiter,
  getClientIp,
} from "@/lib/rate-limit";

// ─── セキュリティヘッダー ───
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'"
  );
  return response;
}

// ─── レート制限チェック ───
async function checkRateLimit(
  limiter: {
    limit: (key: string) => Promise<{ success: boolean; remaining: number }>;
  } | null,
  key: string
): Promise<NextResponse | null> {
  if (!limiter) return null;
  const { success, remaining } = await limiter.limit(key);
  if (!success) {
    const res = NextResponse.json(
      { error: "リクエストが多すぎます。しばらくしてからお試しください。" },
      { status: 429 }
    );
    res.headers.set("Retry-After", "60");
    res.headers.set("X-RateLimit-Remaining", String(remaining));
    return withSecurityHeaders(res);
  }
  return null;
}

/**
 * NextAuth v5 ミドルウェア
 *
 * auth() ラッパーにより req.auth でセッション情報を取得。
 * getToken() (v4パターン) は使用しない。
 */
export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const method = req.method;
  const ip = getClientIp(req);
  const session = req.auth; // NextAuth v5: JWT から自動デコードされたセッション

  // ─── レート制限（認証不要エンドポイント） ───

  // ログイン試行
  if (pathname === "/api/auth/callback/credentials" && method === "POST") {
    const blocked = await checkRateLimit(loginLimiter, ip);
    if (blocked) return blocked;
  }

  // 相談フォーム送信
  if (pathname === "/api/consultations" && method === "POST") {
    const blocked = await checkRateLimit(consultationLimiter, ip);
    if (blocked) return blocked;
    return withSecurityHeaders(NextResponse.next());
  }

  // ファイルアップロード
  if (pathname === "/api/upload" && method === "POST") {
    const blocked = await checkRateLimit(uploadLimiter, ip);
    if (blocked) return blocked;
    return withSecurityHeaders(NextResponse.next());
  }

  // ─── 認証済みユーザーのログインページリダイレクト ───
  if (session?.user) {
    const role = session.user.role as string;
    if (pathname === "/admin/login" && ["ADMIN", "STAFF"].includes(role)) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (pathname === "/portal/login" && role === "CLIENT") {
      return NextResponse.redirect(new URL("/portal/dashboard", req.url));
    }
  }

  // ─── 公開ルート（認証不要） ───
  if (pathname === "/admin/login") return withSecurityHeaders(NextResponse.next());
  if (pathname === "/portal/login") return withSecurityHeaders(NextResponse.next());
  if (pathname === "/portal/register")
    return withSecurityHeaders(NextResponse.next());
  if (pathname.startsWith("/api/auth"))
    return withSecurityHeaders(NextResponse.next());
  if (pathname.startsWith("/api/clients/register"))
    return withSecurityHeaders(NextResponse.next());

  // ─── 未認証 → リダイレクトまたは401 ───
  if (!session?.user) {
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

  // ─── 認証済みAPIにも汎用レート制限 ───
  if (pathname.startsWith("/api/")) {
    const blocked = await checkRateLimit(apiLimiter, `${ip}:${session.user.id}`);
    if (blocked) return blocked;
  }

  const role = session.user.role as string;

  // ─── ロールチェック ───

  // /admin/* → ADMIN/STAFF のみ
  if (pathname.startsWith("/admin") && !["ADMIN", "STAFF"].includes(role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 管理系API → ADMIN/STAFF のみ（ただしメッセージAPIはCLIENTも許可）
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

  if (isAdminApi && !isMessageEndpoint && !["ADMIN", "STAFF"].includes(role)) {
    return withSecurityHeaders(
      NextResponse.json({ error: "権限がありません" }, { status: 403 })
    );
  }

  // /portal/* → CLIENT のみ
  if (pathname.startsWith("/portal") && role !== "CLIENT") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return withSecurityHeaders(NextResponse.next());
});

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
    "/api/auth/:path*",
    "/api/upload/:path*",
  ],
};
