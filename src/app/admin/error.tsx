"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900">
        ページの読み込みに失敗しました
      </h2>
      <p className="max-w-md text-sm text-gray-500">
        データベースへの接続に問題が発生した可能性があります。
        {error.digest && (
          <span className="mt-1 block font-mono text-xs text-gray-400">
            エラーコード: {error.digest}
          </span>
        )}
      </p>
      <Button onClick={reset} className="mt-2">
        再読み込み
      </Button>
    </div>
  );
}
