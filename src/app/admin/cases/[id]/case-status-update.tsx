"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CASE_STATUS_LIST, getCaseStatusLabel } from "@/lib/constants";

export function CaseStatusUpdate({
  caseId,
  currentStatus,
}: {
  caseId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(newStatus: string | null) {
    if (!newStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("ステータスを更新しました");
      router.refresh();
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ステータス変更</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={currentStatus}
          onValueChange={handleChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue>
              {getCaseStatusLabel(currentStatus)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CASE_STATUS_LIST.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
