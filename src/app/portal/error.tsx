"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Portal Error]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <h2 className="text-lg font-bold text-gray-900">
        読み込みに失敗しました
      </h2>
      <p className="text-sm text-gray-500">
        しばらく経ってから再度お試しください。
      </p>
      <Button onClick={reset} size="sm">
        再読み込み
      </Button>
    </div>
  );
}
