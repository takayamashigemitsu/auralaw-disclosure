"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Globe, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SNS_OPTIONS, getSnsLabel } from "@/lib/constants";

const TARGET_STATUS = {
  PENDING: { label: "未開示", color: "bg-gray-100 text-gray-700" },
  DISCLOSED: { label: "開示済", color: "bg-blue-100 text-blue-700" },
  IDENTIFIED: { label: "特定済", color: "bg-green-100 text-green-700" },
  SETTLED: { label: "解決済", color: "bg-gray-100 text-gray-500" },
} as const;

type Target = {
  id: string;
  snsType: string;
  url: string | null;
  postContent: string | null;
  defendant: string | null;
  status: string;
  note: string | null;
};

export function CaseTargetsSection({
  caseId,
  targets,
}: {
  caseId: string;
  targets: Target[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    snsType: "",
    url: "",
    postContent: "",
    defendant: "",
    note: "",
  });

  async function handleAdd() {
    if (!form.snsType) {
      toast.error("対象サイトを選択してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("対象を追加しました");
      setForm({ snsType: "", url: "", postContent: "", defendant: "", note: "" });
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(targetId: string) {
    if (!confirm("この対象を削除しますか？")) return;
    try {
      const res = await fetch(`/api/cases/${caseId}/targets/${targetId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("削除しました");
      router.refresh();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  async function handleStatusChange(targetId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/cases/${caseId}/targets/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("ステータスを更新しました");
      router.refresh();
    } catch {
      toast.error("更新に失敗しました");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          <Globe className="mr-2 inline h-4 w-4" />
          対象サイト・投稿（{targets.length}件）
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-3 w-3" />
          追加
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 既存ターゲット */}
        {targets.map((t) => {
          const ts = TARGET_STATUS[t.status as keyof typeof TARGET_STATUS] || TARGET_STATUS.PENDING;
          return (
            <div key={t.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getSnsLabel(t.snsType)}</Badge>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ts.color}`}>
                    {ts.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Select
                    value={t.status}
                    onValueChange={(v) => v && handleStatusChange(t.id, v)}
                  >
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue>{ts.label}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TARGET_STATUS).map(([val, cfg]) => (
                        <SelectItem key={val} value={val}>
                          {cfg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {t.url && (
                <p className="text-xs text-blue-600 truncate">
                  <a href={t.url} target="_blank" rel="noopener noreferrer">{t.url}</a>
                </p>
              )}
              {t.postContent && (
                <p className="text-xs text-gray-600 line-clamp-2">{t.postContent}</p>
              )}
              {t.defendant && (
                <p className="text-xs text-gray-500">被告: {t.defendant}</p>
              )}
              {t.note && (
                <p className="text-xs text-gray-400">備考: {t.note}</p>
              )}
            </div>
          );
        })}

        {targets.length === 0 && !showForm && (
          <p className="text-sm text-gray-500 text-center py-3">
            対象サイト・投稿が登録されていません。
          </p>
        )}

        {/* 追加フォーム */}
        {showForm && (
          <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">対象サイト *</Label>
              <Select value={form.snsType} onValueChange={(v) => v && setForm({ ...form, snsType: v })}>
                <SelectTrigger>
                  <SelectValue>
                    {form.snsType ? getSnsLabel(form.snsType) : "サイトを選択"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SNS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">対象投稿URL</Label>
              <Input
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">投稿内容（概要）</Label>
              <Textarea
                placeholder="誹謗中傷の内容を記載..."
                rows={2}
                value={form.postContent}
                onChange={(e) => setForm({ ...form, postContent: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">被告名（判明している場合）</Label>
              <Input
                placeholder="ハンドルネームや本名"
                value={form.defendant}
                onChange={(e) => setForm({ ...form, defendant: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">備考</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading}>
                {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                追加
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
