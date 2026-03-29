import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { Shield } from "lucide-react";

export const metadata = {
  title: "プライバシーポリシー | 弁護士法人AURA",
  description: "弁護士法人AURAの個人情報保護方針・プライバシーポリシーについてご案内します。",
};

export default function PrivacyPage() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <Shield className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              プライバシーポリシー
            </h1>
            <p className="mt-2 text-sm text-gray-500">個人情報保護方針</p>
          </div>

          {/* Content */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-10">
            <div className="space-y-8 text-sm leading-relaxed text-gray-700">
              {/* 運営者 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">サイト運営者</h2>
                <p>
                  弁護士法人AURA<br />
                  〒105-0014 東京都港区芝2丁目2−15 芝ヒロセビル 4階<br />
                  TEL: 03-6555-5370
                </p>
              </section>

              {/* 基本方針 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">個人情報保護方針</h2>
                <p>
                  弁護士法人AURAは、個人情報の大切さを深く認識しその保護に取り組むことが重要な責務であると考えています。
                  当事務所はこのための基本方針を以下のとおり定めて公表し、全社への徹底を図るとともに関係する各種事業者、
                  業界団体、行政機関等とも協力しお客様の信頼を得られるよう個人情報の保護に努めてまいります。
                </p>
              </section>

              {/* 利用目的 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">個人情報の利用について</h2>
                <p className="mb-3">
                  弁護士法人AURAでは、以下の目的のために個人情報を取得いたします。
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <span className="font-medium text-gray-900">法律関連業務：</span>
                    法律問題に関するご相談、発信者情報開示請求に関するご相談、顧問契約のご相談などのため、
                    当サイトよりフォームを利用して個人情報を取得いたします。
                  </li>
                  <li>
                    <span className="font-medium text-gray-900">案件管理：</span>
                    ご依頼いただいた案件の進行管理、書類作成、裁判手続等のために個人情報を利用いたします。
                  </li>
                  <li>
                    <span className="font-medium text-gray-900">ご連絡：</span>
                    案件の進捗報告、書類の送付、その他ご依頼に関するご連絡のために利用いたします。
                  </li>
                </ul>
                <p className="mt-3">
                  取得した個人情報は、取得目的の範囲内で利用しており、事前承諾なしに、目的外利用や法令に基づかない
                  第三者への提供は行いません。また、個人情報に関する不正アクセス、紛失、改竄、漏洩を防ぐための
                  適切な措置を講じます。
                </p>
              </section>

              {/* 本サイトで取得する情報 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">本サイトで取得する情報</h2>
                <p className="mb-3">
                  当サイト（発信者情報開示請求サポート）では、以下の情報を取得する場合があります。
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>お名前、メールアドレス、電話番号（相談フォーム送信時）</li>
                  <li>ご相談内容、被害に関する詳細情報</li>
                  <li>スクリーンショット等の証拠ファイル（任意でアップロードいただいた場合）</li>
                  <li>依頼者ポータルのアカウント情報（ご依頼後）</li>
                </ul>
              </section>

              {/* セキュリティ */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">安全管理措置</h2>
                <p>
                  当サイトでは、個人情報の漏洩、滅失又は毀損の防止のため、以下の安全管理措置を講じています。
                </p>
                <ul className="list-disc space-y-2 pl-5 mt-3">
                  <li>SSL/TLS暗号化通信による情報の保護</li>
                  <li>アクセス制御によるデータベースへの不正アクセス防止</li>
                  <li>弁護士の守秘義務に基づく厳格な情報管理</li>
                </ul>
              </section>

              {/* Cookie */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">クッキー（Cookie）の利用について</h2>
                <p className="mb-3">
                  当サイトでは、サービス向上およびお客様により適したサービスを提供するため、クッキーを利用しています。
                </p>
                <p className="mb-3">
                  クッキーとはお客様が当サイトをご覧になったという情報を、そのお客様のコンピューター
                  （またはスマートフォンやタブレットなどのインターネット接続可能な機器）内に記憶させておく機能のことです。
                  クッキーを利用することによりご利用のコンピューターのウェブサイト訪問回数や訪問したページなどの情報を
                  取得することができます。なお、クッキーを通じて収集する情報にはお客様個人を識別できる情報は一切含まれておりません。
                </p>
                <p>
                  また、お客様のブラウザの設定によりクッキーの機能を無効にすることもできます。
                  クッキーの機能を無効にしても当サイトのご利用には問題ありません。
                </p>
              </section>

              {/* 開示・訂正・削除 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">個人情報の開示・訂正・削除</h2>
                <p>
                  ご本人から個人情報の開示、訂正、削除等のご請求があった場合は、本人確認を行った上で、
                  法令に基づき適切に対応いたします。ご請求は以下の窓口までご連絡ください。
                </p>
                <div className="mt-3 rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">お問い合わせ窓口</p>
                  <p className="mt-1">弁護士法人AURA</p>
                  <p>TEL: 03-6555-5370（平日 10:00〜18:00）</p>
                </div>
              </section>

              {/* 改定 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">プライバシーポリシーの改定</h2>
                <p>
                  当事務所は、個人情報の取り扱いに関する運用状況を適宜見直し、継続的な改善に努めるものとし、
                  必要に応じて本プライバシーポリシーを変更することがあります。変更した場合は、当サイトに掲載いたします。
                </p>
              </section>

              <p className="pt-4 text-right text-xs text-gray-400">
                制定日：2025年1月1日
              </p>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
