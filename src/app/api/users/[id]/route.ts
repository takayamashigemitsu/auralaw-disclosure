import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { auditLog } from "@/lib/audit-log";

// PATCH — ユーザー更新（ロール変更・パスワードリセット）（ADMIN のみ）
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { role, password, name } = body as {
      role?: string;
      password?: string;
      name?: string;
    };

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    const changes: string[] = [];

    if (role && ["ADMIN", "STAFF", "CLIENT"].includes(role) && role !== target.role) {
      data.role = role;
      changes.push(`ロール: ${target.role} → ${role}`);
    }

    if (name && name !== target.name) {
      data.name = name;
      changes.push(`名前: ${target.name} → ${name}`);
    }

    if (password) {
      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return NextResponse.json(
          { error: "パスワードは8文字以上、英字と数字を含む必要があります" },
          { status: 400 }
        );
      }
      data.hashedPassword = hashSync(password, 10);
      changes.push("パスワードリセット");
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "変更内容がありません" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    await auditLog({
      action: "USER_UPDATED",
      userId: session.user.id!,
      details: { targetUserId: id, email: target.email, changes },
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    });
  } catch {
    return NextResponse.json({ error: "ユーザーの更新に失敗しました" }, { status: 500 });
  }
}

// DELETE — ユーザー削除（ADMIN のみ、自分自身は削除不可）
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "自分自身を削除することはできません" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await auditLog({
      action: "USER_DELETED",
      userId: session.user.id!,
      details: { targetUserId: id, email: target.email, role: target.role },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "ユーザーの削除に失敗しました" }, { status: 500 });
  }
}
