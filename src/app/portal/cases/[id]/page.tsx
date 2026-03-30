import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Circle, Clock, FileText, Banknote } from "lucide-react";
import { PortalMessageForm } from "./portal-message-form";
import {
  getCaseStatusLabel,
  getCaseStatusColor,
  getSnsLabel,
  getBillingStatusLabel,
  getBillingStatusColor,
  CASE_STATUS_LIST,
} from "@/lib/constants";
import { formatYen } from "@/lib/fees";

const allStatuses = CASE_STATUS_LIST.map((s) => ({
  key: s.value,
  label: s.label,
}));

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
      billings: {
        where: { isVisibleToClient: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!caseData) notFound();

  const currentStep = getStepIndex(caseData.status);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">案件の進捗</h1>

      {/* SNS / Platform info */}
      {caseData.snsType && (
        <p className="text-sm text-gray-600">
          対象サイト: <span className="font-medium">{getSnsLabel(caseData.snsType)}</span>
        </p>
      )}

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">現在のステータス:</span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getCaseStatusColor(caseData.status)}`}>
          {getCaseStatusLabel(caseData.status)}
        </span>
      </div>

      {/* Step bar */}
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px]">
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

      {/* Billing / 費用情報 */}
      {caseData.billings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Banknote className="mr-2 inline h-4 w-4" />
              費用情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {caseData.billings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{b.label}</p>
                    {b.note && (
                      <p className="text-xs text-gray-400">{b.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getBillingStatusColor(b.status)}`}
                    >
                      {getBillingStatusLabel(b.status)}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatYen(b.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">合計</span>
              <span className="text-base font-bold text-gray-900">
                {formatYen(
                  caseData.billings.reduce((sum, b) => sum + b.amount, 0)
                )}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              ※費用の詳細はスタッフまでお問い合わせください。
            </p>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">メッセージ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:px-6">
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
                      ? "bg-blue-50 ml-4 sm:ml-8 text-right"
                      : "bg-gray-50 mr-4 sm:mr-8"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
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
