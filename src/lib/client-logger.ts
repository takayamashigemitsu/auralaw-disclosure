/**
 * フロントエンド用ログクライアント
 *
 * UIをブロックせず非同期でサーバーに送信
 * ログ送信失敗時はconsoleにフォールバック
 */

type LogLevel = "info" | "warn" | "error";
type LogCategory = "auth" | "ui" | "api" | "business" | "file";

interface ClientLogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  path?: string;
  userId?: string;
}

// バッファリング：100ms以内のログをまとめて送信
let buffer: ClientLogEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function enqueue(entry: ClientLogEntry) {
  // pathを自動付与
  if (!entry.path && typeof window !== "undefined") {
    entry.path = window.location.pathname;
  }

  buffer.push(entry);

  if (!flushTimer) {
    flushTimer = setTimeout(flush, 100);
  }
}

async function flush() {
  flushTimer = null;
  if (buffer.length === 0) return;

  const entries = [...buffer];
  buffer = [];

  // 各エントリを非同期送信（UIをブロックしない）
  for (const entry of entries) {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {
      // ログ送信失敗 → consoleにフォールバック
      console.error("[ClientLogger] Failed to send log:", entry);
    }
  }
}

export const clientLogger = {
  info(category: LogCategory, message: string, context?: Record<string, unknown>) {
    enqueue({ level: "info", category, message, context });
  },

  warn(category: LogCategory, message: string, context?: Record<string, unknown>) {
    console.warn(`[${category}] ${message}`, context);
    enqueue({ level: "warn", category, message, context });
  },

  error(category: LogCategory, message: string, error?: unknown, context?: Record<string, unknown>) {
    const errorInfo = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack?.split("\n").slice(0, 3).join("\n") }
      : error ? String(error) : undefined;

    console.error(`[${category}] ${message}`, errorInfo);
    enqueue({
      level: "error",
      category,
      message,
      context: { ...context, error: errorInfo },
    });
  },
};
