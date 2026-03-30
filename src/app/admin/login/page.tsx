"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const result = await signIn("credentials", {
      email,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません。");
      setLoading(false);
      return;
    }

    // signIn succeeded — send OTP for ADMIN/STAFF
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST" });
      const data = await res.json();

      if (data.verified) {
        // Non-ADMIN/STAFF user — no 2FA needed
        window.location.href = "/admin/dashboard";
        return;
      }

      if (data.sent) {
        setUserEmail(email);
        setOtpStep(true);
        setLoading(false);
        return;
      }

      setError(data.error || "OTP送信に失敗しました");
      setLoading(false);
    } catch {
      setError("OTP送信中にエラーが発生しました");
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp }),
      });
      const data = await res.json();

      if (data.verified) {
        window.location.href = "/admin/dashboard";
        return;
      }

      setError(data.error || "認証に失敗しました");
      setLoading(false);
    } catch {
      setError("認証中にエラーが発生しました");
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST" });
      const data = await res.json();
      if (!data.sent) {
        setError(data.error || "再送信に失敗しました");
      }
    } catch {
      setError("再送信中にエラーが発生しました");
    } finally {
      setResending(false);
    }
  }

  if (otpStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-blue-700" />
            <CardTitle className="mt-2">二段階認証</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              認証コードを {userEmail} に送信しました
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">認証コード（6桁）</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-widest"
                  required
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                認証する
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  {resending ? "送信中..." : "コードを再送信"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Scale className="mx-auto h-8 w-8 text-blue-700" />
          <CardTitle className="mt-2">管理画面ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              ログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
