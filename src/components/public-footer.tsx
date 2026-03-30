import Link from "next/link";
import { ArrowRight } from "lucide-react";

const footerLinks = {
  service: [
    { href: "/#pain", label: "こんな被害に" },
    { href: "/#about", label: "発信者情報開示請求とは" },
    { href: "/#flow", label: "手続きの流れ" },
    { href: "/fee", label: "費用一覧" },
    { href: "/simulator", label: "費用シミュレーター" },
    { href: "/#faq", label: "よくある質問" },
  ],
  contact: [
    { href: "/contact", label: "無料相談フォーム" },
    { href: "tel:0365555373", label: "TEL: 03-6555-5373" },
    { href: "/portal/login", label: "依頼者ポータル" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Top CTA bar */}
      <div className="border-b border-gray-800 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm text-gray-300 font-medium">
            ネット誹謗中傷の被害を受けていますか？今すぐ弁護士に相談できます。
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-400 transition-colors flex-shrink-0"
          >
            無料相談する <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-white text-base block leading-none">弁護士法人AURA</span>
                <span className="text-xs text-gray-500 leading-tight">発信者情報開示請求サポート（法人用）</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              ネット上の誹謗中傷・名誉毀損でお悩みの方を、
              専門的な法的手続きで全力サポートいたします。
            </p>
            <div className="mt-5 space-y-1.5 text-sm">
              <p className="text-gray-300 font-medium">
                〒105-0014 東京都港区芝2丁目2−15<br />
                芝ヒロセビル 4階
              </p>
              <p>TEL: <a href="tel:0365555373" className="text-blue-400 hover:text-blue-300">03-6555-5373</a></p>
              <p>FAX: 03-6636-5096</p>
              <p>平日 10:00〜18:00</p>
            </div>
            <a
              href="https://auralaw.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              事務所公式サイト <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Service links */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white tracking-wide">サービス</h3>
            <ul className="space-y-2.5">
              {footerLinks.service.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact links */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white tracking-wide">お問い合わせ</h3>
            <ul className="space-y-2.5">
              {footerLinks.contact.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-gray-800 p-4">
              <p className="text-xs font-bold text-white mb-1">メール相談（24時間受付）</p>
              <p className="text-xs text-gray-400">フォームからご送信ください。翌営業日中に返信いたします。</p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                相談フォームへ <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 flex flex-col items-center gap-2 md:flex-row md:justify-between text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} 弁護士法人AURA All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">利用規約</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
