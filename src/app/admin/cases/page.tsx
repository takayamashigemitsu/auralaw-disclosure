import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { StatusFilter } from "@/components/status-filter";
import Link from "next/link";
import {
  CASE_STATUS_LIST,
  getCaseStatusLabel,
  getCaseStatusColor,
  getSnsLabel,
} from "@/lib/constants";

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
        <StatusFilter options={CASE_STATUS_LIST} />
      </div>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {q || status ? "条件に一致する案件がありません。" : "案件データがありません。"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Link key={c.id} href={`/admin/cases/${c.id}`}>
              <Card className="transition-colors hover:bg-gray-50">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-gray-900">{c.clientName}</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>{getSnsLabel(c.snsType)}</span>
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
                      <Badge variant="secondary">メッセージ {c._count.messages}</Badge>
                    )}
                    {c._count.documents > 0 && (
                      <Badge variant="secondary">書類 {c._count.documents}</Badge>
                    )}
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getCaseStatusColor(c.status)}`}>
                      {getCaseStatusLabel(c.status)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
