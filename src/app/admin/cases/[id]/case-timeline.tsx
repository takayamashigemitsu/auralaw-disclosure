"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type TimelineEntry = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  isVisibleToClient: boolean;
};

const DESCRIPTION_MAX_LENGTH = 500;

export function CaseTimelineSection({
  caseId,
  timelines,
}: {
  caseId: string;
  timelines: TimelineEntry[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [dateError, setDateError] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);

  function validateTitle(value: string): boolean {
    if (!value || value.trim().length < 1) {
      setTitleError("タイトルは1文字以上入力してください");
      return false;
    }
    setTitleError("");
    return true;
  }

  function validateDate(value: string): boolean {
    if (!value) {
      setDateError("日付を入力してください");
      return false;
    }
    const selected = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selected > today) {
      setDateError("未来の日付は指定できません");
      return false;
    }
    setDateError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = (formData.get("title") as string) || "";
    const date = (formData.get("date") as string) || "";

    const isTitleValid = validateTitle(title);
    const isDateValid = validateDate(date);

    if (!isTitleValid || !isDateValid) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          date: formData.get("date"),
          isVisibleToClient: formData.get("isVisibleToClient") === "on",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          data?.error || data?.message || `サーバーエラー (${res.status})`;
        throw new Error(message);
      }
      toast.success("タイムラインを追加しました");
      setShowForm(false);
      setTitleError("");
      setDateError("");
      setDescriptionLength(0);
      router.refresh();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "追加に失敗しました";
      toast.error(`タイムラインの追加に失敗しました: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">進捗タイムライン</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-3 w-3" />
          追加
        </Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-lg border p-4">
            <div className="space-y-1">
              <Label>タイトル</Label>
              <Input
                name="title"
                required
                placeholder="例: 仮処分決定"
                onChange={(e) => validateTitle(e.target.value)}
                className={titleError ? "border-red-500" : ""}
              />
              {titleError && (
                <p className="text-xs text-red-500">{titleError}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>詳細</Label>
              <Textarea
                name="description"
                placeholder="詳細を入力"
                rows={2}
                maxLength={DESCRIPTION_MAX_LENGTH}
                onChange={(e) => setDescriptionLength(e.target.value.length)}
              />
              <p className="text-right text-xs text-gray-400">
                {descriptionLength} / {DESCRIPTION_MAX_LENGTH}
              </p>
            </div>
            <div className="space-y-1">
              <Label>日付</Label>
              <Input
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => validateDate(e.target.value)}
                className={dateError ? "border-red-500" : ""}
              />
              {dateError && (
                <p className="text-xs text-red-500">{dateError}</p>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isVisibleToClient"
                  id="isVisibleToClient"
                  defaultChecked
                  className="rounded"
                />
                <Label htmlFor="isVisibleToClient" className="text-sm">
                  クライアントに表示する
                </Label>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                チェックを入れるとクライアントポータルに表示されます
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={loading}>
                {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                保存
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setTitleError("");
                  setDateError("");
                  setDescriptionLength(0);
                }}
              >
                キャンセル
              </Button>
            </div>
          </form>
        )}

        {timelines.length === 0 ? (
          <p className="text-sm text-gray-500">タイムラインがありません。</p>
        ) : (
          <div className="relative space-y-4 pl-6">
            <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-blue-200" />
            {timelines.map((t) => (
              <div key={t.id} className="relative">
                <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{t.title}</p>
                    {!t.isVisibleToClient && (
                      <span className="text-xs text-gray-400">(非公開)</span>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-sm text-gray-600">{t.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(t.date).toLocaleDateString("ja-JP")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
