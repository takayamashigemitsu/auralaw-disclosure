import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { SearchInput } from "@/components/search-input";
import {
  CreateUserDialog,
  EditUserDialog,
  ResetPasswordDialog,
  DeleteUserButton,
  RoleBadge,
} from "./user-actions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const session = await auth();
  const { q, role } = await searchParams;

  const where: Record<string, unknown> = {};

  if (role && ["ADMIN", "STAFF", "CLIENT"].includes(role)) {
    where.role = role;
  }

  if (q) {
    where.AND = [
      ...(where.role ? [{ role: where.role }] : []),
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
    ];
    delete where.role;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    include: {
      cases: { select: { id: true } },
      assignedTasks: { where: { status: { not: "DONE" } }, select: { id: true } },
    },
  });

  const counts = {
    total: users.length,
    admin: users.filter((u) => u.role === "ADMIN").length,
    staff: users.filter((u) => u.role === "STAFF").length,
    client: users.filter((u) => u.role === "CLIENT").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          <Shield className="mr-2 inline h-6 w-6" />
          ユーザー管理
        </h1>
        <CreateUserDialog />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <a href="/admin/users" className={`rounded-xl border p-3 text-center transition-colors hover:bg-gray-50 ${!role ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}>
          <div className="text-lg font-bold text-gray-900">{counts.total}</div>
          <div className="text-xs text-gray-500">全ユーザー</div>
        </a>
        <a href="/admin/users?role=ADMIN" className={`rounded-xl border p-3 text-center transition-colors hover:bg-red-50 ${role === "ADMIN" ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
          <div className="text-lg font-bold text-red-700">{counts.admin}</div>
          <div className="text-xs text-gray-500">管理者</div>
        </a>
        <a href="/admin/users?role=STAFF" className={`rounded-xl border p-3 text-center transition-colors hover:bg-blue-50 ${role === "STAFF" ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}>
          <div className="text-lg font-bold text-blue-700">{counts.staff}</div>
          <div className="text-xs text-gray-500">スタッフ</div>
        </a>
        <a href="/admin/users?role=CLIENT" className={`rounded-xl border p-3 text-center transition-colors hover:bg-gray-100 ${role === "CLIENT" ? "border-gray-400 bg-gray-100" : "border-gray-200"}`}>
          <div className="text-lg font-bold text-gray-700">{counts.client}</div>
          <div className="text-xs text-gray-500">クライアント</div>
        </a>
      </div>

      {/* Search */}
      <SearchInput placeholder="名前・メールで検索..." />

      {/* User list */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            該当するユーザーはいません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id} className="transition-colors hover:bg-gray-50/50">
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                    u.role === "ADMIN" ? "bg-red-500" : u.role === "STAFF" ? "bg-blue-500" : "bg-gray-400"
                  }`}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <RoleBadge role={u.role} />
                      {u.id === session?.user?.id && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                          自分
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-gray-400">
                        登録: {new Date(u.createdAt).toLocaleDateString("ja-JP")}
                      </span>
                      {u.cases.length > 0 && (
                        <span className="text-[11px] text-gray-400">
                          案件: {u.cases.length}件
                        </span>
                      )}
                      {u.assignedTasks.length > 0 && (
                        <span className="text-[11px] text-amber-600">
                          未完了タスク: {u.assignedTasks.length}件
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <EditUserDialog user={{ id: u.id, name: u.name, email: u.email, role: u.role }} />
                  <ResetPasswordDialog user={{ id: u.id, name: u.name, email: u.email }} />
                  <DeleteUserButton user={{ id: u.id, name: u.name, email: u.email }} currentUserId={session?.user?.id || ""} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
