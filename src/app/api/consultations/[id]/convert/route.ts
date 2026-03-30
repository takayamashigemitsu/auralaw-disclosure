import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTemplatesForStatus } from "@/lib/task-engine";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 原子的チェック＆更新: status が CONVERTED でない場合のみ更新
      let consultation;
      try {
        consultation = await tx.consultation.update({
          where: { id, status: { not: "CONVERTED" } },
          data: { status: "CONVERTED" },
        });
      } catch {
        // レコードが見つからない or 既に CONVERTED の場合
        return null;
      }

      const newCase = await tx.case.create({
        data: {
          clientName: consultation.name,
          snsType: consultation.snsType,
          status: "ACCEPTED",
          description: consultation.content,
          consultationId: consultation.id,
        },
      });

      // 初期ターゲット（相談時のSNSから自動作成）
      await tx.caseTarget.create({
        data: {
          caseId: newCase.id,
          snsType: consultation.snsType,
          postContent: consultation.content.slice(0, 200),
          status: "PENDING",
        },
      });

      await tx.caseTimeline.create({
        data: {
          caseId: newCase.id,
          title: "受任",
          description: "相談から案件化。委任契約の手続きへ。",
          date: new Date(),
          isVisibleToClient: true,
        },
      });

      // タスク自動生成（トランザクション内でインライン実行）
      const templates = getTemplatesForStatus("ACCEPTED");
      if (templates.length > 0) {
        const now = new Date();
        const tasksData = templates.map((t) => ({
          caseId: newCase.id,
          templateKey: t.key,
          title: t.title,
          description: t.description || null,
          category: "AUTO" as const,
          priority: t.priority,
          status: "PENDING" as const,
          caseStatus: "ACCEPTED",
          dueDate: new Date(now.getTime() + t.dueDaysOffset * 24 * 60 * 60 * 1000),
          assigneeId: session.user.id,
          sortOrder: t.sortOrder,
        }));

        await tx.caseTask.createMany({ data: tasksData });

        await tx.caseTimeline.create({
          data: {
            caseId: newCase.id,
            title: "タスク自動生成",
            description: `ステータス変更に伴い${templates.length}件のタスクを生成しました。`,
            date: now,
            isVisibleToClient: false,
          },
        });
      }

      // 監査ログ
      await tx.appLog.create({
        data: {
          level: "info",
          category: "business",
          message: `相談を案件化: consultation=${id} → case=${newCase.id}`,
          context: JSON.stringify({
            consultationId: id,
            caseId: newCase.id,
            status: "ACCEPTED",
          }),
          userId: session.user.id,
          path: `/api/consultations/${id}/convert`,
        },
      });

      return { caseId: newCase.id };
    });

    if (!result) {
      return NextResponse.json(
        { error: "この相談は既に案件化されています、または見つかりません" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, caseId: result.caseId });
  } catch {
    return NextResponse.json(
      { error: "案件化に失敗しました" },
      { status: 500 }
    );
  }
}
