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
  XCircle,
  TrendingDown,
} from "lucide-react";

const painPoints = [
  { icon: "💬", text: "SNSで事実無根の誹謗中傷を繰り返しされている" },
  { icon: "📸", text: "匿名の掲示板に個人情報・写真を無断で晒された" },
  { icon: "🎥", text: "元交際相手に画像・動画を無断投稿された" },
  { icon: "⭐", text: "事業・店舗に悪意ある虚偽の口コミを大量投稿された" },
  { icon: "📢", text: "会社・個人の名誉を傷つける嘘の情報が拡散されている" },
  { icon: "😰", text: "脅迫・ストーカー行為をネット上で継続的にされている" },
];

const steps = [
  {
    num: "01",
    icon: MessageSquare,
    title: "無料相談・受任",
    desc: "スクリーンショットを送るだけ。AIが相談内容を整理し、弁護士が方針をご提案します。",
    duration: "平日24h以内",
    color: "bg-blue-600",
  },
  {
    num: "02",
    icon: FileText,
    title: "仮処分命令申立",
    desc: "仮処分命令申立により、投稿の削除とIPアドレスの開示請求を行います。",
    duration: "1〜2ヶ月",
    color: "bg-indigo-600",
  },
  {
    num: "03",
    icon: Search,
    title: "プロバイダへ開示請求",
    desc: "プロバイダに対するIPアドレス保有者の契約者情報（住所・氏名）、またはSNS運営業者に対するアカウント情報（電話番号・メールアドレス）の開示請求を行います。",
    duration: "1〜3ヶ月",
    color: "bg-violet-600",
  },
  {
    num: "04",
    icon: Shield,
    title: "発信者特定・法的措置",
    desc: "特定した発信者に対し、損害賠償請求・刑事告訴等の法的措置を行います。",
    duration: "状況に応じて",
    color: "bg-purple-700",
  },
];

const features = [
  {
    icon: Scale,
    title: "発信者情報開示の専門チーム",
    desc: "開示請求案件を専門に扱うチームが担当。複雑な案件にも豊富な対応経験があります。",
  },
  {
    icon: Zap,
    title: "スピード最優先の対応",
    desc: "ログの保存期間は最大3ヶ月。相談翌日から手続きを開始できる体制を整えています。",
  },
  {
    icon: Users,
    title: "依頼者専用ポータル",
    desc: "オンラインポータルで案件の進捗をリアルタイム確認。いつでも弁護士とメッセージできます。",
  },
  {
    icon: Shield,
    title: "弁護士の守秘義務",
    desc: "ご相談内容・個人情報は弁護士の守秘義務により完全に保護。秘密厳守で対応します。",
  },
  {
    icon: MessageSquare,
    title: "全国・オンライン完結",
    desc: "来所不要。メール・オンラインで全国どこからでも依頼から解決まで対応可能です。",
  },
  {
    icon: FileText,
    title: "費用の透明性",
    desc: "着手前に費用を明確にご説明します。費用シミュレーターでいつでも概算を確認できます。",
  },
];

const stats = [
  { num: "無料", label: "初回相談料", sub: "費用ゼロでご相談" },
  { num: "6+", label: "対応SNS・媒体", sub: "X・Instagram・掲示板等" },
  { num: "最大3ヶ月", label: "ログ保存期間", sub: "早期相談が鍵" },
  { num: "全国", label: "対応エリア", sub: "オンライン相談可" },
];

