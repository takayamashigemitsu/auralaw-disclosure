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

const statuses = [
  { value: "ACCEPTED", label: "受任" },
  { value: "INJUNCTION_FILED", label: "仮処分申立" },
  { value: "DISCLOSURE_REQUESTED", label: "開示請求中" },
  { value: "DISCLOSURE_RECEIVED", label: "開示完了" },
  { value: "LAWSUIT_FILED", label: "訴訟提起" },
  { value: "SETTLED", label: "和解" },
  { value: "CLOSED", label: "終了" },
];

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
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
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
