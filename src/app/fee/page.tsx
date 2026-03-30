import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Scale,
  ArrowRight,
  Info,
  CheckCircle,
} from "lucide-react";
import { FEE_SECTIONS } from "@/lib/fees";

export default function FeePage() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="text-center">
            <Scale className="mx-auto h-10 w-10 text-blue-700" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
              費用一覧
            </h1>
            <p className="mt-2 text-gray-600">
              弁護士法人AURAの発信者情報開示請求に関する費用です。
              <br className="hidden sm:block" />
              すべて税込表示・成功報酬なしの明朗会計です。
            </p>
          </div>

          {/* Key points */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
              <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">成功報酬なし</p>
                <p className="text-xs text-gray-500">着手金のみのシンプルな料金体系</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
              <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">税込表示</p>
                <p className="text-xs text-gray-500">表示価格以外の追加費用なし</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
              <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-gray-900">事前見積もり</p>
                <p className="text-xs text-gray-500">ご依頼前に総額をお伝えします</p>
              </div>
            </div>
          </div>

          {/* Fee tables */}
          <div className="mt-10 space-y-6">
            {FEE_SECTIONS.map((section) => (
              <Card key={section.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.description && (
                    <p className="text-sm text-gray-500">
                      {section.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            内容
                          </th>
                          <th className="px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">
                            着手金（税込）
                          </th>
                          {section.items.some((i) => i.reward !== undefined) && (
                            <th className="px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">
                              成功報酬
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item) => (
                          <tr
                            key={item.name}
                            className="border-b last:border-0"
                          >
                            <td className="px-3 py-3 text-gray-700">
                              {item.name}
                              {item.note && (
                                <span className="ml-1 text-xs text-gray-400">
                                  （{item.note}）
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                              {item.displayFee}
                            </td>
                            {section.items.some(
                              (i) => i.reward !== undefined
                            ) && (
                              <td className="px-3 py-3 text-right text-green-700 whitespace-nowrap">
                                {item.reward || "—"}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notes */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <Info className="h-4 w-4 text-blue-600" />
                ご注意事項
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>
                  ・上記はすべて税込価格です。
                </li>
                <li>
                  ・裁判所に納める実費（印紙代・郵便切手代等）は別途必要です。
                </li>
                <li>
                  ・案件の難易度や投稿数により費用が変動する場合があります。事前にお見積もりいたします。
                </li>
                <li>
                  ・上記に記載のない手続きについてもお気軽にご相談ください。
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              費用について詳しく知りたい方はお気軽にご相談ください。
            </p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/contact">
                  無料相談する <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/simulator">費用シミュレーターで見積もる</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
