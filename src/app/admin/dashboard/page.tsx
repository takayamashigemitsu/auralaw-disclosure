import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  MessageSquare,
  Briefcase,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

const statusLabels: Record<string, string> = {
  NEW: "新規",
  IN_PROGRESS: "対応中",
  RESOLVED: "解決済",
  CONVERTED: "案件化済",
  ACCEPTED: "受任",
  INJUNCTION_FILED: "仮処分申立",
  DISCLOSURE_REQUESTED: "開示請求中",
  DISCLOSURE_RECEIVED: "開示完了",
  LAWSUIT_FILED: "訴訟提起",
  SETTLED: "和解",
  CLOSED: "終了",
};

export default async function DashboardPage() {
  const [
    totalConsultations,
    newConsultations,
    activeCases,
    recentConsultations,
    recentCases,
  ] = await Promise.all([
    prisma.consultation.count(),
    prisma.consultation.count({ where: { status: "NEW" } }),
    prisma.case.count({
      where: { status: { notIn: ["SETTLED", "CLOSED"] } },
    }),
    prisma.consultation.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.case.findMany({
      where: { status: { notIn: ["SETTLED", "CLOSED"] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">未対応の相談</p>
              <p className="text-2xl font-bold text-gray-900">
                {newConsultations}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">進行中の案件</p>
              <p className="text-2xl font-bold text-gray-900">{activeCases}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">総相談数</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalConsultations}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* New consultations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              <AlertCircle className="mr-2 inline h-4 w-4 text-red-500" />
              未対応の相談
            </CardTitle>
            <Link
              href="/admin/consultations"
              className="text-sm text-blue-600 hover:underline"
            >
              すべて見る <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentConsultations.length === 0 ? (
              <p className="text-sm text-gray-500">
                未対応の相談はありません。
              </p>
            ) : (
              <div className="space-y-3">
                {recentConsultations.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <Badge variant="destructive">新規</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              <Briefcase className="mr-2 inline h-4 w-4 text-blue-500" />
              進行中の案件
            </CardTitle>
            <Link
              href="/admin/cases"
              className="text-sm text-blue-600 hover:underline"
            >
              すべて見る <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentCases.length === 0 ? (
              <p className="text-sm text-gray-500">
                進行中の案件はありません。
              </p>
            ) : (
              <div className="space-y-3">
                {recentCases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/cases/${c.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {c.clientName}
                      </p>
                      <p className="text-xs text-gray-500">{c.snsType}</p>
                    </div>
                    <Badge variant="outline">
                      {statusLabels[c.status] || c.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
