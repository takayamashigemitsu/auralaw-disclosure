/**
 * POST /api/cases/[id]/documents
 *
 * 案件にドキュメントをアップロードし、CaseDocument を作成する。
 * multipart/form-data: file + documentType + isSharedWithClient
 * ADMIN / STAFF 限定。
 */
import { NextResponse } from "next/server";
import { requireStaffCaseAccess } from "@/lib/case-auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await context.params;
  const gate = await requireStaffCaseAccess(caseId);
  if (!gate.ok) return gate.response;
  const { session } = gate;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const documentType = (formData.get("documentType") as string) || "CLIENT_UPLOAD";
  const isSharedWithClient = formData.get("isSharedWithClient") === "true";

  if (!file) {
    return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `対応していないファイル形式です: ${file.type}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "ファイルサイズは10MBまでです" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadFile(
      buffer,
      file.name,
      file.type,
      `cases/${caseId}`
    );

    const doc = await prisma.caseDocument.create({
      data: {
        caseId,
        fileName: file.name,
        fileUrl: url,
        fileSize: file.size,
        uploadedBy: session.user.id,
        documentType,
        isSharedWithClient,
      },
    });

    return NextResponse.json(doc);
  } catch (e) {
    console.error("[documents upload]", e);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
