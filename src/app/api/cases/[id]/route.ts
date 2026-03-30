import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyStatusChange } from "@/lib/notifications";
import { getTemplatesForStatus } from "@/lib/task-engine";

const VALID_STATUSES = [
  "ACCEPTED",
  "PROVIDER_REQUEST",
  "INJUNCTION_FILED",
  "DISCLOSURE_REQUESTED",
  "DISCLOSURE_RECEIVED",
  "LAWSUIT_FILED",
  "SETTLED",
  "CLOSED",
];

// 有効なステータス遷移マップ（前方遷移のみ許可）
const VALID_TRANSITIONS: Record<string, string[]> = {
  ACCEPTED: ["PROVIDER_REQUEST", "INJUNCTION_FILED"],
  PROVIDER_REQUEST: ["INJUNCTION_FILED", "DISCLOSURE_REQUESTED"],
  INJUNCTION_FILED: ["DISCLOSURE_REQUESTED"],
  DISCLOSURE_REQUESTED: ["DISCLOSURE_RECEIVED"],
  DISCLOSURE_RECEIVED: ["LAWSUIT_FILED", "SETTLED"],
  LAWSUIT_FILED: ["SETTLED"],
  SETTLED: ["CLOSED"],
  CLOSED: [],
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const role = session.user.role;

  try {
    // CLIENT は自分の案件のみ閲覧可能
    const where =
      role === "CLIENT"
        ? { id, clientUserId: session.user.id }
        : { id };

    const caseData = await prisma.case.findFirst({
      where,
      include: {
        timelines: { orderBy: { date: "asc" } },
        messages: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        consultation: true,
      },
    });
    if (!caseData) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(caseData);
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

  // 入力バリデーション
  if (body.status && (typeof body.status !== "string" || !VALID_STATUSES.includes(body.status))) {
    return NextResponse.json({ error: "無効なステータスです" }, { status: 400 });
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    return NextResponse.json({ error: "説明は文字列で入力してください" }, { status: 400 });
  }
  if (typeof body.description === "string" && body.description.length > 10000) {
    return NextResponse.json({ error: "説明は10000文字以内で入力してください" }, { status: 400 });
  }

  try {
    const oldCase = await prisma.case.findUnique({ where: { id } });
    if (!oldCase) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }
    const oldStatus = oldCase.status;
    const newStatus = body.status as string | undefined;

    // ステータス遷移バリデーション
    if (newStatus && newStatus !== oldStatus) {
      const allowedTransitions = VALID_TRANSITIONS[oldStatus] || [];
      if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json(
          { error: `ステータス遷移 ${oldStatus} → ${newStatus} は許可されていません` },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;

    // 案件更新とタスク生成をトランザクションで実行（全操作がtxを使用）
    const caseData = await prisma.$transaction(async (tx) => {
      const updated = await tx.case.update({
        where: { id },
        data: updateData,
      });

      if (newStatus && oldStatus && newStatus !== oldStatus) {
        // タスク生成をトランザクション内でインライン実行
        const templates = getTemplatesForStatus(newStatus);
        if (templates.length > 0) {
          const now = new Date();
          const tasksData = templates.map((t) => ({
            caseId: id,
            templateKey: t.key,
            title: t.title,
            description: t.description || null,
            category: "AUTO" as const,
            priority: t.priority,
            status: "PENDING" as const,
            caseStatus: newStatus,
            dueDate: new Date(now.getTime() + t.dueDaysOffset * 24 * 60 * 60 * 1000),
            assigneeId: session.user.id,
            sortOrder: t.sortOrder,
          }));

          await tx.caseTask.createMany({ data: tasksData, skipDuplicates: true });

          await tx.caseTimeline.create({
            data: {
              caseId: id,
              title: "タスク自動生成",
              description: `ステータス変更に伴い${templates.length}件のタスクを生成しました。`,
              date: now,
              isVisibleToClient: false,
            },
          });
        }

        // 監査ログもトランザクション内
        await tx.appLog.create({
          data: {
            level: "info",
            category: "audit",
            message: "CASE_STATUS_CHANGE",
            context: JSON.stringify({ caseId: id, oldStatus, newStatus }),
            userId: session.user.id,
            path: `/api/cases/${id}`,
          },
        });
      }

      return updated;
    });

    // ステータス変更時の通知（fire-and-forget、トランザクション外）
    if (newStatus && oldStatus && newStatus !== oldStatus) {
      notifyStatusChange(id, oldStatus, newStatus).catch(console.error);
    }

    return NextResponse.json(caseData);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
