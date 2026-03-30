import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { auditLog } from "@/lib/audit-log";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id: caseId } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body.snsType || typeof body.snsType !== "string") {
    return NextResponse.json({ error: "対象サイトは必須です" }, { status: 400 });
  }

  // 案件存在確認
  const caseData = await prisma.case.findUnique({ where: { id: caseId } });
  if (!caseData) {
    return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
  }

  try {
    const target = await prisma.caseTarget.create({
      data: {
        caseId,
        snsType: body.snsType as string,
        url: (body.url as string) || null,
        postContent: (body.postContent as string) || null,
        defendant: (body.defendant as string) || null,
        note: (body.note as string) || null,
      },
    });

    await auditLog({
      action: "TARGET_CREATED",
      userId: session.user.id,
      details: { caseId, targetId: target.id, snsType: body.snsType },
      path: `/api/cases/${caseId}/targets`,
    });

    return NextResponse.json(target);
  } catch {
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id: caseId } = await params;

  // CLIENT は自分の案件のみ閲覧可能
  const role = session.user.role;
  if (role === "CLIENT") {
    const caseData = await prisma.case.findFirst({
      where: { id: caseId, clientUserId: session.user.id },
    });
    if (!caseData) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }
  }

  try {
    const targets = await prisma.caseTarget.findMany({
      where: { caseId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(targets);
  } catch {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
