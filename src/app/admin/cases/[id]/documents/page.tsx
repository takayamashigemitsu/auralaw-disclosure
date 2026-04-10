import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { CaseDocumentsManager } from "./documents-manager";

export default async function CaseDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseData = await prisma.case.findUnique({
    where: { id },
    select: {
      id: true,
      clientName: true,
      documents: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileSize: true,
          documentType: true,
          isSharedWithClient: true,
          createdAt: true,
        },
      },
    },
  });

  if (!caseData) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/admin/cases/${caseData.id}`}
            className="inline-flex items-center text-xs text-gray-500 hover:text-blue-600"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            案件詳細に戻る
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            書類管理 — {caseData.clientName}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">案件書類（{caseData.documents.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseDocumentsManager
            caseId={caseData.id}
            documents={caseData.documents.map((d) => ({
              ...d,
              createdAt: d.createdAt.toISOString(),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
