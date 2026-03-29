import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Allow login/verify pages without auth
  if (!session?.user) {
    return <>{children}</>;
  }

  if (session.user.role !== "CLIENT") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/portal/dashboard" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-700" />
            <span className="font-bold text-gray-900">マイページ</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session.user.name}</span>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/lib/auth");
                await signOut({ redirectTo: "/portal/login" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="mr-1 h-4 w-4" />
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
