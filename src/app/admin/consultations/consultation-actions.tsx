"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CONSULTATION_STATUS } from "@/lib/constants";

type Consultation = {
  id: string;
  name: string;
  email: string;
  snsType: string;
  status: string;
  content: string;
};

const STATUS_OPTIONS = Object.entries(CONSULTATION_STATUS).map(
  ([value, config]) => ({ value, label: config.label })
);

function getStatusLabel(value: string): string {
  return (CONSULTATION_STATUS as Record<string, { label: string }>)[value]?.label ?? value;
}

export function ConsultationActions({
  consultation,
  hasCase,
}: {
  consultation: Consultation;
  hasCase: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(consultation.status);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  async function updateStatus(newStatus: string | null) {
    if (!newStatus) return;
    setStatus(newStatus);
    setLoading(true);
    try {
      const res = await fetch(`/api/consultations/${consultation.id}`, {
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

  async function convertToCase() {
    const confirmed = window.confirm(
      "この相談を案件化しますか？案件化すると案件が新規作成されます。"
    );
    if (!confirmed) return;

    setConverting(true);
    try {
      const res = await fetch(`/api/consultations/${consultation.id}/convert`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("案件化しました");
      router.refresh();
    } catch {
      toast.error("案件化に失敗しました");
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={updateStatus} disabled={loading}>
        <SelectTrigger className="w-32">
          <SelectValue>
            {getStatusLabel(status)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!hasCase && (
        <Button
          size="sm"
          variant="outline"
          onClick={convertToCase}
          disabled={converting}
        >
          {converting ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <Briefcase className="mr-1 h-3 w-3" />
          )}
          案件化
        </Button>
      )}
    </div>
  );
}
