import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ConsultationActions } from "./consultation-actions";

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

export default async function ConsultationsPage() {
  const consultations = await prisma.consultation.findMany({
    orderBy: { createdAt: "desc" },
    include: { case: true, files: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          <MessageSquare className="mr-2 inline h-6 w-6" />
          相談管理
        </h1>
        <Badge variant="outline">{consultations.length}件</Badge>
      </div>

      {consultations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            相談データがありません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => {
            const sc = statusConfig[c.status] || { label: c.status, variant: "outline" as const };
            return (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                        <span>{c.email}</span>
                        {c.phone && <span>/ {c.phone}</span>}
                        <span>/ {snsLabels[c.snsType] || c.snsType}</span>
                      </div>
                    </div>
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {c.content}
                  </p>
                  {c.memo && (
                    <div className="mt-3 rounded bg-yellow-50 p-2 text-sm text-yellow-800">
                      <strong>メモ:</strong> {c.memo}
                    </div>
                  )}
                  {c.files && c.files.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        添付ファイル（{c.files.length}件）
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {c.files.map((f: { id: string; fileName: string; mimeType: string; data: string; fileSize: number }) => (
                          <a
                            key={f.id}
                            href={`data:${f.mimeType};base64,${f.data}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block overflow-hidden rounded border hover:border-blue-400 transition-colors"
                          >
                            {f.mimeType.startsWith("image/") ? (
                              <img
                                src={`data:${f.mimeType};base64,${f.data}`}
                                alt={f.fileName}
                                className="h-20 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-20 items-center justify-center bg-gray-100 text-xs text-gray-500">
                                PDF
                              </div>
                            )}
                            <p className="truncate px-1 py-0.5 text-[10px] text-gray-500">
                              {f.fileName}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString("ja-JP")}
                    </span>
                    <ConsultationActions consultation={c} hasCase={!!c.case} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
