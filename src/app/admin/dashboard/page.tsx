import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Users,
  ArrowRight,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import {
  getTaskPriorityLabel,
  getTaskPriorityColor,
  getTaskStatusLabel,
  getTaskStatusColor,
  CONSULTATION_STATUS,
} from "@/lib/constants";

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    todayTasks,
    overdueTasks,
    weekTasks,
    staffUsers,
    newConsultations,
    activeCases,
  ] = await Promise.all([
    // Today's tasks
    prisma.caseTask.findMany({
      where: {
        dueDate: { gte: today, lt: tomorrow },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      include: {
        case: { select: { id: true, clientName: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
    }),
    // Overdue tasks
    prisma.caseTask.findMany({
      where: {
        dueDate: { lt: today },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      include: {
        case: { select: { id: true, clientName: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    // Week tasks (tomorrow ~ 7 days)
    prisma.caseTask.findMany({
      where: {
        dueDate: { gte: tomorrow, lt: weekEnd },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      include: {
        case: { select: { id: true, clientName: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    // Staff users with task counts
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "STAFF"] } },
      select: {
        id: true,
        name: true,
        assignedTasks: {
          where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
          select: { id: true, dueDate: true },
        },
      },
    }),
    // New consultations
    prisma.consultation.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Active cases with last task completion for stale detection
    prisma.case.findMany({
      where: { status: { notIn: ["CLOSED", "SETTLED"] } },
      select: {
        id: true,
        clientName: true,
        status: true,
        tasks: {
          where: { status: "DONE" },
          orderBy: { completedAt: "desc" },
          take: 1,
          select: { completedAt: true },
        },
        createdAt: true,
      },
    }),
  ]);

  // Compute stale cases: no task completed in 7+ days
  const staleCases = activeCases.filter((c) => {
    const lastCompleted = c.tasks[0]?.completedAt;
    if (lastCompleted) {
      return new Date(lastCompleted) < sevenDaysAgo;
    }
    // If no task has ever been completed, use case creation date
    return new Date(c.createdAt) < sevenDaysAgo;
  });

  // Compute staff stats
  const staffStats = staffUsers.map((u) => {
    const pending = u.assignedTasks.length;
    const overdue = u.assignedTasks.filter(
      (t) => new Date(t.dueDate) < today
    ).length;
    return { id: u.id, name: u.name, pending, overdue };
  });

  // Group week tasks by date
  const weekTasksByDate: Record<string, typeof weekTasks> = {};
  for (const task of weekTasks) {
    const dateKey = new Date(task.dueDate).toLocaleDateString("ja-JP", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
    if (!weekTasksByDate[dateKey]) weekTasksByDate[dateKey] = [];
    weekTasksByDate[dateKey].push(task);
  }

  // Priority sort helper for display (URGENT first)
  const priorityOrder: Record<string, number> = {
    URGENT: 0,
    HIGH: 1,
    NORMAL: 2,
    LOW: 3,
  };

  function sortByPriority<T extends { priority: string }>(tasks: T[]): T[] {
    return [...tasks].sort(
      (a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
    );
  }

  const sortedTodayTasks = sortByPriority(todayTasks);
  const sortedOverdueTasks = sortByPriority(overdueTasks);

  function daysOverdue(dueDate: Date): number {
    const diff = today.getTime() - new Date(dueDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function daysSince(date: Date | null, fallback: Date): number {
    const d = date ? new Date(date) : new Date(fallback);
    const diff = today.getTime() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      {/* Alert banner for overdue tasks */}
      {overdueTasks.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium text-red-800">
            {overdueTasks.length}件のタスクが期限超過です
          </p>
          <Link
            href="/admin/tasks?status=overdue"
            className="ml-auto text-sm text-red-700 hover:underline"
          >
            確認する <ArrowRight className="ml-1 inline h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">本日のタスク</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayTasks.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">期限超過</p>
              <p className="text-2xl font-bold text-red-600">
                {overdueTasks.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今週の期限</p>
              <p className="text-2xl font-bold text-gray-900">
                {weekTasks.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">停滞案件</p>
              <p className="text-2xl font-bold text-orange-600">
                {staleCases.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT: main content (2 cols) */}
        <div className="space-y-6 md:col-span-2">
          {/* Today's tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                <CheckCircle className="mr-2 inline h-4 w-4 text-blue-500" />
                本日のタスク
              </CardTitle>
              <Link
                href="/admin/tasks"
                className="text-sm text-blue-600 hover:underline"
              >
                すべて見る <ArrowRight className="ml-1 inline h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {sortedTodayTasks.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  本日のタスクはありません &#10003;
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedTodayTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/admin/cases/${task.case.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getTaskPriorityColor(task.priority)}`}
                        >
                          {getTaskPriorityLabel(task.priority)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {task.case.clientName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.assignee && (
                          <span className="text-xs text-gray-400">
                            {task.assignee.name}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTaskStatusColor(task.status)}`}
                        >
                          {getTaskStatusLabel(task.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue tasks */}
          {overdueTasks.length > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-red-700">
                  <AlertTriangle className="mr-2 inline h-4 w-4 text-red-500" />
                  期限超過タスク（{overdueTasks.length}件）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sortedOverdueTasks.map((task) => {
                    const days = daysOverdue(task.dueDate);
                    return (
                      <Link
                        key={task.id}
                        href={`/admin/cases/${task.case.id}`}
                        className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 p-3 transition-colors hover:bg-red-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getTaskPriorityColor(task.priority)}`}
                          >
                            {getTaskPriorityLabel(task.priority)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {task.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {task.case.clientName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {task.assignee && (
                            <span className="text-xs text-gray-400">
                              {task.assignee.name}
                            </span>
                          )}
                          <Badge variant="destructive" className="text-xs">
                            {days}日超過
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* This week's tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                <Calendar className="mr-2 inline h-4 w-4 text-amber-500" />
                今週の期限（{weekTasks.length}件）
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weekTasks.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  今週期限のタスクはありません
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(weekTasksByDate).map(([dateLabel, tasks]) => (
                    <div key={dateLabel}>
                      <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                        {dateLabel}
                      </h4>
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <Link
                            key={task.id}
                            href={`/admin/cases/${task.case.id}`}
                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getTaskPriorityColor(task.priority)}`}
                              >
                                {getTaskPriorityLabel(task.priority)}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {task.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {task.case.clientName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {task.assignee && (
                                <span className="text-xs text-gray-400">
                                  {task.assignee.name}
                                </span>
                              )}
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTaskStatusColor(task.status)}`}
                              >
                                {getTaskStatusLabel(task.status)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: sidebar (1 col) */}
        <div className="space-y-6">
          {/* Staff overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Users className="mr-2 inline h-4 w-4" />
                担当者別
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staffStats.length === 0 ? (
                <p className="text-sm text-gray-500">担当者が登録されていません</p>
              ) : (
                <div className="space-y-3">
                  {staffStats.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {staff.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          未完了: {staff.pending}
                        </span>
                        <span
                          className={`text-xs font-medium ${staff.overdue > 0 ? "text-red-600" : "text-gray-400"}`}
                        >
                          超過: {staff.overdue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stale cases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Clock className="mr-2 inline h-4 w-4 text-orange-500" />
                停滞案件
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staleCases.length === 0 ? (
                <p className="text-sm text-gray-500">停滞している案件はありません</p>
              ) : (
                <div className="space-y-3">
                  {staleCases.map((c) => {
                    const days = daysSince(
                      c.tasks[0]?.completedAt ?? null,
                      c.createdAt
                    );
                    return (
                      <Link
                        key={c.id}
                        href={`/admin/cases/${c.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.clientName}
                          </p>
                          <p className="text-xs text-orange-600">
                            {days}日間タスク未完了
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* New consultations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                <MessageSquare className="mr-2 inline h-4 w-4 text-red-500" />
                未対応の相談
              </CardTitle>
              <Link
                href="/admin/consultations"
                className="text-sm text-blue-600 hover:underline"
              >
                すべて見る <ArrowRight className="ml-1 inline h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {newConsultations.length === 0 ? (
                <p className="text-sm text-gray-500">
                  未対応の相談はありません
                </p>
              ) : (
                <div className="space-y-3">
                  {newConsultations.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                      <Badge variant="destructive">新規</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
