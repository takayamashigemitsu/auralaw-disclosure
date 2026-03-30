import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/**
 * 6桁のOTPコードを生成し、ユーザーにメール送信する
 * ADMIN/STAFFのログイン時に使用
 */
export async function generateAndSendOTP(userId: string, email: string): Promise<boolean> {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: userId },
    data: { otpCode: otp, otpExpiresAt: expiresAt },
  });

  await sendEmail({
    to: email,
    subject: "【弁護士法人AURA】ログイン認証コード",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #1e40af;">ログイン認証コード</h2>
        <p>以下のコードを入力してログインを完了してください。</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          このコードは10分間有効です。<br>
          心当たりがない場合は無視してください。
        </p>
        <p style="color: #94a3b8; font-size: 12px;">弁護士法人AURA</p>
      </div>
    `,
  });

  return true;
}
