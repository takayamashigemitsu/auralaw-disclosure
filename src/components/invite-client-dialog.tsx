"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function InviteClientButton({
  caseId,
  defaultEmail,
}: {
  caseId: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail || "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleInvite() {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/clients/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, caseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
      toast.success("招待メールを送信しました");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "送信に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <UserPlus className="mr-1 h-3.5 w-3.5" />
        クライアント招待
      </Button>
    );
  }

  if (sent) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-2 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          {email} に招待メールを送信しました
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">クライアント招待</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">メールアドレス</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleInvite} disabled={loading || !email}>
            {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            招待メール送信
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
        </div>
        <p className="text-[10px] text-gray-400">
          招待リンクの有効期限は7日間です
        </p>
      </CardContent>
    </Card>
  );
}
