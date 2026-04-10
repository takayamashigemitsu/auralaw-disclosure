/**
 * PATCH/DELETE /api/case-documents/[id]
 *
 * ADMIN / STAFF 限定。document の caseId 経由で案件存在も確認する。
 * PATCH: { documentType?, isSharedWithClient? }
 * DELETE: 書類削除（Storageからも削除）
 */
import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/case-auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";

async function loadDoc(id: string) {
  return prisma.caseDocument.findUnique({
    where: { id },
    select: { id: true, caseId: true, fileUrl: true },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff.ok) return staff.response;

  const { id } = await context.params;

  const doc = await loadDoc(id);
  if (!doc) {
    return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const data: { documentType?: string; isSharedWithClient?: boolean } = {};
  if (typeof body.documentType === "string") data.documentType = body.documentType;
  if (typeof body.isSharedWithClient === "boolean")
    data.isSharedWithClient = body.isSharedWithClient;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "更新内容がありません" }, { status: 400 });
  }

  try {
    const updated = await prisma.caseDocument.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("[case-document PATCH]", e);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff.ok) return staff.response;

  const { id } = await context.params;

  const doc = await loadDoc(id);
  if (!doc) {
    return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
  }

  // Storage 削除を先に行い、失敗したら DB は触らない（orphan 防止）
  try {
    await deleteFile(doc.fileUrl);
  } catch (e) {
    console.error("[case-document DELETE storage]", e);
    return NextResponse.json(
      { error: "Storage削除に失敗しました。しばらく時間をおいて再試行してください" },
      { status: 500 }
    );
  }

  try {
    await prisma.caseDocument.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[case-document DELETE db]", e);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
