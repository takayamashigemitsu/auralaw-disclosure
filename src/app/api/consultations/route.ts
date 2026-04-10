import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const fileSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  data: z.string(),
});

const consultationSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  phone: z.string().optional(),
  snsType: z.string().min(1, "SNSを選択してください"),
  content: z.string().min(10, "相談内容を10文字以上で入力してください"),
  files: z.array(fileSchema).optional(),
  // ─── 同意（個人情報保護方針・利用規約・AI利用） ───
  consentPrivacy: z
    .literal(true, { message: "個人情報保護方針への同意が必要です" }),
  consentTerms: z
    .literal(true, { message: "利用規約への同意が必要です" }),
  consentAI: z
    .literal(true, { message: "生成AIによる処理への同意が必要です" }),
});

// 同意バージョン。プライバシーポリシー・利用規約改定時に更新すること。
const CONSENT_VERSION = "2026-04-10";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot check (hidden field that bots fill in)
    if (body.website || body.company) {
      // Silently reject spam - return success to not tip off bots
      return NextResponse.json({ success: true });
    }

    const data = consultationSchema.parse(body);

    const consultation = await prisma.consultation.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        snsType: data.snsType,
        content: data.content,
        status: "NEW",
        consentedAt: new Date(),
        consentVersion: CONSENT_VERSION,
        consentPrivacy: data.consentPrivacy,
        consentTerms: data.consentTerms,
        consentAI: data.consentAI,
        files: data.files?.length
          ? {
              create: data.files.map((f) => ({
                fileName: f.fileName,
                fileSize: f.fileSize,
                mimeType: f.mimeType,
                data: f.data,
              })),
            }
          : undefined,
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
  // middleware enforces ADMIN/STAFF for this path,
  // but add explicit auth as defense-in-depth
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  try {
    const consultations = await prisma.consultation.findMany({
      orderBy: { createdAt: "desc" },
      include: { case: true, files: true },
    });
    return NextResponse.json(consultations);
  } catch {
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
