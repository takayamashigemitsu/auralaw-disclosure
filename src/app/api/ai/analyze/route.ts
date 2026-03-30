import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeScreenshots } from "@/lib/ai";

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

  const consultationId = body.consultationId as string | undefined;
  const caseId = body.caseId as string | undefined;

  if (!consultationId && !caseId) {
    return NextResponse.json(
      { error: "consultationIdまたはcaseIdが必須です" },
      { status: 400 }
    );
  }

  let images: Array<{ data: string; mimeType: string }> = [];
  let context = "";

  if (consultationId) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { files: true },
    });
    if (!consultation) {
      return NextResponse.json({ error: "相談が見つかりません" }, { status: 404 });
    }
    images = consultation.files
      .filter((f) => f.mimeType.startsWith("image/"))
      .map((f) => ({ data: f.data, mimeType: f.mimeType }));
    context = `SNS: ${consultation.snsType}, 相談内容: ${consultation.content}`;
  }

  if (caseId) {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: { consultation: { include: { files: true } } },
    });
    if (!caseData) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }
    if (caseData.consultation?.files) {
      images = caseData.consultation.files
        .filter((f) => f.mimeType.startsWith("image/"))
        .map((f) => ({ data: f.data, mimeType: f.mimeType }));
    }
    context = `SNS: ${caseData.snsType}, 案件概要: ${caseData.description || ""}`;
  }

  if (images.length === 0) {
    return NextResponse.json(
      { error: "分析対象の画像がありません" },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeScreenshots(images, context);

    const analysis = await prisma.aIAnalysis.create({
      data: {
        consultationId: consultationId || null,
        caseId: caseId || null,
        userId: session.user.id,
        defamationLikelihood: result.defamationLikelihood,
        recommendedProcedure: result.recommendedProcedure,
        estimatedCost: result.estimatedCost,
        keyPoints: JSON.stringify(result.keyPoints),
        rawResponse: result.rawResponse,
        isPlaceholder: result.isPlaceholder,
      },
    });

    return NextResponse.json({ ...result, id: analysis.id });
  } catch {
    return NextResponse.json({ error: "分析に失敗しました" }, { status: 500 });
  }
}
