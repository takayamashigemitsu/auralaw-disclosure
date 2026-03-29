import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        status: body.status,
        memo: body.memo !== undefined ? body.memo : undefined,
      },
    });
    return NextResponse.json(consultation);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
