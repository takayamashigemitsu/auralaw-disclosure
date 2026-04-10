"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Loader2,
  Trash2,
  Download,
  FileText,
  Filter,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_OPTIONS,
} from "@/lib/constants";

type Doc = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  documentType: string;
  isSharedWithClient: boolean;
  createdAt: string;
};

export function CaseDocumentsManager({
  caseId,
  documents,
}: {
  caseId: string;
  documents: Doc[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string>("CLIENT_UPLOAD");
  const [filter, setFilter] = useState<string>("ALL");

  const filtered =
    filter === "ALL"
      ? documents
      : documents.filter((d) => d.documentType === filter);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentType", uploadType);
      fd.append("isSharedWithClient", "false");

      const res = await fetch(`/api/cases/${caseId}/documents`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "アップロードに失敗しました");
      }

      toast.success("アップロードしました");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "アップロードに失敗しました";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function toggleShare(docId: string, current: boolean) {
    try {
      const res = await fetch(`/api/case-documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSharedWithClient: !current }),
      });
      if (!res.ok) throw new Error();
      toast.success(!current ? "クライアントに共有しました" : "共有を解除しました");
      router.refresh();
    } catch {
      toast.error("更新に失敗しました");
    }
  }

  async function changeType(docId: string, type: string) {
    try {
      const res = await fetch(`/api/case-documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: type }),
      });
      if (!res.ok) throw new Error();
      toast.success("種別を変更しました");
      router.refresh();
    } catch {
      toast.error("更新に失敗しました");
    }
  }

  async function deleteDoc(docId: string, fileName: string) {
    if (!window.confirm(`${fileName} を削除しますか？この操作は取り消せません。`)) return;
    try {
      const res = await fetch(`/api/case-documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("削除しました");
      router.refresh();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-gray-50 p-3">
        <Select
          value={uploadType}
          onValueChange={(v) => v && setUploadType(v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif"
        />
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-3.5 w-3.5" />
          )}
          ファイルを選択
        </Button>
        <p className="text-[11px] text-gray-500">最大10MB / PDF, Word, 画像</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-gray-400" />
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">すべて ({documents.length})</SelectItem>
            {DOCUMENT_TYPE_OPTIONS.map((opt) => {
              const count = documents.filter((d) => d.documentType === opt.value).length;
              return (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed py-10 text-center text-sm text-gray-500">
          該当する書類がありません
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
            >
              <FileText className="h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{doc.fileName}</p>
                <p className="text-[11px] text-gray-500">
                  {(doc.fileSize / 1024).toFixed(0)} KB /{" "}
                  {new Date(doc.createdAt).toLocaleString("ja-JP")}
                </p>
              </div>

              <Select
                value={doc.documentType}
                onValueChange={(v) => v && changeType(doc.id, v)}
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue>
                    {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant={doc.isSharedWithClient ? "default" : "outline"}
                onClick={() => toggleShare(doc.id, doc.isSharedWithClient)}
                className="h-8 text-xs"
              >
                <Share2 className="mr-1 h-3 w-3" />
                {doc.isSharedWithClient ? "共有中" : "共有する"}
              </Button>

              <a
                href={`/api/case-documents/${doc.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center rounded border px-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                <Download className="mr-1 h-3 w-3" />
                DL
              </a>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteDoc(doc.id, doc.fileName)}
                className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
