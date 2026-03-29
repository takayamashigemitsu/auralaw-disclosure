import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { CheckCircle, Home } from "lucide-react";

export default function ContactCompletePage() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-16 md:py-24">
        <div className="mx-auto max-w-md px-4 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            ご相談を受け付けました
          </h1>
          <Card className="mt-6">
            <CardContent className="pt-6">
              <p className="text-gray-600">
                ご相談いただきありがとうございます。
                <br />
                担当弁護士より2営業日以内にご連絡いたします。
              </p>
              <p className="mt-4 text-sm text-gray-500">
                お急ぎの場合はお電話（03-6555-5370）にてお問い合わせください。
              </p>
            </CardContent>
          </Card>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              トップページに戻る
            </Link>
          </Button>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
