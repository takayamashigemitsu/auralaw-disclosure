import Link from "next/link";
import { Scale } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-700" />
              <span className="font-bold text-gray-900">
                弁護士法人AURA
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              ネット上の誹謗中傷・名誉毀損でお悩みの方を
              <br />
              法的手続きで全力サポートいたします。
            </p>
            <a
              href="https://auralaw.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-blue-600 hover:underline"
            >
              事務所公式サイト &rarr;
            </a>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">サービス</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/#about" className="hover:text-blue-700">
                  発信者情報開示請求とは
                </Link>
              </li>
              <li>
                <Link href="/#flow" className="hover:text-blue-700">
                  手続きの流れ
                </Link>
              </li>
              <li>
                <Link href="/simulator" className="hover:text-blue-700">
                  費用シミュレーター
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-700">
                  無料相談
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">お問い合わせ</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>TEL: 03-6555-5370</li>
              <li>FAX: 03-6636-5096</li>
              <li>営業時間: 平日 10:00〜18:00</li>
              <li>
                〒105-0014
                <br />
                東京都港区芝2丁目2−15
                <br />
                芝ヒロセビル 4階
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} 弁護士法人AURA All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
