"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

const MAX_LENGTH = 10000;

export function PortalMessageForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    if (message.length > MAX_LENGTH) {
      toast.error(`メッセージは${MAX_LENGTH}文字以内で入力してください`);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message, isFromClient: true }),
      });
      if (!res.ok) throw new Error();
      setMessage("");
      toast.success("メッセージを送信しました");
      router.refresh();
    } catch {
      toast.error("送信に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力..."
          rows={3}
          maxLength={MAX_LENGTH}
          className="flex-1 min-h-[80px]"
        />
        <Button
          type="submit"
          disabled={loading || !message.trim() || message.length > MAX_LENGTH}
          size="icon"
          className="self-end shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className={`text-xs text-right ${message.length > MAX_LENGTH ? "text-red-500 font-medium" : "text-gray-400"}`}>
        {message.length} / {MAX_LENGTH}
      </p>
    </form>
  );
}
