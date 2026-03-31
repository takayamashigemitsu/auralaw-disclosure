"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Pencil, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";

// ─── ユーザー新規作成ダイアログ ───
export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        name: fd.get("name"),
        role: fd.get("role"),
        password: fd.get("password"),
      }),
    });

    if (res.ok) {
      toast.success("ユーザーを作成しました");
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "作成に失敗しました");
    }
    setLoading(false);
  };

  return (
    <>
      <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => setOpen(true)}>
        <UserPlus className="mr-2 h-4 w-4" />
        ユーザー追加
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー新規作成</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">名前</label>
              <Input name="name" required placeholder="例: 田中 太郎" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">メールアドレス</label>
              <Input name="email" type="email" required placeholder="例: tanaka@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ロール</label>
              <Select name="role" defaultValue="STAFF">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN（管理者）</SelectItem>
                  <SelectItem value="STAFF">STAFF（スタッフ）</SelectItem>
                  <SelectItem value="CLIENT">CLIENT（クライアント）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">パスワード</label>
              <Input name="password" type="password" required minLength={8} placeholder="8文字以上（英字+数字）" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "作成中..." : "作成する"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── ロール変更ダイアログ ───
export function EditUserDialog({
  user,
}: {
  user: { id: string; name: string; email: string; role: string };
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        role: fd.get("role"),
      }),
    });

    if (res.ok) {
      toast.success("ユーザー情報を更新しました");
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "更新に失敗しました");
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">名前</label>
              <Input name="name" defaultValue={user.name} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">メールアドレス</label>
              <Input value={user.email} disabled className="bg-gray-50" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">ロール</label>
              <Select name="role" defaultValue={user.role}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN（管理者）</SelectItem>
                  <SelectItem value="STAFF">STAFF（スタッフ）</SelectItem>
                  <SelectItem value="CLIENT">CLIENT（クライアント）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "更新中..." : "更新する"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── パスワードリセットダイアログ ───
export function ResetPasswordDialog({
  user,
}: {
  user: { id: string; name: string; email: string };
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      toast.error("パスワードが一致しません");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      toast.success(`${user.name} のパスワードをリセットしました`);
      setOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "リセットに失敗しました");
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)}>
        <KeyRound className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>パスワードリセット</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            {user.name}（{user.email}）のパスワードを変更します。
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">新しいパスワード</label>
              <Input name="password" type="password" required minLength={8} placeholder="8文字以上（英字+数字）" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">パスワード確認</label>
              <Input name="confirm" type="password" required minLength={8} placeholder="もう一度入力" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "リセット中..." : "パスワードをリセット"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── ユーザー削除ボタン ───
export function DeleteUserButton({
  user,
  currentUserId,
}: {
  user: { id: string; name: string; email: string };
  currentUserId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (user.id === currentUserId) return null;

  const handleDelete = async () => {
    if (!confirm(`${user.name}（${user.email}）を削除してよろしいですか？\nこの操作は元に戻せません。`)) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("ユーザーを削除しました");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "削除に失敗しました");
    }
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

// ─── ロールバッジ ───
export function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; className: string }> = {
    ADMIN: { label: "管理者", className: "bg-red-100 text-red-800 border-red-200" },
    STAFF: { label: "スタッフ", className: "bg-blue-100 text-blue-800 border-blue-200" },
    CLIENT: { label: "クライアント", className: "bg-gray-100 text-gray-700 border-gray-200" },
  };
  const c = config[role] || config.CLIENT;
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}
