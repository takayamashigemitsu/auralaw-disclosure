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

type FeeItem = {
  name: string;
  fee: string;
  reward?: string;
  note?: string;
};

type FeeSection = {
  title: string;
  description?: string;
  items: FeeItem[];
};

const feeSections: FeeSection[] = [
  {
    title: "削除請求",
    description: "誹謗中傷投稿の削除を求める手続き",
    items: [
      {
        name: "サイト管理者に対する投稿の削除仮処分・訴訟（5投稿以内）",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "投稿者に対する投稿の削除仮処分・訴訟（5投稿以内）",
        fee: "33万円",
        reward: "なし",
      },
      {
        name: "検索結果の削除仮処分・訴訟（20検索結果以内）",
        fee: "33万円",
        reward: "なし",
      },
    ],
  },
  {
    title: "発信者情報開示請求（最後まで）",
    description: "投稿者の特定に必要な全手続きを一括で対応",
    items: [
      {
        name: "1投稿（投稿者特定）",
        fee: "33万円",
        reward: "なし",
      },
      {
        name: "1投稿（投稿者特定及び削除請求）",
        fee: "44万円",
        reward: "なし",
      },
    ],
  },
  {
    title: "投稿者特定から慰謝料請求訴訟まで",
    description: "発信者の特定から損害賠償請求までワンストップで対応",
    items: [
      {
        name: "X（旧Twitter）、Instagram等の指定サイト",
        fee: "44万円",
        reward: "なし",
      },
      {
        name: "上記以外のサイト",
        fee: "55万円",
        reward: "なし",
      },
    ],
  },
  {
    title: "投稿者側の対応",
    description: "開示請求を受けた側の対応",
    items: [
      {
        name: "意見照会回答＋被告側訴訟対応",
        fee: "33万円",
        reward: "なし",
      },
      {
        name: "意見照会回答のみ",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "被告側訴訟対応のみ",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "任意交渉対応＋被告側訴訟対応",
        fee: "33万円",
        reward: "なし",
      },
    ],
  },
  {
    title: "個別手続（発信者情報開示請求）",
    description: "従来型の手続きを個別にご依頼いただく場合",
    items: [
      {
        name: "IPアドレス開示仮処分",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "ログ保存仮処分（投稿数無制限）",
        fee: "11万円",
        reward: "なし",
      },
      {
        name: "ログ保存仮処分（5投稿以内）",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "住所・氏名等の開示請求訴訟（投稿数無制限）",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "住所・氏名等の開示請求訴訟（5投稿以内）",
        fee: "33万円",
        reward: "なし",
      },
      {
        name: "間接強制",
        fee: "5万5,000円",
        reward: "なし",
      },
      {
        name: "意見照会回答書",
        fee: "22万円",
        reward: "なし",
      },
    ],
  },
  {
    title: "発信者情報開示命令事件（非訟手続）",
    description: "2022年改正法による新制度を利用する場合",
    items: [
      {
        name: "開示命令申立（Google以外）",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "開示命令申立（Google）",
        fee: "33万円",
        reward: "なし",
      },
      {
        name: "開示命令申立（接続プロバイダ・投稿数無制限）",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "開示命令申立（接続プロバイダ・5投稿以内）",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "間接強制",
        fee: "5万5,000円",
        reward: "なし",
      },
      {
        name: "異議訴訟",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "意見照会回答",
        fee: "22万円",
        reward: "なし",
      },
    ],
  },
  {
    title: "慰謝料請求訴訟",
    description: "特定された発信者に対する損害賠償請求",
    items: [
      {
        name: "原告側（5投稿以内）",
        fee: "33万円",
        reward: "なし",
      },
      {
        name: "被告側（5投稿以内）",
        fee: "22万円",
        reward: "なし",
      },
      {
        name: "訴訟外の慰謝料請求示談交渉（請求側・5投稿以内）",
        fee: "33万円",
        reward: "なし",
      },
      {
        name: "債権執行",
        fee: "5万5,000円",
        reward: "なし",
      },
      {
        name: "不動産執行",
        fee: "11万円",
        reward: "なし",
      },
    ],
  },
  {
    title: "その他",
    items: [
      {
        name: "保全異議・保全抗告・即時抗告・控訴（1審から未受任時）",
        fee: "各10万円",
      },
      {
        name: "閲覧制限申立・秘匿決定申立",
        fee: "1回5万円",
      },
      {
        name: "財産開示手続申立",
        fee: "10万円",
        note: "別途出廷日当",
      },
      {
        name: "訴訟費用額確定処分申立",
        fee: "3万円",
      },
    ],
  },
  {
    title: "出廷日当（交通費込み）",
    items: [
      { name: "ウェブ期日", fee: "0円" },
      { name: "東京地裁本庁", fee: "1万円" },
      { name: "横浜地裁・さいたま地裁・立川支部", fee: "2万円" },
      { name: "名古屋地裁", fee: "6万2,000円" },
      { name: "大阪地裁・神戸地裁本庁", fee: "8万9,000円" },
    ],
  },
  {
    title: "法律相談",
    items: [
      {
        name: "法律相談（メール初回）",
        fee: "5万5,000円",
      },
    ],
  },
];

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
            {feeSections.map((section) => (
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
                              {item.fee}
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
