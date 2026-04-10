import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * レート制限設定
 *
 * Upstash Redis を使用したスライディングウィンドウ方式
 * 環境変数未設定時はレート制限をスキップ（開発環境対応）
 */

export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/** ログイン: 1分あたり5回 */
export const loginLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "rl:login" })
  : null;

/** 相談フォーム送信: 1分あたり3回 */
export const consultationLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "60 s"), prefix: "rl:consult" })
  : null;

/** ファイルアップロード: 1分あたり10回 */
export const uploadLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "rl:upload" })
  : null;

/** 汎用API: 1分あたり30回 */
export const apiLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "60 s"), prefix: "rl:api" })
  : null;

/** /api/gate パスワード試行: 10分あたり5回（総当たり防止） */
export const gateLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "600 s"), prefix: "rl:gate" })
  : null;

/**
 * IPアドレスを取得（Vercel環境対応）
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
