import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 未認証 → サイドバーなしで描画（ログインページ用）
  // middleware.ts が /admin/login 以外の未認証アクセスをリダイレクト済み
  // middleware.ts が認証済み /admin/login をダッシュボードへリダイレクト済み
  if (!session?.user) {
    return <>{children}</>;
  }

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
