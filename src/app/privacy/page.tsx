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
                  TEL: 03-6555-5373
                </p>
              </section>

              {/* 基本方針 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第1条（個人情報保護方針）</h2>
                <p>
                  弁護士法人AURA（以下「当事務所」といいます。）は、個人情報の保護が重要な社会的責務であると認識し、
                  個人情報の保護に関する法律（個人情報保護法）、弁護士法その他関係法令及び弁護士職務基本規程を遵守し、
                  お客様の個人情報を適切に取り扱うことをここに宣言いたします。
                </p>
              </section>

              {/* 利用目的 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第2条（個人情報の利用目的）</h2>
                <p className="mb-3">
                  当事務所は、以下の目的のために個人情報を取得し利用いたします。
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <span className="font-medium text-gray-900">法律相談・受任業務：</span>
                    発信者情報開示請求、誹謗中傷対応、仮処分命令申立、損害賠償請求等の法律相談・事件処理のため
                  </li>
                  <li>
                    <span className="font-medium text-gray-900">案件管理：</span>
                    ご依頼いただいた案件の進行管理、書類作成、裁判手続、プロバイダとの交渉等のため
                  </li>
                  <li>
                    <span className="font-medium text-gray-900">ご連絡：</span>
                    案件の進捗報告、書類の送付、ご請求、その他ご依頼に関するご連絡のため
                  </li>
                  <li>
                    <span className="font-medium text-gray-900">業務効率化：</span>
                    相談内容の整理・分類・要約等、弁護士の業務補助のための生成AI利用（第5条に定める）
                  </li>
                </ul>
                <p className="mt-3">
                  取得した個人情報は、上記の利用目的の範囲内で利用いたします。利用目的を超えた利用や、
                  法令に基づかない第三者提供は行いません。
                </p>
              </section>

              {/* 本サイトで取得する情報 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第3条（取得する個人情報）</h2>
                <p className="mb-3">
                  当サイト（発信者情報開示請求サポート）では、以下の情報を取得する場合があります。
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>お名前、メールアドレス、電話番号（相談フォーム送信時）</li>
                  <li>ご相談内容、被害に関する詳細情報（自由記述欄）</li>
                  <li>スクリーンショット等の証拠ファイル（任意でアップロードいただいた場合）</li>
                  <li>依頼者ポータルのアカウント情報（ご依頼後）</li>
                  <li>アクセスログ、Cookie、IPアドレス等の技術情報</li>
                </ul>
              </section>

              {/* 第三者提供 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第4条（第三者提供）</h2>
                <p>
                  当事務所は、法令に定める場合を除き、あらかじめご本人の同意を得ることなく
                  個人情報を第三者に提供いたしません。ただし、以下の場合は第三者提供に該当しません。
                </p>
                <ul className="list-disc space-y-2 pl-5 mt-3">
                  <li>利用目的の達成に必要な範囲で業務を委託する場合（第5条に定める外部サービスを含む）</li>
                  <li>裁判所、プロバイダ、SNS事業者等に対し、ご依頼案件の遂行のために必要な情報を提供する場合</li>
                  <li>法令に基づく場合</li>
                </ul>
              </section>

              {/* AI委託 ── 最重要セクション */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第5条（生成AI（人工知能）の利用）</h2>
                <p className="mb-3">
                  当事務所は、業務効率化および弁護士の業務補助を目的として、以下のとおり生成AIサービス
                  （外部事業者がAPI経由で提供するもの）を利用することがあります。
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">1. 利用目的</p>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>相談内容の整理・分類・要約</li>
                      <li>法的論点の抽出補助</li>
                      <li>書類作成の補助（ドラフト作成等）</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-2">2. 委託する可能性のある事業者</p>
                    <p className="mb-2 text-xs text-gray-500">
                      以下は当事務所が利用または将来利用する可能性のある生成AI提供事業者です。
                      いずれも米国その他外国に所在しており、当該国における個人情報保護制度は
                      日本と異なる場合があります。
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>Anthropic, PBC（米国） ── Claude</li>
                      <li>OpenAI, L.L.C.（米国） ── ChatGPT, GPT等</li>
                      <li>Google LLC / Google DeepMind（米国・英国） ── Gemini</li>
                      <li>Microsoft Corporation（米国） ── Copilot, Azure OpenAI Service</li>
                      <li>Amazon Web Services, Inc.（米国） ── Bedrock</li>
                      <li>Meta Platforms, Inc.（米国） ── Llama</li>
                      <li>xAI Corp.（米国） ── Grok</li>
                      <li>Mistral AI SAS（フランス） ── Mistral</li>
                      <li>Cohere Inc.（カナダ） ── Command</li>
                      <li>その他、当事務所が別途定め本ポリシーに追記する事業者</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-2">3. 安全管理措置</p>
                    <ul className="list-disc space-y-1 pl-5">
                      <li>
                        氏名・住所・電話番号・メールアドレス等の直接識別情報は、
                        可能な限り削除または仮名化してから送信いたします。
                      </li>
                      <li>
                        各事業者との利用規約・データ処理契約（DPA）に基づき、
                        送信データがAIモデルの学習に利用されないオプトアウト設定を行います。
                      </li>
                      <li>送信内容・出力内容は監査ログとして記録・保存します。</li>
                      <li>
                        AIの出力は必ず弁護士が確認・検証した上で利用し、
                        AIが直接お客様への法的判断・回答を行うことはありません。
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-2">4. 外国にある第三者への提供に関する事項（個人情報保護法第28条関係）</p>
                    <p>
                      上記AI提供事業者はいずれも外国に所在しています。当事務所は個人情報保護法第28条に基づき、
                      委託先の所在国の制度、委託先が講ずる個人情報保護措置に関する情報提供を求められた場合、
                      下記お問い合わせ窓口にて対応いたします。
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-2">5. AI出力の責任</p>
                    <p>
                      AIによる出力はあくまで弁護士の業務補助のための参考情報であり、
                      お客様への法的助言・最終的な事件処理の判断は全て弁護士が行います。
                      法的助言・書類内容・判断の最終的な責任は当事務所の担当弁護士が負います。
                    </p>
                  </div>
                </div>
              </section>

              {/* セキュリティ */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第6条（安全管理措置）</h2>
                <p>
                  当事務所は、個人情報の漏洩、滅失又は毀損の防止のため、以下の安全管理措置を講じています。
                </p>
                <ul className="list-disc space-y-2 pl-5 mt-3">
                  <li>SSL/TLS暗号化通信による情報の保護</li>
                  <li>アクセス制御・認証（二要素認証を含む）によるデータベースへの不正アクセス防止</li>
                  <li>監査ログによる操作履歴の記録</li>
                  <li>弁護士法第23条に定める守秘義務に基づく厳格な情報管理</li>
                  <li>職員への個人情報保護教育の実施</li>
                </ul>
              </section>

              {/* Cookie */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第7条（クッキー（Cookie）の利用）</h2>
                <p className="mb-3">
                  当サイトでは、サービス向上およびお客様により適したサービスを提供するため、Cookieを利用しています。
                  Cookieを通じて収集する情報には、お客様個人を直接識別できる情報は含まれません。
                </p>
                <p>
                  ブラウザの設定によりCookie機能を無効にすることもできます。無効にした場合でも、
                  当サイトの基本的な閲覧は可能ですが、一部機能が制限される場合があります。
                </p>
              </section>

              {/* 開示・訂正・削除 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第8条（個人情報の開示・訂正・削除等）</h2>
                <p>
                  ご本人から個人情報の開示、訂正、追加、削除、利用停止等のご請求があった場合は、
                  本人確認を行った上で、法令に基づき合理的な期間内に適切に対応いたします。
                </p>
                <div className="mt-3 rounded-lg bg-gray-50 p-4">
                  <p className="font-medium text-gray-900">お問い合わせ窓口</p>
                  <p className="mt-1">弁護士法人AURA 個人情報保護担当</p>
                  <p>〒105-0014 東京都港区芝2丁目2−15 芝ヒロセビル 4階</p>
                  <p>TEL: 03-6555-5373（平日 10:00〜18:00）</p>
                </div>
              </section>

              {/* 改定 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第9条（本ポリシーの改定）</h2>
                <p>
                  当事務所は、法令の改正、業務内容の変更、AI提供事業者の追加・変更等に応じて、
                  本プライバシーポリシーを改定することがあります。改定後のポリシーは、
                  当サイトに掲載した時点で効力を生じるものとします。重要な変更がある場合は、
                  サイト上でご案内いたします。
                </p>
              </section>

              <p className="pt-4 text-right text-xs text-gray-400">
                制定日：2025年1月1日<br />
                改定日：2026年4月10日
              </p>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
