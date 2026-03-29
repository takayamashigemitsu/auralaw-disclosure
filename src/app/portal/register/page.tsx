"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function PortalRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg("招待リンクが無効です");
      setValidating(false);
      return;
    }
    fetch(`/api/clients/register?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setValid(true);
          setEmail(data.email);
          setClientName(data.clientName);
        } else {
          setErrorMsg(data.error || "無効な招待リンクです");
        }
      })
      .catch(() => setErrorMsg("検証に失敗しました"))
      .finally(() => setValidating(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);

    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setErrorMsg("パスワードが一致しません");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/clients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: formData.get("name") as string,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "登録に失敗しました");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/portal/login"), 2000);
    } catch {
      setErrorMsg("登録に失敗しました");
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-8">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 font-medium text-gray-900">{errorMsg}</p>
            <p className="mt-2 text-sm text-gray-500">
              弁護士法人AURAまでお問い合わせください。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <p className="mt-4 font-medium text-gray-900">
              アカウント登録が完了しました
            </p>
            <p className="mt-2 text-sm text-gray-500">
              ログインページに移動します...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Shield className="mx-auto h-8 w-8 text-blue-700" />
          <CardTitle className="mt-2">アカウント登録</CardTitle>
          <p className="text-sm text-gray-500">
            {clientName}様のクライアントポータル
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>メールアドレス</Label>
              <Input value={email} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                name="name"
                defaultValue={clientName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="8文字以上"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">パスワード（確認）</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
              />
            </div>
            {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登録する
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
