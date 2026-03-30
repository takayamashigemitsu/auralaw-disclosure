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
import {
  Plus,
  CheckSquare,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  getTaskPriorityLabel,
  getTaskPriorityColor,
  getTaskStatusLabel,
  getTaskStatusColor,
} from "@/lib/constants";

type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  caseStatus: string;
  dueDate: string;
  assigneeId: string | null;
  assignee: { id: string; name: string } | null;
  completedAt: string | null;
};

export function CaseTasksSection({
  caseId,
  tasks,
}: {
  caseId: string;
  tasks: TaskItem[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "NORMAL",
  });

  const activeTasks = tasks.filter(
    (t) => t.status === "PENDING" || t.status === "IN_PROGRESS"
  );
  const completedTasks = tasks.filter(
    (t) => t.status === "DONE" || t.status === "SKIPPED"
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function isOverdue(task: TaskItem): boolean {
    return (
      new Date(task.dueDate) < today &&
      (task.status === "PENDING" || task.status === "IN_PROGRESS")
    );
  }

  function daysUntilDue(task: TaskItem): number {
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  function dueDateLabel(task: TaskItem): string {
    const days = daysUntilDue(task);
    if (days < 0) return `${Math.abs(days)}日超過`;
    if (days === 0) return "本日";
    if (days === 1) return "明日";
    return `${days}日後`;
  }

  async function handleToggleDone(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === "DONE" ? "PENDING" : "DONE";
    setTogglingId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        newStatus === "DONE" ? "タスクを完了しました" : "タスクを未完了に戻しました"
      );
      router.refresh();
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
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

  async function handleAdd() {
    if (!form.title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }
    if (!form.dueDate) {
      toast.error("期限日を入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description || null,
          dueDate: form.dueDate,
          priority: form.priority,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("タスクを追加しました");
      setForm({ title: "", description: "", dueDate: "", priority: "NORMAL" });
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function renderTask(task: TaskItem) {
    const overdue = isOverdue(task);
    const isDone = task.status === "DONE";
    const isSkipped = task.status === "SKIPPED";

    return (
      <div
        key={task.id}
        className={`rounded-lg border p-3 space-y-2 ${
          overdue
            ? "border-red-200 bg-red-50/50"
            : isDone || isSkipped
              ? "bg-gray-50 opacity-75"
              : ""
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox for done toggle */}
          <button
            type="button"
            disabled={togglingId === task.id || isSkipped}
            onClick={() => handleToggleDone(task.id, task.status)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
              isDone
                ? "border-green-500 bg-green-500 text-white"
                : "border-gray-300 hover:border-blue-500"
            } ${togglingId === task.id ? "opacity-50" : ""} ${isSkipped ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {isDone && <Check className="h-3 w-3" />}
            {togglingId === task.id && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getTaskPriorityColor(task.priority)}`}
              >
                {getTaskPriorityLabel(task.priority)}
              </span>
              <span
                className={`text-sm font-medium ${isDone || isSkipped ? "text-gray-500 line-through" : "text-gray-900"}`}
              >
                {task.title}
              </span>
              {task.category === "MANUAL" && (
                <Badge variant="outline" className="text-xs">
                  手動
                </Badge>
              )}
            </div>

            {task.description && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              <span
                className={`flex items-center gap-1 ${overdue ? "font-medium text-red-600" : ""}`}
              >
                <Clock className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString("ja-JP")}
                {!(isDone || isSkipped) && (
                  <span
                    className={`ml-1 ${overdue ? "text-red-600" : daysUntilDue(task) <= 1 ? "text-amber-600" : ""}`}
                  >
                    ({dueDateLabel(task)})
                  </span>
                )}
              </span>
              {task.assignee && (
                <span>{task.assignee.name}</span>
              )}
              {task.completedAt && (
                <span className="text-green-600">
                  {new Date(task.completedAt).toLocaleDateString("ja-JP")} 完了
                </span>
              )}
            </div>
          </div>

          {/* Status select */}
          <div className="shrink-0">
            <Select
              value={task.status}
              onValueChange={(v) => v && handleStatusChange(task.id, v)}
            >
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue>
                  {getTaskStatusLabel(task.status)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_STATUS).map(([val, cfg]) => (
                  <SelectItem key={val} value={val}>
                    {cfg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">
            <CheckSquare className="mr-2 inline h-4 w-4" />
            タスク（{tasks.length}件 / {completedTasks.length}完了）
          </CardTitle>
          {tasks.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {tasks.length > 0
                  ? Math.round((completedTasks.length / tasks.length) * 100)
                  : 0}
                %
              </span>
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1 h-3 w-3" />
          手動タスク追加
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Active tasks */}
        {activeTasks.length > 0 ? (
          <div className="space-y-2">
            {activeTasks.map(renderTask)}
          </div>
        ) : (
          !showForm &&
          completedTasks.length === 0 && (
            <p className="py-3 text-center text-sm text-gray-500">
              タスクが登録されていません。
            </p>
          )
        )}

        {activeTasks.length === 0 && completedTasks.length > 0 && !showForm && (
          <p className="py-3 text-center text-sm text-green-600">
            すべてのタスクが完了しています
          </p>
        )}

        {/* Completed tasks (collapsible) */}
        {completedTasks.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showCompleted ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              完了済み（{completedTasks.length}件）
            </button>
            {showCompleted && (
              <div className="mt-2 space-y-2">
                {completedTasks.map(renderTask)}
              </div>
            )}
          </div>
        )}

        {/* Add task form */}
        {showForm && (
          <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">タイトル *</Label>
              <Input
                placeholder="タスクのタイトルを入力"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">説明</Label>
              <Textarea
                placeholder="タスクの詳細を入力..."
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">期限日 *</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">優先度</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => v && setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {getTaskPriorityLabel(form.priority)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY).map(([val, cfg]) => (
                      <SelectItem key={val} value={val}>
                        {cfg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading}>
                {loading && (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                )}
                追加
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setForm({
                    title: "",
                    description: "",
                    dueDate: "",
                    priority: "NORMAL",
                  });
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
