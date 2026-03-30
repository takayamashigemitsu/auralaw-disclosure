import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { auditLog } from "@/lib/audit-log";

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "DONE", "SKIPPED"];
const VALID_PRIORITIES = ["URGENT", "HIGH", "NORMAL", "LOW"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const task = await prisma.caseTask.findUnique({
      where: { id },
      include: {
        case: { select: { id: true, clientName: true, snsType: true, status: true } },
        assignee: { select: { id: true, name: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (body.status && !VALID_STATUSES.includes(body.status as string)) {
    return NextResponse.json({ error: "無効なステータスです" }, { status: 400 });
  }

  if (body.priority && !VALID_PRIORITIES.includes(body.priority as string)) {
    return NextResponse.json({ error: "無効な優先度です" }, { status: 400 });
  }

  try {
    const task = await prisma.caseTask.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.priority) updateData.priority = body.priority;
    if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId || null;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate as string) : null;

    // status → DONE or SKIPPED: set completedAt and completedBy
    if (body.status === "DONE" || body.status === "SKIPPED") {
      updateData.completedAt = new Date();
      updateData.completedBy = session.user.id;
    }

    const updated = await prisma.caseTask.update({
      where: { id },
      data: updateData,
    });

    await auditLog({
      action: "TASK_STATUS_CHANGE",
      userId: session.user.id,
      details: { taskId: id, caseId: task.caseId, changes: updateData },
      path: `/api/tasks/${id}`,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
