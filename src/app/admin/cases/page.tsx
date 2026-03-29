import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { StatusFilter } from "@/components/status-filter";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string }> = {
  ACCEPTED: { label: "受任", color: "bg-blue-100 text-blue-800" },
  INJUNCTION_FILED: { label: "仮処分申立", color: "bg-yellow-100 text-yellow-800" },
  DISCLOSURE_REQUESTED: { label: "開示請求中", color: "bg-orange-100 text-orange-800" },
  DISCLOSURE_RECEIVED: { label: "開示完了", color: "bg-green-100 text-green-800" },
  LAWSUIT_FILED: { label: "訴訟提起", color: "bg-purple-100 text-purple-800" },
  SETTLED: { label: "和解", color: "bg-gray-100 text-gray-800" },
  CLOSED: { label: "終了", color: "bg-gray-100 text-gray-600" },
};

const statusOptions = [
  { value: "ACCEPTED", label: "受任" },
  { value: "INJUNCTION_FILED", label: "仮処分申立" },
  { value: "DISCLOSURE_REQUESTED", label: "開示請求中" },
  { value: "DISCLOSURE_RECEIVED", label: "開示完了" },
  { value: "LAWSUIT_FILED", label: "訴訟提起" },
  { value: "SETTLED", label: "和解" },
  { value: "CLOSED", label: "終了" },
];

const snsLabels: Record<string, string> = {
  X: "X", INSTAGRAM: "Instagram", FACEBOOK: "Facebook",
  YOUTUBE: "YouTube", TIKTOK: "TikTok", FIVECH: "5ch", OTHER: "その他",
};

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { clientName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) {
    where.status = status;
  }

  const cases = await prisma.case.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { consultation: true, _count: { select: { messages: true, documents: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          <Briefcase className="mr-2 inline h-6 w-6" />
          案件管理
        </h1>
        <Badge variant="outline">{cases.length}件</Badge>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchInput placeholder="顧客名・案件内容で検索..." />
        </div>
        <StatusFilter options={statusOptions} />
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {q || status ? "条件に一致する案件がありません。" : "案件データがありません。"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const sc = statusConfig[c.status] || { label: c.status, color: "bg-gray-100 text-gray-800" };
            return (
              <Link key={c.id} href={`/admin/cases/${c.id}`}>
                <Card className="transition-colors hover:bg-gray-50">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-gray-900">{c.clientName}</p>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>{snsLabels[c.snsType] || c.snsType}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString("ja-JP")}</span>
                        {c.description && (
                          <span className="hidden sm:inline">
                            / {c.description.slice(0, 30)}...
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {c._count.messages > 0 && (
                        <Badge variant="secondary">MSG {c._count.messages}</Badge>
                      )}
                      {c._count.documents > 0 && (
                        <Badge variant="secondary">DOC {c._count.documents}</Badge>
                      )}
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
