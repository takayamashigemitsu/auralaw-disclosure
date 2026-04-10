import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffCaseAccess } from "@/lib/case-auth";
import { auditLog } from "@/lib/audit-log";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params;
  const gate = await requireStaffCaseAccess(caseId);
  if (!gate.ok) return gate.response;

  try {
    const tasks = await prisma.caseTask.findMany({
      where: { caseId },
      include: {
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { dueDate: "asc" }],
    });
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params;
  const gate = await requireStaffCaseAccess(caseId);
  if (!gate.ok) return gate.response;
  const { session, caseData } = gate;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body.title || typeof body.title !== "string" || (body.title as string).trim() === "") {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }

  if (!body.dueDate || isNaN(Date.parse(body.dueDate as string))) {
    return NextResponse.json({ error: "有効な期限日は必須です" }, { status: 400 });
  }

  const VALID_PRIORITIES = ["URGENT", "HIGH", "NORMAL", "LOW"];
  if (body.priority && !VALID_PRIORITIES.includes(body.priority as string)) {
    return NextResponse.json({ error: "無効な優先度です" }, { status: 400 });
  }

  try {
    const task = await prisma.caseTask.create({
      data: {
        caseId,
        title: (body.title as string).trim(),
        description: (body.description as string) || null,
        category: "MANUAL",
        priority: (body.priority as string) || "NORMAL",
        caseStatus: caseData.status,
        dueDate: new Date(body.dueDate as string),
        assigneeId: (body.assigneeId as string) || session.user.id,
      },
    });

    await auditLog({
      action: "TASK_CREATED",
      userId: session.user.id,
      details: { caseId, taskId: task.id, title: task.title },
      path: `/api/cases/${caseId}/tasks`,
    });

    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }
}
