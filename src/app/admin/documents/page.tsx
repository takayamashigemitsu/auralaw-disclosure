import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDocumentTypeLabel } from "@/lib/constants";

const categoryLabels: Record<string, string> = {
  DELEGATION: "委任状",
  DISCLOSURE_REQUEST: "開示請求書",
  COMPLAINT: "訴状",
  NOTICE: "通知書",
  OTHER: "その他",
};

export default async function DocumentsPage() {
  const templates = await prisma.documentTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const recentDocs = await prisma.caseDocument.findMany({
    where: { documentType: "CREATED" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { case: { select: { clientName: true, id: true } } },
  });

  // 書類作成可能な案件一覧（進行中の案件）
  const activeCases = await prisma.case.findMany({
    where: { status: { notIn: ["CLOSED", "SETTLED"] } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, clientName: true, snsType: true, status: true },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        <FileText className="mr-2 inline h-6 w-6" />
        書類管理
      </h1>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">書類テンプレート</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border p-4"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-gray-900">{t.name}</p>
                </div>
                <Badge variant="outline" className="mt-2 text-xs">
                  {categoryLabels[t.category] || t.category}
                </Badge>
                {t.description && (
                  <p className="mt-2 text-xs text-gray-500">{t.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick access: create document for a case */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">案件から書類を作成</CardTitle>
        </CardHeader>
        <CardContent>
          {activeCases.length === 0 ? (
            <p className="text-sm text-gray-500">
              進行中の案件がありません。
            </p>
          ) : (
            <div className="space-y-2">
              {activeCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/cases/${c.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {c.clientName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">書類作成へ</span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent generated docs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近作成した書類</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDocs.length === 0 ? (
            <p className="text-sm text-gray-500">
              作成済みの書類はありません。
            </p>
          ) : (
            <div className="space-y-2">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {doc.case.clientName} /{" "}
                        {new Date(doc.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/cases/${doc.case.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    案件を見る
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
