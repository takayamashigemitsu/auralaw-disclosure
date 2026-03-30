import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GENERATORS } from "@/lib/docgen";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const templateCategory = body.templateCategory as string | undefined;
  const values = body.values as Record<string, string> | undefined;
  const caseId = body.caseId as string | undefined;

  if (!templateCategory || typeof templateCategory !== "string") {
    return NextResponse.json({ error: "テンプレートカテゴリは必須です" }, { status: 400 });
  }

  if (!values || typeof values !== "object") {
    return NextResponse.json({ error: "テンプレート値は必須です" }, { status: 400 });
  }

  const generator = GENERATORS[templateCategory];
  if (!generator) {
    return NextResponse.json(
      { error: "対応していないテンプレートです" },
      { status: 400 }
    );
  }

  try {
    const buffer = await generator(values);
    const base64 = buffer.toString("base64");
    const fileName = `${templateCategory}_${new Date().toISOString().split("T")[0]}.docx`;

    // Save to case documents if caseId provided
    if (caseId) {
      await prisma.caseDocument.create({
        data: {
          caseId,
          fileName,
          fileUrl: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`,
          fileSize: buffer.length,
          uploadedBy: "STAFF",
          documentType: "CREATED",
          isSharedWithClient: false,
          userId: session.user.id,
        },
      });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "書類生成に失敗しました" }, { status: 500 });
  }
}
