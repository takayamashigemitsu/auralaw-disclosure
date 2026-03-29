import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { LpFaq } from "@/components/lp-faq";
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Shield,
  Zap,
  Users,
  FileText,
  Search,
  MessageSquare,
  Scale,
  Clock,
  Phone,
} from "lucide-react";

const painPoints = [
  "SNSで事実無根の誹謗中傷をされた",
  "匿名の掲示板に個人情報を晒された",
  "元交際相手に写真・動画を無断投稿された",
  "ビジネス上の悪意ある口コミを大量投稿された",
  "会社・個人の名誉を傷つける虚偽情報が拡散された",
  "脅迫・ストーカー行為をネット上でされている",
];

const steps = [
  {
    num: "01",
    icon: MessageSquare,
    title: "無料相談・受任",
    desc: "スクリーンショットを送るだけ。弁護士が被害状況を確認し、方針を提案します。",
    duration: "最短当日",
  },
  {
    num: "02",
    icon: FileText,
    title: "仮処分申立",
    desc: "裁判所にサイト管理者（SNS運営）への情報開示を求める仮処分を申し立てます。",
    duration: "1〜2ヶ月",
  },
  {
    num: "03",
    icon: Search,
    title: "プロバイダへ開示請求",
    desc: "取得したIPアドレスをもとに、プロバイダ（通信会社）に発信者の個人情報開示を請求します。",
    duration: "1〜3ヶ月",
  },
  {
    num: "04",
    icon: Shield,
    title: "発信者特定・法的措置",
    desc: "特定した発信者に対し、損害賠償請求・刑事告訴等の法的措置を行います。",
    duration: "状況に応じて",
  },
];

const features = [
  {
    icon: Scale,
    title: "豊富な解決実績",
    desc: "発信者情報開示請求案件を数多く手がけてきた専門チームが対応。複雑な案件も全力でサポートします。",
  },
  {
    icon: Zap,
    title: "迅速・スピード対応",
    desc: "ログの保存期間は最大3ヶ月。相談翌日からでも手続きを開始できる体制を整えています。",
  },
  {
    icon: Users,
    title: "専用ポータルで進捗確認",
    desc: "依頼者様専用のオンラインポータルで、案件の進捗状況をリアルタイムに確認できます。",
  },
  {
    icon: Shield,
    title: "厳格な守秘義務",
    desc: "弁護士の守秘義務により、ご相談内容・個人情報は完全に保護されます。秘密厳守で対応します。",
  },
  {
    icon: MessageSquare,
    title: "全国対応・オンライン相談",
    desc: "全国どこからでも相談可能。オンラインでのやりとりで来所不要で手続きを進められます。",
  },
  {
    icon: FileText,
    title: "費用の透明性",
    desc: "事前に費用のご説明を丁寧に行います。費用シミュレーターで概算もご確認いただけます。",
  },
];

