import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConsultationActions } from "../consultation-actions";
import { ConsultationMemo } from "./consultation-memo";
import { AIOrganize } from "@/components/ai-organize";
import {
  Clock,
  Mail,
  Phone,
  Globe,
  FileImage,
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  NEW: { label: "新規", variant: "destructive" },
  IN_PROGRESS: { label: "対応中", variant: "default" },
  RESOLVED: { label: "解決済", variant: "secondary" },
  CONVERTED: { label: "案件化済", variant: "outline" },
};

const snsLabels: Record<string, string> = {
  X: "X（旧Twitter）",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  FIVECH: "5ちゃんねる",
  OTHER: "その他",
};

export default async function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: {
      files: { select: { id: true, fileName: true, fileSize: true, mimeType: true } },
      case: true,
    },
  });

  if (!consultation) notFound();

  const sc = statusConfig[consultation.status] || { label: consultation.status, variant: "outline" as const };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {consultation.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {consultation.email}
            </span>
            {consultation.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {consultation.phone}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {snsLabels[consultation.snsType] || consultation.snsType}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(consultation.createdAt).toLocaleString("ja-JP")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={sc.variant}>{sc.label}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 md:col-span-2">
          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">相談内容</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {consultation.content}
              </p>
            </CardContent>
          </Card>

          {/* Attached files */}
          {consultation.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileImage className="h-4 w-4" />
                  添付ファイル（{consultation.files.length}件）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {consultation.files.map((f) => (
                    <a
                      key={f.id}
                      href={`/api/files/${f.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-lg border transition-colors hover:border-blue-400"
                    >
                      {f.mimeType.startsWith("image/") ? (
                        <img
                          src={`/api/files/${f.id}`}
                          alt={f.fileName}
                          className="h-48 w-full object-contain bg-gray-50"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-500">
                          PDF: {f.fileName}
                        </div>
                      )}
                      <div className="border-t p-2">
                        <p className="truncate text-xs text-gray-600">
                          {f.fileName}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {(f.fileSize / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Memo */}
          <ConsultationMemo
            consultationId={consultation.id}
            initialMemo={consultation.memo || ""}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">操作</CardTitle>
            </CardHeader>
            <CardContent>
              <ConsultationActions
                consultation={consultation}
                hasCase={!!consultation.case}
              />
            </CardContent>
          </Card>

          {/* AI Organize (A6) */}
          <AIOrganize consultationId={consultation.id} />

          {/* Info */}
          <Card>
            <CardContent className="space-y-3 pt-6 text-sm">
              <div>
                <span className="text-gray-500">相談ID</span>
                <p className="font-mono text-xs">{consultation.id}</p>
              </div>
              <Separator />
              <div>
                <span className="text-gray-500">受付日時</span>
                <p>{new Date(consultation.createdAt).toLocaleString("ja-JP")}</p>
              </div>
              {consultation.case && (
                <>
                  <Separator />
                  <div>
                    <span className="text-gray-500">関連案件</span>
                    <a
                      href={`/admin/cases/${consultation.case.id}`}
                      className="block text-blue-600 hover:underline"
                    >
                      {consultation.case.clientName} →
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
