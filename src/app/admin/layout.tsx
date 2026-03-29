import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // middleware.ts が /admin/login 以外の未認証アクセスをリダイレクト済み
  // ログインページは認証不要なのでそのまま描画
  if (!session?.user) {
    return <>{children}</>;
  }

  // ADMIN/STAFF以外のロールチェックも middleware.ts で済み
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="md:ml-64">
        <div className="pt-14 md:pt-0">
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
