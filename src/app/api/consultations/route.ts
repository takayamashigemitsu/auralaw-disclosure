import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const consultationSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  phone: z.string().optional(),
  snsType: z.string().min(1, "SNSを選択してください"),
  content: z.string().min(10, "相談内容を10文字以上で入力してください"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = consultationSchema.parse(body);

    const consultation = await prisma.consultation.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        snsType: data.snsType,
        content: data.content,
        status: "NEW",
      },
    });

    return NextResponse.json({ success: true, id: consultation.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "内部エラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const consultations = await prisma.consultation.findMany({
      orderBy: { createdAt: "desc" },
      include: { case: true },
    });
    return NextResponse.json(consultations);
  } catch {
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
