import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GENERATORS } from "@/lib/docgen";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { templateCategory, values, caseId } = await request.json();

  const generator = GENERATORS[templateCategory];
  if (!generator) {
    return NextResponse.json(
      { error: "対応していないテンプレートです" },
      { status: 400 }
    );
  }

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
}
