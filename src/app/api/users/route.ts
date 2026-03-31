import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { auditLog } from "@/lib/audit-log";

// POST — ユーザー新規作成（ADMIN のみ）
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, role, password } = body as {
      email?: string;
      name?: string;
      role?: string;
      password?: string;
    };

    if (!email || !name || !role || !password) {
      return NextResponse.json(
        { error: "email, name, role, password は必須です" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "STAFF", "CLIENT"].includes(role)) {
      return NextResponse.json(
        { error: "ロールは ADMIN, STAFF, CLIENT のいずれかです" },
        { status: 400 }
      );
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "パスワードは8文字以上、英字と数字を含む必要があります" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        hashedPassword: hashSync(password, 10),
      },
    });

    await auditLog({
      action: "USER_CREATED",
      userId: session.user.id!,
      details: { targetUserId: user.id, email, role },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch {
    return NextResponse.json({ error: "ユーザーの作成に失敗しました" }, { status: 500 });
  }
}
