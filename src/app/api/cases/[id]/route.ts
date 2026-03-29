import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        timelines: { orderBy: { date: "asc" } },
        messages: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        consultation: true,
      },
    });
    if (!caseData) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(caseData);
  } catch {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const caseData = await prisma.case.update({
      where: { id },
      data: {
        status: body.status,
        description: body.description,
      },
    });
    return NextResponse.json(caseData);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
