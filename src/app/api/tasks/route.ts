import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assigneeId = searchParams.get("assigneeId");
  const overdue = searchParams.get("overdue");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));

  try {
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }
    if (overdue === "true") {
      where.dueDate = { lt: new Date() };
      where.status = { in: ["PENDING", "IN_PROGRESS"] };
    }

    const [tasks, total] = await Promise.all([
      prisma.caseTask.findMany({
        where,
        include: {
          case: { select: { id: true, clientName: true, snsType: true, status: true } },
          assignee: { select: { id: true, name: true } },
        },
        orderBy: [{ dueDate: "asc" }, { sortOrder: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.caseTask.count({ where }),
    ]);

    return NextResponse.json({ tasks, total, page, limit });
  } catch {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
