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
    include: { case: true },
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
