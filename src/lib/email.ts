import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Resendではドメイン認証前は onboarding@resend.dev のみ使用可能
// 独自ドメイン認証後に EMAIL_FROM を設定する
const FROM =
  process.env.EMAIL_FROM || "弁護士法人AURA <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return { success: true, mock: true };
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[Email Error]", error);
    return { success: false, error };
  }

  return { success: true };
}