// 比較表データ
const comparisons = [
  { item: "発信者の特定", self: false, lawyer: true },
  { item: "裁判所への申立", self: false, lawyer: true },
  { item: "プロバイダとの交渉", self: "困難", lawyer: true },
  { item: "証拠の適切な保全", self: "不確実", lawyer: true },
  { item: "損害賠償請求", self: false, lawyer: true },
  { item: "刑事告訴のサポート", self: false, lawyer: true },
  { item: "精神的負担", self: "大", lawyer: "最小限" },
];

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1 pb-16 md:pb-0">

        {/* ─── HERO ─────────────────────────────── */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a1628]">
          {/* Grid pattern */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Radial glow */}
          <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 h-64 w-64 rounded-full bg-amber-500/8 blur-3xl" />
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          <div className="relative mx-auto max-w-6xl px-4 md:px-6 py-32 md:py-0 w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Copy */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-semibold text-amber-300 tracking-wider">
                    2022年改正プロバイダ責任制限法対応
                  </span>
                </div>

                <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-white md:text-5xl lg:text-6xl">
                  SNSでの<br />
                  誹謗中傷（名誉毀損）<br />
                  <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    泣き寝入りしない
                  </span>
                </h1>

                <p className="mt-6 text-base text-gray-300 leading-relaxed md:text-lg">
                  仮処分命令申立で投稿を削除し、<br className="hidden md:block" />
                  発信者情報開示請求で匿名の投稿者を特定する。<br />
                  AIが即座に相談内容を整理し、弁護士が最短24時間以内（平日）にご提案します。
                </p>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 max-w-sm">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200 leading-relaxed">
                    <span className="font-bold">投稿ログは最大3ヶ月で消去。</span>
                    気づいた今日が、行動できる最後のチャンスかもしれません。
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/contact"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-400 active:scale-95"
                  >
                    AI無料相談
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/simulator"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  >
                    費用シミュレーション
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {["相談無料", "秘密厳守", "全国対応", "オンライン完結"].map((t) => (
                    <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Visual card mock */}
              <div className="hidden md:block">
                <div className="relative">
                  {/* Main card */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">案件進捗</span>
                      <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">進行中</span>
                    </div>
                    {[
                      { label: "受任・委任契約", done: true, date: "完了" },
                      { label: "仮処分申立（裁判所）", done: true, date: "完了" },
                      { label: "IPアドレス取得", done: true, date: "完了" },
                      { label: "プロバイダへ開示請求", done: false, date: "進行中", active: true },
                      { label: "発信者特定・法的措置", done: false, date: "待機中" },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold
                          ${step.done ? "bg-green-500 text-white" : step.active ? "bg-amber-500 text-white" : "bg-white/10 text-gray-500"}`}>
                          {step.done ? "✓" : i + 1}
                        </div>
                        <span className={`flex-1 text-sm ${step.done ? "text-gray-300" : step.active ? "text-white font-medium" : "text-gray-500"}`}>
                          {step.label}
                        </span>
                        <span className={`text-xs ${step.active ? "text-amber-400 font-medium" : step.done ? "text-green-400" : "text-gray-600"}`}>
                          {step.date}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>進捗</span>
                        <span className="text-blue-400">60%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-blue-500 to-amber-500" />
                      </div>
                    </div>
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 rounded-xl border border-green-400/30 bg-[#0a1628] px-4 py-2.5 shadow-xl">
                    <p className="text-xs text-gray-400">担当弁護士より</p>
                    <p className="text-sm font-semibold text-white mt-0.5">「手続き順調です」</p>
                  </div>
                  {/* Floating badge 2 */}
                  <div className="absolute -bottom-4 -left-4 rounded-xl border border-amber-400/20 bg-[#0a1628] px-4 py-2.5 shadow-xl">
                    <p className="text-[11px] text-amber-400 font-bold">⚠ ログ保存期限</p>
                    <p className="text-xs text-gray-300 mt-0.5">早期対応が重要です</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 text-gray-600">
            <span className="text-[10px] tracking-widest">SCROLL</span>
            <div className="h-8 w-px bg-gradient-to-b from-gray-600 to-transparent" />
          </div>
        </section>

        {/* ─── URGENCY STRIP ────────────────────── */}
        <section className="bg-red-700">
          <div className="mx-auto max-w-6xl px-4 py-3.5">
            <div className="flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-red-200 flex-shrink-0" />
                <p className="text-sm font-medium text-white">
                  <span className="font-bold">⚠ ログの保存期間は最大3ヶ月。</span>
                  時間が経つほど発信者の特定が困難になります。今すぐ相談を。
                </p>
              </div>
              <Link
                href="/contact"
                className="whitespace-nowrap rounded-lg border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-bold text-white hover:bg-white/20 transition-colors flex-shrink-0"
              >
                AI無料相談 →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── PAIN POINTS ──────────────────────── */}
        <section id="pain" className="py-20 md:py-28 bg-white">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">CONCERNS</p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                こんな被害、<span className="text-blue-700">一人で抱えていませんか？</span>
              </h2>
              <p className="mt-4 text-gray-500 text-sm max-w-lg mx-auto">
                誹謗中傷は放置するほど被害が拡大します。早期の法的対応が解決への近道です。
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {painPoints.map((pain, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3.5 rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm"
                >
                  <span className="text-2xl leading-none mt-0.5">{pain.icon}</span>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{pain.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button asChild className="bg-blue-700 hover:bg-blue-800 h-12 px-8 text-base">
                <Link href="/contact">
                  まず無料で相談する <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-3 text-xs text-gray-400">相談無料・秘密厳守・全国対応</p>
            </div>
          </div>
        </section>

        {/* ─── STATS ────────────────────────────── */}
        <section className="bg-[#0a1628] py-14">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-amber-400 md:text-3xl lg:text-4xl">{s.num}</div>
                  <div className="mt-1.5 text-sm font-semibold text-white">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHY ACT NOW ─────────────────────── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-bold text-red-600 tracking-widest uppercase mb-3">TIME IS CRITICAL</p>
                <h2 className="text-3xl font-black text-gray-900 md:text-4xl leading-tight">
                  なぜ今すぐ<br />
                  行動すべきなのか
                </h2>
                <p className="mt-5 text-gray-600 leading-relaxed">
                  ネット上の投稿は「消えたから大丈夫」ではありません。
                  SNS・プロバイダのサーバーには一定期間ログが残っていますが、
                  <strong className="text-gray-900">この期間を過ぎると永久に証拠が消滅</strong>します。
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    { phase: "投稿直後〜3ヶ月", status: "ok", text: "ログ保存中。発信者特定の可能性が高い" },
                    { phase: "3ヶ月〜6ヶ月", status: "warn", text: "プロバイダによっては既に消去の可能性" },
                    { phase: "6ヶ月以上経過", status: "ng", text: "ログ消去済みの可能性が高く、特定困難" },
                  ].map((row) => (
                    <div key={row.phase} className={`flex items-start gap-3 rounded-xl p-4 border ${
                      row.status === "ok" ? "bg-green-50 border-green-200" :
                      row.status === "warn" ? "bg-amber-50 border-amber-200" :
                      "bg-red-50 border-red-200"
                    }`}>
                      <div className={`mt-0.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                        row.status === "ok" ? "bg-green-500" :
                        row.status === "warn" ? "bg-amber-500" : "bg-red-500"
                      }`} />
                      <div>
                        <p className={`text-xs font-bold mb-0.5 ${
                          row.status === "ok" ? "text-green-700" :
                          row.status === "warn" ? "text-amber-700" : "text-red-700"
                        }`}>{row.phase}</p>
                        <p className="text-sm text-gray-700">{row.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 弁護士なし vs あり 比較 */}
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">COMPARISON</p>
                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                    <div className="py-3 px-4 text-xs font-bold text-gray-500">項目</div>
                    <div className="py-3 px-4 text-xs font-bold text-center text-gray-500 border-l border-gray-200">
                      <XCircle className="h-4 w-4 text-red-400 mx-auto mb-0.5" />
                      自分で対応
                    </div>
                    <div className="py-3 px-4 text-xs font-bold text-center text-white bg-blue-700 border-l border-blue-600">
                      <CheckCircle className="h-4 w-4 text-blue-200 mx-auto mb-0.5" />
                      弁護士に依頼
                    </div>
                  </div>
                  {comparisons.map((row, i) => (
                    <div key={i} className={`grid grid-cols-3 border-b border-gray-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <div className="py-3 px-4 text-xs text-gray-700 font-medium">{row.item}</div>
                      <div className="py-3 px-4 text-center border-l border-gray-100">
                        {row.self === false ? (
                          <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">{row.self}</span>
                        )}
                      </div>
                      <div className="py-3 px-4 text-center border-l border-blue-50 bg-blue-50/50">
                        {row.lawyer === true ? (
                          <CheckCircle className="h-4 w-4 text-blue-600 mx-auto" />
                        ) : (
                          <span className="text-xs text-blue-700 font-medium">{row.lawyer}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ABOUT ────────────────────────────── */}
        <section id="about" className="py-20 md:py-28 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">WHAT IS IT</p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                発信者情報開示請求とは
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-5 text-gray-600">
                <p className="text-base leading-relaxed">
                  発信者情報開示請求とは、インターネット上で<strong className="text-gray-900">匿名の誹謗中傷・名誉毀損</strong>を受けた場合に、
                  その投稿を行った人物の氏名・住所等をSNS事業者やプロバイダに開示させる法的手続きです。
                </p>
                <p className="text-base leading-relaxed">
                  2022年10月施行の<strong className="text-gray-900">改正プロバイダ責任制限法</strong>により、
                  新たな非訟手続が導入され、従来より迅速・低コストで発信者を特定できるようになりました。
                </p>
                <div className="rounded-xl bg-white border border-blue-100 p-5">
                  <p className="text-sm font-bold text-blue-800 mb-3">対応可能なサービス・媒体</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "X（旧Twitter）",
                      "Instagram",
                      "Facebook / YouTube",
                      "TikTok",
                      "5ちゃんねる・爆サイ",
                      "各種ブログ・口コミサイト",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual */}
              <div className="relative rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-900 p-7 text-white overflow-hidden">
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
                <div className="relative space-y-5">
                  <p className="text-xs font-bold text-blue-200 tracking-widest uppercase">開示請求の流れ</p>
                  {[
                    { step: "STEP 1", label: "裁判所へ申立", icon: "⚖️", done: true },
                    { step: "STEP 2", label: "SNS事業者からIPアドレス取得", icon: "🔍", done: true },
                    { step: "STEP 3", label: "プロバイダへ開示請求", icon: "📡", done: false },
                    { step: "STEP 4", label: "発信者の氏名・住所を取得", icon: "👤", done: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xl">{s.icon}</span>
                      <div className="flex-1">
                        <p className="text-[10px] text-blue-300 font-bold">{s.step}</p>
                        <p className={`text-sm font-medium ${s.done ? "text-white" : "text-blue-200"}`}>{s.label}</p>
                      </div>
                      {s.done && <span className="text-green-400 text-xs font-bold">✓ 完了</span>}
                    </div>
                  ))}
                  <div className="pt-3 border-t border-white/10 text-center">
                    <p className="text-amber-300 font-bold">→ 損害賠償請求・刑事告訴へ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FLOW ─────────────────────────────── */}
        <section id="flow" className="py-20 md:py-28 bg-white">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">PROCESS</p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                4ステップで発信者を特定
              </h2>
              <p className="mt-4 text-gray-500 text-sm">全手続きをAURAの弁護士チームが担当します</p>
            </div>

            {/* Desktop */}
            <div className="hidden md:grid grid-cols-4 gap-0">
              {steps.map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center px-4">
                  {i < steps.length - 1 && (
                    <div className="absolute top-8 left-[calc(50%+32px)] right-0 h-0.5 bg-gradient-to-r from-gray-300 to-gray-100 z-0" />
                  )}
                  <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} text-white shadow-lg mb-4`}>
                    <step.icon className="h-7 w-7" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-gray-700 shadow">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{step.desc}</p>
                  <span className="inline-block rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                    {step.duration}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-0 md:hidden">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${step.color} text-white shadow-md`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    {i < steps.length - 1 && <div className="flex-1 w-0.5 bg-gray-200 my-2" />}
                  </div>
                  <div className="pb-8 pt-1 flex-1">
                    <div className="text-xs font-black text-gray-400 mb-0.5">{step.num}</div>
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
              <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">WHY AURA</p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                弁護士法人AURAが選ばれる理由
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md hover:border-blue-100"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEE ──────────────────────────────── */}
        <section id="fee" className="py-20 md:py-28 bg-white">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">FEE</p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                透明な費用体系
              </h2>
              <p className="mt-4 text-gray-500 text-sm max-w-lg mx-auto">
                依頼前に費用を丁寧にご説明します。費用が不明確なまま進めることはありません。
              </p>
            </div>
            <div className="mx-auto max-w-2xl">
              <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm">
                <div className="bg-[#0a1628] px-7 py-5">
                  <p className="text-white font-bold text-lg">費用の目安</p>
                  <p className="text-gray-400 text-sm mt-0.5">SNS投稿1件の場合（税込）</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: "初回相談料", value: "無料", green: true },
                    { label: "着手金（SNS仮処分申立）", value: "110,000円〜", note: "税込" },
                    { label: "着手金（プロバイダ開示請求）", value: "110,000円〜", note: "税込" },
                    { label: "報酬金（発信者特定成功時）", value: "110,000円〜", note: "税込" },
                    { label: "実費（収入印紙・郵便費等）", value: "数万円程度", note: "案件による" },
                  ].map((row, i) => (
                    <div key={i} className={`flex items-center justify-between px-7 py-4 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                      <div>
                        <span className="text-sm text-gray-700">{row.label}</span>
                        {row.note && <span className="ml-2 text-xs text-gray-400">{row.note}</span>}
                      </div>
                      <span className={`font-bold ${row.green ? "text-green-600 text-lg" : "text-gray-900"}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 px-7 py-4">
                  <p className="text-xs text-blue-700">
                    ※ 案件の内容・投稿数・プラットフォームにより費用が変動する場合があります。詳細は無料相談にて。
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Link href="/fee">
                    <Scale className="mr-2 h-4 w-4" />
                    費用一覧を詳しく見る
                  </Link>
                </Button>
                <Button asChild className="bg-blue-700 hover:bg-blue-800">
                  <Link href="/simulator">費用をシミュレーション</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────── */}
        <section id="faq" className="py-20 md:py-28 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">FAQ</p>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">よくある質問</h2>
            </div>
            <LpFaq />
            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm mb-4">他にご不明な点は、お気軽にご相談ください</p>
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white px-8 h-12 text-base">
                <Link href="/contact">
                  弁護士に直接聞く（無料）<ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0a1628] py-24 md:py-32">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-4 py-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-300">相談は完全無料・秘密厳守</span>
            </div>
            <h2 className="text-3xl font-black text-white md:text-5xl leading-tight">
              一人で悩まず、<br />
              <span className="text-amber-400">今すぐご相談ください。</span>
            </h2>
            <p className="mt-6 text-gray-300 max-w-xl mx-auto">
              スクリーンショットを送るだけ。AIが即座に相談内容を整理し、
              弁護士が最短24時間以内（平日／休日は翌営業日）に対応策をご提案します。
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
                href="tel:0365555373"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
              >
                <Phone className="h-5 w-5" />
                03-6555-5373
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              平日 10:00〜18:00 受付 ／ フォームは24時間受付
            </p>
            <p className="mt-1 text-xs text-gray-600">
              返信: 平日24時間以内／休日は翌営業日
            </p>
            <p className="mt-2 text-xs text-gray-600">
              ※電話での無料相談は当分の間受け付けておりません。フォームよりお問い合わせください。
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
