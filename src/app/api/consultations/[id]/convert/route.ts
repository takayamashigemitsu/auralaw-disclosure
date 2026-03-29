import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const consultation = await prisma.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      return NextResponse.json(
        { error: "相談が見つかりません" },
        { status: 404 }
      );
    }

    if (consultation.status === "CONVERTED") {
      return NextResponse.json(
        { error: "この相談は既に案件化されています" },
        { status: 409 }
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