const stats = [
  { num: "2,400+", label: "累計相談件数", sub: "2018年〜" },
  { num: "6", label: "対応可能SNS", sub: "主要サービス" },
  { num: "3ヶ月", label: "ログ保存期間", sub: "早期相談が重要" },
  { num: "10:00〜18:00", label: "平日受付", sub: "土日は要相談" },
];

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1 pb-16 md:pb-0">

        {/* ─── HERO ─────────────────────────────── */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a1628]">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-transparent to-indigo-900/30" />
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-blue-500" />

          {/* Large background text for visual depth */}
          <div className="absolute right-[-2rem] top-1/2 -translate-y-1/2 text-[200px] font-black text-white/[0.03] leading-none select-none hidden lg:block">
            LAW
          </div>

          <div className="relative mx-auto max-w-6xl px-4 md:px-6 py-32 md:py-0 w-full">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-semibold text-amber-300 tracking-wider">
                  2022年改正プロバイダ責任制限法対応
                </span>
              </div>

              {/* Main headline */}
              <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
                ネットの誹謗中傷、
                <br />
                <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                  泣き寝入りしない。
                </span>
              </h1>

              <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-2xl md:text-xl">
                発信者情報開示請求で匿名の投稿者を特定し、
                法的に適切な対応を。<br className="hidden md:block" />
                スクリーンショットを送るだけで、弁護士が今すぐ動きます。
              </p>

              {/* Urgency alert */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 max-w-md">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">
                  <span className="font-bold">重要：</span>
                  投稿ログの保存期間は最大3ヶ月。時間が経つほど発信者の特定が困難になります。
                </p>
              </div>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-95"
                >
                  無料で相談する
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/simulator"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
                >
                  費用をシミュレーション
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {["相談無料", "全国対応", "秘密厳守", "オンライン可"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
            <span className="text-xs tracking-widest">SCROLL</span>
            <div className="h-8 w-px bg-gradient-to-b from-gray-500 to-transparent" />
          </div>
        </section>

        {/* ─── URGENCY STRIP ────────────────────── */}
        <section className="bg-red-700 py-4">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-red-200 flex-shrink-0" />
                <p className="text-sm font-semibold text-white">
                  ⚠️ 投稿のアクセスログは最大3ヶ月で消去されます。被害を受けたら、一日でも早くご相談ください。
                </p>
              </div>
              <Link
                href="/contact"
                className="whitespace-nowrap rounded-lg border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-bold text-white hover:bg-white/20 transition-colors flex-shrink-0"
              >
                今すぐ無料相談 →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── PAIN POINTS ──────────────────────── */}
        <section id="pain" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-12">
              <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">
                こんなお悩みはありませんか？
              </p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                あなたの被害は、<br className="md:hidden" />
                <span className="text-blue-700">法的に解決できます。</span>
              </h2>
              <p className="mt-4 text-gray-500 max-w-xl mx-auto">
                一人で抱え込まないでください。弁護士への相談により、多くの被害が解決できます。
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {painPoints.map((pain, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-sm group-hover:bg-blue-100">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{pain}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm mb-4">
                上記に当てはまる方、または似たような被害を受けている方はお気軽にご相談ください
              </p>
              <Button asChild className="bg-blue-700 hover:bg-blue-800 px-8 py-6 text-base h-auto">
                <Link href="/contact">
                  無料で相談する <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── STATS BAR ────────────────────────── */}
        <section className="bg-[#0a1628] py-14">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-amber-400 md:text-4xl">{s.num}</div>
                  <div className="mt-1 text-sm font-semibold text-white">{s.label}</div>
                  <div className="text-xs text-gray-400">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ABOUT ────────────────────────────── */}
        <section id="about" className="py-20 md:py-28 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              {/* Left: Visual */}
              <div className="relative">
                <div className="relative rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-900 p-8 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/5 translate-x-8 -translate-y-8" />
                  <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/5 -translate-x-6 translate-y-6" />
                  <div className="relative space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">開示請求申立</p>
                        <p className="text-xs text-blue-200">裁判所への申立</p>
                      </div>
                      <div className="ml-auto text-green-400 text-sm font-bold">✓ 申立完了</div>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        <Search className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">IPアドレス取得</p>
                        <p className="text-xs text-blue-200">SNS事業者から開示</p>
                      </div>
                      <div className="ml-auto text-green-400 text-sm font-bold">✓ 取得済</div>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/30">
                        <Users className="h-5 w-5 text-amber-300" />
                      </div>
                      <div>
                        <p className="font-bold">発信者特定</p>
                        <p className="text-xs text-blue-200">プロバイダへ開示請求</p>
                      </div>
                      <div className="ml-auto text-amber-400 text-sm font-bold">→ 進行中</div>
                    </div>
                    <div className="mt-4 rounded-xl bg-white/10 p-4 text-center">
                      <p className="text-2xl font-black text-amber-300">発信者を特定</p>
                      <p className="text-sm text-blue-200">損害賠償請求・刑事告訴へ</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Text */}
              <div>
                <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">
                  発信者情報開示請求とは
                </p>
                <h2 className="text-3xl font-black text-gray-900 md:text-4xl leading-tight">
                  匿名でも、<br />
                  逃げられない。
                </h2>
                <div className="mt-6 space-y-4 text-gray-600">
                  <p>
                    発信者情報開示請求とは、インターネット上で匿名の誹謗中傷・名誉毀損を受けた場合に、
                    その投稿を行った人物の氏名・住所等をプロバイダに開示させる法的手続きです。
                  </p>
                  <p>
                    2022年10月施行の<strong className="text-gray-800">改正プロバイダ責任制限法</strong>により、
                    新たな非訟手続が導入され、従来より迅速に発信者を特定できるようになりました。
                  </p>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    "X（旧Twitter）・Instagram・Facebook等のSNS",
                    "5ちゃんねる・爆サイ等の匿名掲示板",
                    "YouTube・TikTok等の動画プラットフォーム",
                    "各種ブログ・レビューサイト",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FLOW ─────────────────────────────── */}
        <section id="flow" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">
                解決までの流れ
              </p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                4ステップで発信者を特定
              </h2>
            </div>

            {/* Desktop: horizontal timeline */}
            <div className="hidden md:flex items-start gap-0">
              {steps.map((step, i) => (
                <div key={i} className="flex-1 relative">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="absolute top-8 left-1/2 right-0 h-0.5 bg-gradient-to-r from-blue-300 to-blue-100 z-0" style={{ left: "calc(50% + 28px)" }} />
                  )}
                  <div className="relative z-10 flex flex-col items-center text-center px-3">
                    {/* Step circle */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/25 mb-4">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <div className="text-xs font-bold text-blue-500 mb-1">{step.num}</div>
                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">{step.desc}</p>
                    <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                      {step.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: vertical */}
            <div className="flex flex-col gap-0 md:hidden">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-md">
                      <step.icon className="h-5 w-5" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="flex-1 w-0.5 bg-blue-100 my-2" />
                    )}
                  </div>
                  <div className="pb-8 pt-1">
                    <div className="text-xs font-bold text-blue-500 mb-0.5">{step.num}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-2">{step.desc}</p>
                    <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                      {step.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHY AURA ─────────────────────────── */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">
                選ばれる理由
              </p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                なぜ弁護士法人AURAなのか
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md hover:border-blue-100"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEE ──────────────────────────────── */}
        <section id="fee" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">
                費用について
              </p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                透明な費用体系
              </h2>
              <p className="mt-4 text-gray-500 max-w-lg mx-auto">
                費用は事前に丁寧にご説明します。追加費用が発生する場合も、必ず事前にご確認いただきます。
              </p>
            </div>

            <div className="mx-auto max-w-2xl">
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                {/* Header */}
                <div className="bg-[#0a1628] px-6 py-5">
                  <p className="text-white font-bold text-lg">費用の目安</p>
                  <p className="text-gray-400 text-sm">発信者情報開示請求（SNS投稿1件の場合）</p>
                </div>
                {/* Rows */}
                <div className="divide-y divide-gray-100">
                  {[
                    { label: "初回相談料", value: "無料", highlight: true, note: "" },
                    { label: "着手金（SNS仮処分）", value: "110,000円〜", highlight: false, note: "税込" },
                    { label: "着手金（プロバイダ開示）", value: "110,000円〜", highlight: false, note: "税込" },
                    { label: "報酬金（発信者特定時）", value: "110,000円〜", highlight: false, note: "税込" },
                    { label: "実費（収入印紙・郵便等）", value: "数万円程度", highlight: false, note: "案件による" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{row.label}</span>
                        {row.note && <span className="ml-2 text-xs text-gray-400">{row.note}</span>}
                      </div>
                      <span className={`font-bold ${row.highlight ? "text-green-600 text-lg" : "text-gray-900"}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 px-6 py-4">
                  <p className="text-xs text-blue-700">
                    ※ 案件の内容・投稿数・プラットフォームにより費用は変動します。
                    詳細は無料相談にてお見積りします。
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Link href="/fee">
                    <Scale className="mr-2 h-4 w-4" />
                    費用一覧を詳しく見る
                  </Link>
                </Button>
                <Button asChild className="bg-blue-700 hover:bg-blue-800">
                  <Link href="/simulator">
                    費用をシミュレーション
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────── */}
        <section id="faq" className="py-20 md:py-28 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">
                よくある質問
              </p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                まずはここを確認
              </h2>
            </div>
            <LpFaq />
            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm mb-4">解決しない疑問はお気軽にご相談ください</p>
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white px-8 h-12">
                <Link href="/contact">
                  弁護士に直接聞く（無料）<ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0a1628] py-24 md:py-32">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-4 py-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-300">相談は完全無料・秘密厳守</span>
            </div>
            <h2 className="text-3xl font-black text-white md:text-5xl leading-tight">
              一人で悩まず、<br />
              <span className="text-amber-400">今すぐご相談ください。</span>
            </h2>
            <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto">
              スクリーンショット1枚から相談できます。
              弁護士が迅速に状況を確認し、最善の対応策をご提案します。
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-amber-500/20 transition-all hover:bg-amber-400 hover:scale-105 active:scale-100"
              >
                無料相談フォームへ
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="tel:0365555370"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
              >
                <Phone className="h-5 w-5" />
                03-6555-5370
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              平日 10:00〜18:00 受付 ／ メールは24時間受付
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
