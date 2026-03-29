import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CaseStatusUpdate } from "./case-status-update";
import { CaseTimelineSection } from "./case-timeline";
import { AIAnalysisButton } from "@/components/ai-analysis-button";
import { InviteClientButton } from "@/components/invite-client-dialog";
import { DocumentGenerator } from "@/components/document-generator";
import {
  getCaseStatusLabel,
  getCaseStatusColor,
  getSnsLabel,
  getDocumentTypeLabel,
} from "@/lib/constants";
import { CaseTargetsSection } from "./case-targets";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      consultation: { include: { files: true } },
      targets: { orderBy: { createdAt: "asc" } },
      timelines: { orderBy: { date: "asc" } },
      messages: { orderBy: { createdAt: "desc" }, take: 20 },
      documents: { orderBy: { createdAt: "desc" } },
      clientUser: true,
      aiAnalyses: { orderBy: { createdAt: "desc" }, take: 1 },
      invitations: { where: { usedAt: null }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!caseData) notFound();

  const sc = {
    label: getCaseStatusLabel(caseData.status),
    color: getCaseStatusColor(caseData.status),
  };

  const hasImages = caseData.consultation?.files?.some((f) => f.mimeType.startsWith("image/")) ?? false;
  const latestAnalysis = caseData.aiAnalyses[0]
    ? {
        defamationLikelihood: caseData.aiAnalyses[0].defamationLikelihood,
        recommendedProcedure: caseData.aiAnalyses[0].recommendedProcedure,
        estimatedCost: caseData.aiAnalyses[0].estimatedCost,
        keyPoints: JSON.parse(caseData.aiAnalyses[0].keyPoints),
        isPlaceholder: caseData.aiAnalyses[0].isPlaceholder,
      }
    : null;
  const pendingInvitation = caseData.invitations[0];
  const consultationEmail = caseData.consultation?.email;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {caseData.clientName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {getSnsLabel(caseData.snsType)} /
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

          {/* Targets / 対象サイト・投稿 */}
          <CaseTargetsSection
            caseId={caseData.id}
            targets={caseData.targets}
          />

          {/* Timeline */}
          <CaseTimelineSection
            caseId={caseData.id}
            timelines={caseData.timelines}
          />

          {/* Documents */}
          <DocumentGenerator
            caseId={caseData.id}
            defaultValues={{
              clientName: caseData.clientName,
              snsType: getSnsLabel(caseData.snsType),
              date: new Date().toISOString().split("T")[0],
            }}
          />

          {/* Existing documents */}
          {caseData.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  作成済み書類（{caseData.documents.length}件）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {caseData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{doc.fileName}</span>
                        <Badge variant="outline" className="text-xs">
                          {getDocumentTypeLabel(doc.documentType)}
                        </Badge>
                        {doc.isSharedWithClient && (
                          <Badge variant="secondary" className="text-xs">共有中</Badge>
                        )}
                      </div>
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        DL
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Client invitation */}
          {!caseData.clientUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">クライアント</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingInvitation ? (
                  <div className="space-y-1 text-sm">
                    <p className="text-amber-700">招待送信済み</p>
                    <p className="text-xs text-gray-500">{pendingInvitation.email}</p>
                    <p className="text-xs text-gray-400">
                      期限: {new Date(pendingInvitation.expiresAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                ) : (
                  <InviteClientButton
                    caseId={caseData.id}
                    defaultEmail={consultationEmail}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI分析</CardTitle>
            </CardHeader>
            <CardContent>
              <AIAnalysisButton
                caseId={caseData.id}
                hasImages={hasImages}
                existingResult={latestAnalysis}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
