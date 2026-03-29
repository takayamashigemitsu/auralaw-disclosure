import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;
  const body = await request.json();

  try {
    const message = await prisma.caseMessage.create({
      data: {
        caseId: id,
        content: body.content,
        isFromClient: body.isFromClient ?? false,
        userId: session?.user?.id || null,
      },
    });
    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
