/**
 * GET /api/case-documents/[id]/download
 *
 * 書類の signed URL を発行してリダイレクトする。
 * アクセス権チェック:
 *  - ADMIN / STAFF: すべての書類にアクセス可
 *  - CLIENT: 自案件かつ isSharedWithClient=true の書類のみアクセス可
 *
 * 旧データ（data: URL や http:// publicUrl）はそのままリダイレクト（互換）。
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveFileUrl } from "@/lib/storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await context.params;

  const doc = await prisma.caseDocument.findUnique({
    where: { id },
    select: {
      id: true,
      fileUrl: true,
      fileName: true,
      isSharedWithClient: true,
      case: { select: { clientUserId: true } },
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
  }

  // 権限チェック
  const role = session.user.role;
  const isStaff = role === "ADMIN" || role === "STAFF";
  const isOwner =
    role === "CLIENT" &&
    doc.isSharedWithClient &&
    doc.case.clientUserId === session.user.id;

  if (!isStaff && !isOwner) {
    // 存在秘匿のため 404
    return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
  }

  try {
    const url = await resolveFileUrl(doc.fileUrl);
    // data: URLの場合はリダイレクトできないため、JSONで返す
    if (url.startsWith("data:")) {
      return NextResponse.json({ url, fileName: doc.fileName });
    }
    return NextResponse.redirect(url);
  } catch (e) {
    const message = e instanceof Error ? e.message : "ダウンロードに失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
