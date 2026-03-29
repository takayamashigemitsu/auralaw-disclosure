import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Circle, Clock, FileText } from "lucide-react";
import { PortalMessageForm } from "./portal-message-form";

const allStatuses = [
  { key: "ACCEPTED", label: "受任" },
  { key: "INJUNCTION_FILED", label: "仮処分申立" },
  { key: "DISCLOSURE_REQUESTED", label: "開示請求" },
  { key: "DISCLOSURE_RECEIVED", label: "開示完了" },
  { key: "LAWSUIT_FILED", label: "訴訟提起" },
  { key: "SETTLED", label: "和解・解決" },
];

function getStepIndex(status: string): number {
  const idx = allStatuses.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default async function PortalCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");

  const { id } = await params;

  const caseData = await prisma.case.findFirst({
    where: { id, clientUserId: session.user.id },
    include: {
      timelines: {
        where: { isVisibleToClient: true },
        orderBy: { date: "asc" },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 50,
      },
      documents: {
        where: { isSharedWithClient: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!caseData) notFound();

  const currentStep = getStepIndex(caseData.status);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">案件の進捗</h1>

      {/* Step bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {allStatuses.map((s, i) => {
              const isComplete = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={s.key} className="flex flex-1 flex-col items-center">
                  <div className="relative flex items-center">
                    {i > 0 && (
                      <div
                        className={`absolute right-1/2 h-0.5 w-full -translate-x-1/2 ${
                          i <= currentStep ? "bg-blue-600" : "bg-gray-200"
                        }`}
                        style={{ width: "calc(100% + 2rem)", right: "50%" }}
                      />
                    )}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                        isComplete
                          ? "bg-blue-600 text-white"
                          : "border-2 border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <span
                    className={`mt-2 text-xs text-center ${
                      isCurrent
                        ? "font-bold text-blue-700"
                        : isComplete
                          ? "text-gray-700"
                          : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Clock className="mr-2 inline h-4 w-4" />
            進捗の詳細
          </CardTitle>
        </CardHeader>
        <CardContent>
          {caseData.timelines.length === 0 ? (
            <p className="text-sm text-gray-500">
              まだ進捗情報がありません。
            </p>
          ) : (
            <div className="relative space-y-4 pl-6">
              <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-blue-200" />
              {caseData.timelines.map((t) => (
                <div key={t.id} className="relative">
                  <div className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t.title}</p>
                    {t.description && (
                      <p className="text-sm text-gray-600">{t.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(t.date).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shared documents */}
      {caseData.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <FileText className="mr-2 inline h-4 w-4" />
              共有書類
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {caseData.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-blue-50"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{doc.fileName}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </a>
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
        <CardContent className="space-y-4">
          {caseData.messages.length === 0 ? (
            <p className="text-sm text-gray-500">
              メッセージはありません。
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {caseData.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg p-3 ${
                    m.isFromClient
                      ? "bg-blue-50 ml-8 text-right"
                      : "bg-gray-50 mr-8"
                  }`}
                >
                  <p className="text-sm">{m.content}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {m.isFromClient ? "あなた" : "事務所"} /{" "}
                    {new Date(m.createdAt).toLocaleString("ja-JP")}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Separator />
          <PortalMessageForm caseId={caseData.id} />
        </CardContent>
      </Card>
    </div>
  );
}
