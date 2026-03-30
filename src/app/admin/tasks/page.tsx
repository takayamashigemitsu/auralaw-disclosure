import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckSquare, ArrowRight } from "lucide-react";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  getTaskPriorityLabel,
  getTaskPriorityColor,
  getTaskStatusLabel,
  getTaskStatusColor,
} from "@/lib/constants";

const STATUS_FILTERS = [
  { value: "", label: "すべて" },
  { value: "PENDING", label: "未着手" },
  { value: "IN_PROGRESS", label: "進行中" },
  { value: "DONE", label: "完了" },
  { value: "SKIPPED", label: "スキップ" },
];

const PRIORITY_FILTERS = [
  { value: "", label: "すべて" },
  { value: "URGENT", label: "緊急" },
  { value: "HIGH", label: "高" },
  { value: "NORMAL", label: "通常" },
  { value: "LOW", label: "低" },
];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "";
  const priorityFilter = params.priority || "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build where clause
  const where: Record<string, unknown> = {};
  if (statusFilter && statusFilter !== "overdue") {
    where.status = statusFilter;
  }
  if (statusFilter === "overdue") {
    where.dueDate = { lt: today };
    where.status = { in: ["PENDING", "IN_PROGRESS"] };
  }
  if (priorityFilter) {
    where.priority = priorityFilter;
  }

  // Determine order based on status filter
  const isCompletedFilter = statusFilter === "DONE" || statusFilter === "SKIPPED";

  const tasks = await prisma.caseTask.findMany({
    where,
    include: {
      case: { select: { id: true, clientName: true, snsType: true, status: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: isCompletedFilter
      ? { completedAt: "desc" }
      : [{ dueDate: "asc" }],
    take: 200,
  });

  function buildFilterUrl(key: string, value: string) {
    const p = new URLSearchParams();
    if (key === "status") {
      if (value) p.set("status", value);
      if (priorityFilter) p.set("priority", priorityFilter);
    } else {
      if (statusFilter) p.set("status", statusFilter);
      if (value) p.set("priority", value);
    }
    const qs = p.toString();
    return `/admin/tasks${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          <CheckSquare className="mr-2 inline h-6 w-6" />
          タスク管理
        </h1>
        <span className="text-sm text-gray-500">{tasks.length}件表示</span>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Status filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-1">ステータス:</span>
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={buildFilterUrl("status", f.value)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                statusFilter === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </Link>
          ))}
          <Link
            href={buildFilterUrl("status", "overdue")}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              statusFilter === "overdue"
                ? "bg-red-600 text-white"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            期限超過
          </Link>
        </div>

        {/* Priority filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-1">優先度:</span>
          {PRIORITY_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={buildFilterUrl("priority", f.value)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                priorityFilter === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Task list */}
      <Card>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">該当するタスクはありません</p>
            </div>
          ) : (
            <div className="divide-y">
              {/* Header row */}
              <div className="hidden md:grid md:grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                <div className="col-span-1">優先度</div>
                <div className="col-span-3">タスク</div>
                <div className="col-span-2">案件</div>
                <div className="col-span-2">担当者</div>
                <div className="col-span-2">期限</div>
                <div className="col-span-2">ステータス</div>
              </div>

              {tasks.map((task) => {
                const isOverdue =
                  new Date(task.dueDate) < today &&
                  (task.status === "PENDING" || task.status === "IN_PROGRESS");
                const daysOver = isOverdue
                  ? Math.floor(
                      (today.getTime() - new Date(task.dueDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0;

                return (
                  <Link
                    key={task.id}
                    href={`/admin/cases/${task.case.id}`}
                    className={`grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 transition-colors hover:bg-gray-50 ${
                      isOverdue ? "bg-red-50/50" : ""
                    }`}
                  >
                    {/* Priority */}
                    <div className="md:col-span-1 flex items-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTaskPriorityColor(task.priority)}`}
                      >
                        {getTaskPriorityLabel(task.priority)}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="md:col-span-3 flex items-center min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                    </div>

                    {/* Case */}
                    <div className="md:col-span-2 flex items-center min-w-0">
                      <p className="text-sm text-gray-600 truncate">
                        {task.case.clientName}
                      </p>
                    </div>

                    {/* Assignee */}
                    <div className="md:col-span-2 flex items-center">
                      <p className="text-sm text-gray-500">
                        {task.assignee?.name || "-"}
                      </p>
                    </div>

                    {/* Due date */}
                    <div className="md:col-span-2 flex items-center gap-1">
                      <span
                        className={`text-sm ${isOverdue ? "font-medium text-red-600" : "text-gray-600"}`}
                      >
                        {new Date(task.dueDate).toLocaleDateString("ja-JP")}
                      </span>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          {daysOver}日超過
                        </Badge>
                      )}
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2 flex items-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTaskStatusColor(task.status)}`}
                      >
                        {getTaskStatusLabel(task.status)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
