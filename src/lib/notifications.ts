import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getCaseStatusLabel } from "@/lib/constants";

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: { userId, type, title, body, link },
  });
}

export async function notifyStatusChange(
  caseId: string,
  oldStatus: string,
  newStatus: string
) {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: { clientUser: true },
  });
  if (!caseData?.clientUser) return;

  const oldLabel = getCaseStatusLabel(oldStatus);
  const newLabel = getCaseStatusLabel(newStatus);
  const title = "案件のステータスが更新されました";
  const body = `${oldLabel} → ${newLabel}`;

  await createNotification({
    userId: caseData.clientUserId!,
    type: "STATUS_CHANGE",
    title,
    body,
    link: `/portal/cases/${caseId}`,
  });

  await sendEmail({
    to: caseData.clientUser.email,
    subject: `【弁護士法人AURA】${title}`,
    html: `
      <p>${caseData.clientUser.name} 様</p>
      <p>ご依頼案件のステータスが更新されました。</p>
      <p><strong>${body}</strong></p>
      <p>詳細はマイページよりご確認ください。</p>
      <p>弁護士法人AURA</p>
    `,
  });
}

export async function notifyNewMessage(
  caseId: string,
  isFromClient: boolean
) {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: { clientUser: true },
  });
  if (!caseData) return;

  if (isFromClient) {
    // Notify all admin/staff users
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "STAFF"] } },
    });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "NEW_MESSAGE",
        title: "クライアントからメッセージ",
        body: `${caseData.clientName}様からメッセージが届きました`,
        link: `/admin/cases/${caseId}`,
      });
    }
  } else if (caseData.clientUser) {
    await createNotification({
      userId: caseData.clientUserId!,
      type: "NEW_MESSAGE",
      title: "事務所からメッセージ",
      body: "弁護士からメッセージが届きました",
      link: `/portal/cases/${caseId}`,
    });

    await sendEmail({
      to: caseData.clientUser.email,
      subject: "【弁護士法人AURA】新しいメッセージがあります",
      html: `
        <p>${caseData.clientUser.name} 様</p>
        <p>弁護士から新しいメッセージが届いています。</p>
        <p>マイページよりご確認ください。</p>
        <p>弁護士法人AURA</p>
      `,
    });
  }
}
