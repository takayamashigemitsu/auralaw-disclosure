import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ArrowRight } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  ACCEPTED: { label: "受任", color: "bg-blue-100 text-blue-800" },
  INJUNCTION_FILED: { label: "仮処分申立中", color: "bg-yellow-100 text-yellow-800" },
  DISCLOSURE_REQUESTED: { label: "開示請求中", color: "bg-orange-100 text-orange-800" },
  DISCLOSURE_RECEIVED: { label: "開示完了", color: "bg-green-100 text-green-800" },
  LAWSUIT_FILED: { label: "訴訟提起", color: "bg-purple-100 text-purple-800" },
  SETTLED: { label: "和解", color: "bg-gray-100 text-gray-800" },
  CLOSED: { label: "終了", color: "bg-gray-100 text-gray-600" },
};

export default async function PortalDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");

  const cases = await prisma.case.findMany({
    where: { clientUserId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ご依頼案件一覧</h1>

      {cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-4 text-gray-500">
              現在、進行中の案件はありません。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const sc = statusConfig[c.status] || {
              label: c.status,
              color: "bg-gray-100 text-gray-800",
            };
            return (
              <Link key={c.id} href={`/portal/cases/${c.id}`}>
                <Card className="transition-colors hover:bg-blue-50/50">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {c.description
                          ? c.description.slice(0, 50) + (c.description.length > 50 ? "..." : "")
                          : "案件詳細"}
                      </p>
                      <p className="text-xs text-gray-500">
                        作成日: {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${sc.color}`}>
                        {sc.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
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
