import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CaseStatusUpdate } from "./case-status-update";
import { CaseTimelineSection } from "./case-timeline";

const statusConfig: Record<string, { label: string; color: string }> = {
  ACCEPTED: { label: "受任", color: "bg-blue-100 text-blue-800" },
  INJUNCTION_FILED: { label: "仮処分申立", color: "bg-yellow-100 text-yellow-800" },
  DISCLOSURE_REQUESTED: { label: "開示請求中", color: "bg-orange-100 text-orange-800" },
  DISCLOSURE_RECEIVED: { label: "開示完了", color: "bg-green-100 text-green-800" },
  LAWSUIT_FILED: { label: "訴訟提起", color: "bg-purple-100 text-purple-800" },
  SETTLED: { label: "和解", color: "bg-gray-100 text-gray-800" },
  CLOSED: { label: "終了", color: "bg-gray-100 text-gray-600" },
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

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      consultation: true,
      timelines: { orderBy: { date: "asc" } },
      messages: { orderBy: { createdAt: "desc" }, take: 20 },
      clientUser: true,
    },
  });

  if (!caseData) notFound();

  const sc = statusConfig[caseData.status] || {
    label: caseData.status,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {caseData.clientName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {snsLabels[caseData.snsType] || caseData.snsType} /
            案件ID: {caseData.id.slice(0, 8)}...
          </p>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${sc.color}`}>
          {sc.label}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 md:col-span-2">
          {/* Description */}
          {caseData.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">案件概要</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {caseData.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <CaseTimelineSection
            caseId={caseData.id}
            timelines={caseData.timelines}
          />

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">メッセージ</CardTitle>
            </CardHeader>
            <CardContent>
              {caseData.messages.length === 0 ? (
                <p className="text-sm text-gray-500">
                  メッセージはありません。
                </p>
              ) : (
                <div className="space-y-3">
                  {caseData.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg p-3 ${
                        m.isFromClient
                          ? "bg-blue-50 ml-4"
                          : "bg-gray-50 mr-4"
                      }`}
                    >
                      <p className="text-sm">{m.content}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {m.isFromClient ? "クライアント" : "スタッフ"} /{" "}
                        {new Date(m.createdAt).toLocaleString("ja-JP")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <CaseStatusUpdate caseId={caseData.id} currentStatus={caseData.status} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">案件情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">作成日</span>
                <p className="font-medium">
                  {new Date(caseData.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
              <Separator />
              <div>
                <span className="text-gray-500">ポータルトークン</span>
                <p className="font-mono text-xs break-all">
                  {caseData.portalToken}
                </p>
              </div>
              {caseData.clientUser && (
                <>
                  <Separator />
                  <div>
                    <span className="text-gray-500">クライアントアカウント</span>
                    <p className="font-medium">{caseData.clientUser.email}</p>
                  </div>
                </>
              )}
              {caseData.consultation && (
                <>
                  <Separator />
                  <div>
                    <span className="text-gray-500">元の相談</span>
                    <p className="font-medium">{caseData.consultation.name}</p>
                    <p className="text-xs text-gray-400">
                      {caseData.consultation.email}
                    </p>
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
