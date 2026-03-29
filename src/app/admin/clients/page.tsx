import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import Link from "next/link";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const where: Record<string, unknown> = { role: "CLIENT" };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
    delete where.role;
    where.AND = [{ role: "CLIENT" }];
  }

  const clients = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      cases: { select: { id: true, clientName: true, status: true } },
    },
  });

  const pendingInvitations = await prisma.clientInvitation.findMany({
    where: { usedAt: null, expiresAt: { gt: new Date() } },
    include: { case: { select: { clientName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          <Users className="mr-2 inline h-6 w-6" />
          クライアント
        </h1>
        <Badge variant="outline">{clients.length}名</Badge>
      </div>

      <SearchInput placeholder="名前・メールで検索..." />

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <p className="mb-2 text-sm font-medium text-amber-700">
              保留中の招待（{pendingInvitations.length}件）
            </p>
            <div className="space-y-2">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded border border-amber-200 bg-amber-50 p-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{inv.email}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      → {inv.case.clientName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    期限: {new Date(inv.expiresAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client list */}
      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            クライアントはまだ登録されていません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.email}</p>
                  <p className="text-xs text-gray-400">
                    登録: {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {c.cases.map((cs) => (
                    <Link key={cs.id} href={`/admin/cases/${cs.id}`}>
                      <Badge variant="outline" className="hover:bg-blue-50">
                        {cs.clientName}
                      </Badge>
                    </Link>
                  ))}
                  {c.cases.length === 0 && (
                    <span className="text-xs text-gray-400">案件なし</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
