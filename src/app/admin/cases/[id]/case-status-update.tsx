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
import { getAllowedNextStatuses } from "@/lib/status-transitions";

export function CaseStatusUpdate({
  caseId,
  currentStatus,
}: {
  caseId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const allowedStatuses = getAllowedNextStatuses(currentStatus);
  const isTerminal = allowedStatuses.length === 0;

  async function handleChange(newStatus: string | null) {
    if (!newStatus || newStatus === currentStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "更新に失敗しました");
      }
      toast.success("ステータスを更新しました");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ステータス変更</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isTerminal ? (
          <p className="text-sm text-gray-500">
            この案件は終了しています。ステータスの変更はできません。
          </p>
        ) : (
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
              <SelectItem value={currentStatus} disabled>
                {getCaseStatusLabel(currentStatus)}（現在）
              </SelectItem>
              {CASE_STATUS_LIST
                .filter((s) => allowedStatuses.includes(s.value))
                .map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    → {s.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
        {!isTerminal && (
          <p className="text-xs text-gray-400">
            次のステータス: {allowedStatuses.map((s) => getCaseStatusLabel(s)).join("、")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
