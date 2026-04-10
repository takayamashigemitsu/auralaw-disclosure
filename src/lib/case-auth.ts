/**
 * 案件アクセス権の統一ヘルパー
 *
 * 全ての /api/cases/** および /api/case-documents/** で使用する。
 * 手書きの role/ownership チェックは禁止（C1監査指摘）。
 *
 * 使い方:
 *   const gate = await requireCaseAccess(caseId);
 *   if (!gate.ok) return gate.response;
 *   const { caseData, session } = gate;
 *
 *   const staff = await requireStaff();
 *   if (!staff.ok) return staff.response;
 *   const { session } = staff;
 */
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// NextAuth v5 の auth() は Route Handler から引数なしで呼ぶと
// Promise<Session | null> を返す。オーバーロードの関係で推論が
// NextMiddleware 側に寄ることがあるため、型を明示する。
async function getSession(): Promise<Session | null> {
  return (await auth()) as Session | null;
}

type CaseAccessOk = {
  ok: true;
  session: Session;
  caseData: {
    id: string;
    clientUserId: string | null;
    status: string;
  };
};

type AccessNg = {
  ok: false;
  response: NextResponse;
};

/**
 * 案件アクセス権を検証する。
 * - 未認証 → 401
 * - 案件が存在しない、または CLIENT で他人の案件 → 404（存在秘匿）
 * - ADMIN/STAFF は全案件、CLIENT は自案件のみ
 */
export async function requireCaseAccess(
  caseId: string
): Promise<CaseAccessOk | AccessNg> {
  const session = await getSession();
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    };
  }

  const role = session.user.role;
  const isStaff = role === "ADMIN" || role === "STAFF";

  const caseData = await prisma.case.findFirst({
    where: isStaff
      ? { id: caseId }
      : { id: caseId, clientUserId: session.user.id },
    select: { id: true, clientUserId: true, status: true },
  });

  if (!caseData) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "案件が見つかりません" },
        { status: 404 }
      ),
    };
  }

  return { ok: true, session, caseData };
}

/**
 * ADMIN または STAFF のみ通す。
 * CLIENT は 403、未認証は 401。
 */
export async function requireStaff(): Promise<
  | {
      ok: true;
      session: Session;
    }
  | AccessNg
> {
  const session = await getSession();
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "認証が必要です" }, { status: 401 }),
    };
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return {
      ok: false,
      response: NextResponse.json({ error: "権限がありません" }, { status: 403 }),
    };
  }
  return { ok: true, session };
}

/**
 * STAFF権限 + 案件存在チェックをまとめて行う。
 * STAFF専用ルート（POST/PATCH/DELETE等）で使う。
 */
export async function requireStaffCaseAccess(
  caseId: string
): Promise<CaseAccessOk | AccessNg> {
  const staff = await requireStaff();
  if (!staff.ok) return staff;

  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true, clientUserId: true, status: true },
  });
  if (!caseData) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "案件が見つかりません" },
        { status: 404 }
      ),
    };
  }
  return { ok: true, session: staff.session, caseData };
}
