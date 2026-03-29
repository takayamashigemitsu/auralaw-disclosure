import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import {
  Shield,
  Search,
  FileText,
  Scale,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Calculator,
  Clock,
  Users,
} from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "1. 無料相談",
    desc: "被害状況をヒアリングし、最適な対応方針をご提案します。",
  },
  {
    icon: FileText,
    title: "2. 仮処分申立",
    desc: "裁判所にサイト管理者への情報開示を求める仮処分を申し立てます。",
  },
  {
    icon: Search,
    title: "3. プロバイダへ開示請求",
    desc: "IPアドレスをもとに、プロバイダに発信者情報の開示を請求します。",
  },
  {
    icon: Shield,
    title: "4. 発信者特定・法的措置",
    desc: "特定された発信者に対し、損害賠償請求等の法的措置を行います。",
  },
];

const features = [
  {
    icon: Scale,
    title: "豊富な実績",
    desc: "開示請求案件を多数手がけた経験豊富な弁護士が担当します。",
  },
  {
    icon: Clock,
    title: "迅速な対応",
    desc: "ログ保存期間の制約を考慮し、スピーディーに手続きを進めます。",
  },
  {
    icon: Users,
    title: "専用ポータル",
    desc: "依頼者様専用ページで案件の進捗をリアルタイムに確認できます。",
  },
];

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              ネットの誹謗中傷、
              <br className="md:hidden" />
              <span className="text-blue-700">泣き寝入りしない。</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              発信者情報開示請求で匿名の投稿者を特定し、
              法的に適切な対応を取ることができます。
              まずは無料相談からお気軽にどうぞ。
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">
                  無料相談する <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/simulator">
                  <Calculator className="mr-2 h-4 w-4" /> 費用を見積もる
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
              発信者情報開示請求とは？
            </h2>
            <div className="mx-auto mt-8 max-w-3xl space-y-4 text-gray-600">
              <p>
                発信者情報開示請求とは、インターネット上で匿名の誹謗中傷や名誉毀損を受けた場合に、
                その投稿を行った人物の情報（氏名・住所等）をプロバイダ等に開示させる法的手続きです。
              </p>
              <p>
                2022年10月施行の改正プロバイダ責任制限法により、新たな非訟手続が導入され、
                従来より迅速に発信者を特定できるようになりました。
              </p>
              <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-800">
                  <CheckCircle className="mr-1 inline h-4 w-4" />
                  X（旧Twitter）、Instagram、5ちゃんねる、YouTube等、主要SNS・掲示板に対応しています。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="bg-gray-50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
              手続きの流れ
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-4">
              {steps.map((step) => (
                <Card key={step.title} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <step.icon className="h-6 w-6 text-blue-700" />
                    </div>
                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Fee Overview */}
        <section id="fee" className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
              費用の目安
            </h2>
            <div className="mx-auto mt-8 max-w-2xl">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">相談料</span>
                      <span className="font-bold text-green-700">無料</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">着手金</span>
                      <span className="font-semibold">20万円〜</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-600">
                        報酬金（発信者特定時）
                      </span>
                      <span className="font-semibold">15万円〜</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-gray-600">裁判所実費</span>
                      <span className="font-semibold">数万円程度</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-gray-400">
                    ※案件の内容・難易度により異なります。詳細はシミュレーターをご利用ください。
                  </p>
                </CardContent>
              </Card>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button variant="outline" asChild>
                  <Link href="/fee">
                    <Scale className="mr-2 h-4 w-4" />
                    費用一覧を見る
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/simulator">
                    <Calculator className="mr-2 h-4 w-4" />
                    費用をシミュレーションする
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
              当事務所の特長
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {features.map((f) => (
                <Card key={f.title}>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <f.icon className="h-6 w-6 text-blue-700" />
                    </div>
                    <h3 className="font-bold text-gray-900">{f.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-700 py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              一人で悩まず、まずはご相談ください
            </h2>
            <p className="mt-4 text-blue-100">
              相談は無料です。秘密厳守で対応いたします。
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="bg-white text-blue-700 hover:bg-blue-50"
              >
                <Link href="/contact">
                  無料相談フォームへ <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white text-white hover:bg-blue-600"
              >
                <Link href="tel:0365555370">TEL: 03-6555-5370</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
