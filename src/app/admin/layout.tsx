import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Allow login page without auth
  // The login page has its own layout
  if (!session?.user) {
    return <>{children}</>;
  }

  // Only ADMIN and STAFF can access admin pages
  if (!["ADMIN", "STAFF"].includes(session.user.role)) {
    redirect("/");
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
