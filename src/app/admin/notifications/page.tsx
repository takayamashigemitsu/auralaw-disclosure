import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (!["ADMIN", "STAFF"].includes(session.user.role)) redirect("/admin/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">通知</h1>
        <p className="mt-1 text-sm text-gray-500">
          直近100件の通知を表示します。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Bell className="mr-2 inline h-4 w-4" />
            通知一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              通知はありません。
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const content = (
                  <div
                    className={`rounded-lg border p-3 transition-colors ${
                      n.isRead
                        ? "bg-white"
                        : "border-blue-200 bg-blue-50"
                    } ${n.link ? "hover:bg-gray-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-600 whitespace-pre-wrap">
                          {n.body}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {new Date(n.createdAt).toLocaleString("ja-JP")}
                      </span>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} href={n.link} className="block">
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
