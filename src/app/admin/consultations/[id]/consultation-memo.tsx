"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, AlertCircle } from "lucide-react";

type SaveState = "idle" | "saving" | "saved" | "error";

export function ConsultationMemo({
  consultationId,
  initialMemo,
}: {
  consultationId: string;
  initialMemo: string;
}) {
  const [memo, setMemo] = useState(initialMemo);
  const [state, setState] = useState<SaveState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(initialMemo);
  const mountedRef = useRef(false);

  // Autosave with 1s debounce after user stops typing
  useEffect(() => {
    // Skip the mount-time effect (no change yet)
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (memo === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setState("idle");
    timerRef.current = setTimeout(async () => {
      setState("saving");
      try {
        const res = await fetch(`/api/consultations/${consultationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memo }),
        });
        if (!res.ok) throw new Error();
        lastSavedRef.current = memo;
        setState("saved");
      } catch {
        setState("error");
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [memo, consultationId]);

  // Warn on navigation with unsaved changes
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (memo !== lastSavedRef.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [memo]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">対応メモ</CardTitle>
        <StatusIndicator state={state} dirty={memo !== lastSavedRef.current} />
      </CardHeader>
      <CardContent>
        <Textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="対応状況や内部メモを記録... (自動保存)"
          rows={6}
        />
      </CardContent>
    </Card>
  );
}

function StatusIndicator({ state, dirty }: { state: SaveState; dirty: boolean }) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        保存中...
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="h-3 w-3" />
        保存に失敗しました
      </span>
    );
  }
  if (dirty) {
    return <span className="text-xs text-gray-400">未保存の変更</span>;
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <Check className="h-3 w-3" />
        保存済み
      </span>
    );
  }
  return <span className="text-xs text-gray-400">自動保存</span>;
}
