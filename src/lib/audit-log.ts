import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "CASE_STATUS_CHANGE"
  | "CASE_CREATED"
  | "CASE_UPDATED"
  | "TASK_STATUS_CHANGE"
  | "TASK_CREATED"
  | "BILLING_CREATED"
  | "BILLING_UPDATED"
  | "BILLING_DELETED"
  | "DOCUMENT_CREATED"
  | "DOCUMENT_DOWNLOADED"
  | "TARGET_CREATED"
  | "TARGET_UPDATED"
  | "TARGET_DELETED"
  | "INVITATION_SENT"
  | "CLIENT_REGISTERED"
  | "MESSAGE_SENT";

export async function auditLog({
  action,
  userId,
  details,
  path,
}: {
  action: AuditAction;
  userId: string;
  details: Record<string, unknown>;
  path?: string;
}) {
  try {
    await prisma.appLog.create({
      data: {
        level: "info",
        category: "audit",
        message: action,
        context: JSON.stringify(details),
        userId,
        path: path || null,
      },
    });
  } catch (e) {
    // Audit log failure must never crash the application
    console.error("Audit log failed:", e);
  }
}

/**
 * Transaction-safe audit log - use inside prisma.$transaction()
 * Accepts a Prisma transaction client instead of global prisma
 */
export async function auditLogTx(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  {
    action,
    userId,
    details,
    path,
  }: {
    action: AuditAction;
    userId: string;
    details: Record<string, unknown>;
    path?: string;
  }
) {
  await tx.appLog.create({
    data: {
      level: "info",
      category: "audit",
      message: action,
      context: JSON.stringify(details),
      userId,
      path: path || null,
    },
  });
}
