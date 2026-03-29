import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const timeline = await prisma.caseTimeline.create({
      data: {
        caseId: id,
        title: body.title,
        description: body.description || null,
        date: new Date(body.date),
        isVisibleToClient: body.isVisibleToClient ?? true,
      },
    });
    return NextResponse.json(timeline);
  } catch {
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }
}
