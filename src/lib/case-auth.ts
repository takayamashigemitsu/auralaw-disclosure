import { prisma } from "@/lib/prisma";

/**
 * クライアントの案件アクセス権を検証する共通関数
 *
 * すべてのcase関連APIで使用する。
 * ADMIN/STAFFは全案件アクセス可。
 * CLIENTは自分の案件のみ。
 */
export async function verifyCaseAccess(
  caseId: string,
  userId: string,
  role: string
): Promise<{ authorized: boolean; caseData?: { id: string; clientUserId: string | null; status: string } }> {
  if (["ADMIN", "STAFF"].includes(role)) {
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, clientUserId: true, status: true },
    });
    if (!caseData) return { authorized: false };
    return { authorized: true, caseData };
  }

  // CLIENT: must own the case
  const caseData = await prisma.case.findFirst({
    where: { id: caseId, clientUserId: userId },
    select: { id: true, clientUserId: true, status: true },
  });
  if (!caseData) return { authorized: false };
  return { authorized: true, caseData };
}
