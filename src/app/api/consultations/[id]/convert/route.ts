import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const consultation = await prisma.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      return NextResponse.json(
        { error: "相談が見つかりません" },
        { status: 404 }
      );
    }

    const newCase = await prisma.case.create({
      data: {
        clientName: consultation.name,
        snsType: consultation.snsType,
        status: "ACCEPTED",
        description: consultation.content,
        consultationId: consultation.id,
      },
    });

    await prisma.consultation.update({
      where: { id },
      data: { status: "CONVERTED" },
    });

    // Create initial timeline entry
    await prisma.caseTimeline.create({
      data: {
        caseId: newCase.id,
        title: "受任",
        description: "相談から案件化。委任契約の手続きへ。",
        date: new Date(),
        isVisibleToClient: true,
      },
    });

    return NextResponse.json({ success: true, caseId: newCase.id });
  } catch {
    return NextResponse.json(
      { error: "案件化に失敗しました" },
      { status: 500 }
    );
  }
}
