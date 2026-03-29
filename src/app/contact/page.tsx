"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { MessageSquare, Loader2 } from "lucide-react";

const snsOptions = [
  { value: "X", label: "X（旧Twitter）" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "FIVECH", label: "5ちゃんねる" },
  { value: "OTHER", label: "その他" },
];

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      snsType: formData.get("snsType") as string,
      content: formData.get("content") as string,
    };

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const err of result.errors) {
            if (err.path?.[0]) {
              fieldErrors[err.path[0]] = err.message;
            }
          }
          setErrors(fieldErrors);
        }
        setLoading(false);
        return;
      }

      router.push("/contact/complete");
    } catch {
      setErrors({ form: "送信に失敗しました。しばらくしてから再度お試しください。" });
      setLoading(false);
    }
  }

  return (
    <>
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-xl px-4">
          <div className="text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-blue-700" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
              無料相談フォーム
            </h1>
            <p className="mt-2 text-gray-600">
              秘密厳守で対応いたします。お気軽にご相談ください。
            </p>
          </div>

          <Card className="mt-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    お名前 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="山田 太郎"
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    メールアドレス <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="090-1234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    対象SNS・サイト <span className="text-red-500">*</span>
                  </Label>
                  <Select name="snsType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="SNSを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {snsOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.snsType && (
                    <p className="text-sm text-red-500">{errors.snsType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    相談内容 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="被害の状況、投稿内容、お困りのことなどをできるだけ詳しくお書きください。"
                    rows={6}
                    required
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content}</p>
                  )}
                </div>

                {errors.form && (
                  <p className="text-sm text-red-500">{errors.form}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    "相談内容を送信する"
                  )}
                </Button>

                <p className="text-xs text-gray-400">
                  ※ご入力いただいた情報は、ご相談への対応以外の目的で使用いたしません。
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
