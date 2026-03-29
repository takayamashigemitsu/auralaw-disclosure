"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ConsultationMemo({
  consultationId,
  initialMemo,
}: {
  consultationId: string;
  initialMemo: string;
}) {
  const [memo, setMemo] = useState(initialMemo);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/consultations/${consultationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo }),
      });
      if (!res.ok) throw new Error();
      toast.success("メモを保存しました");
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">対応メモ</CardTitle>
        <Button size="sm" variant="outline" onClick={handleSave} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Save className="mr-1 h-3 w-3" />
          )}
          保存
        </Button>
      </CardHeader>
      <CardContent>
        <Textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="対応状況や内部メモを記録..."
          rows={4}
        />
      </CardContent>
    </Card>
  );
}
