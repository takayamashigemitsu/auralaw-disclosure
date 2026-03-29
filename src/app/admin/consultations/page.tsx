import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ArrowRight } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import { StatusFilter } from "@/components/status-filter";
import { ConsultationActions } from "./consultation-actions";
import Link from "next/link";
import { CONSULTATION_STATUS, getSnsLabel } from "@/lib/constants";

const consultationStatusOptions = Object.entries(CONSULTATION_STATUS).map(
  ([value, config]) => ({ value, label: config.label })
);

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) {
    where.status = status;
  }

  const consultations = await prisma.consultation.findMany({
    where,
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchInput placeholder="名前・メール・内容で検索..." />
        </div>
        <StatusFilter options={consultationStatusOptions} />
      </div>

      {consultations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {q || status ? "条件に一致する相談がありません。" : "相談データがありません。"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => {
            const sc = CONSULTATION_STATUS[c.status as keyof typeof CONSULTATION_STATUS] || {
              label: c.status,
              variant: "outline" as const,
            };
            return (
              <Card key={c.id} className="transition-colors hover:bg-gray-50/50">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <Link href={`/admin/consultations/${c.id}`} className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <Badge variant={sc.variant} className="text-xs">{sc.label}</Badge>
                        {c.files.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            画像{c.files.length}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex gap-2 text-xs text-gray-500">
                        <span>{c.email}</span>
                        <span>/ {getSnsLabel(c.snsType)}</span>
                        <span>/ {new Date(c.createdAt).toLocaleDateString("ja-JP")}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {c.content}
                      </p>
                    </Link>
                    <div className="ml-4 flex items-center gap-2">
                      <ConsultationActions consultation={c} hasCase={!!c.case} />
                      <Link
                        href={`/admin/consultations/${c.id}`}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
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
