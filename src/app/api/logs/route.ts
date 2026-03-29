import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import type { LogCategory } from "@/lib/logger";

/**
 * フロントエンドからのログ受信エンドポイント
 * POST /api/logs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { level, category, message, context, path, userId } = body;

    if (!level || !category || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || undefined;

    // フロントエンドログはUIカテゴリを強制付与
    const safeCategory = (["auth", "ui", "api", "business", "file"].includes(category)
      ? category
      : "ui") as LogCategory;

    if (level === "error") {
      await logger.error(safeCategory, `[Frontend] ${message}`, undefined, {
        context,
        path,
        userId,
        userAgent,
      });
    } else if (level === "warn") {
      await logger.warn(safeCategory, `[Frontend] ${message}`, {
        context,
        path,
        userId,
        userAgent,
      });
    } else {
      await logger.info(safeCategory, `[Frontend] ${message}`, {
        context,
        path,
        userId,
        userAgent,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
