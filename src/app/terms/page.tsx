import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { FileText } from "lucide-react";

export const metadata = {
  title: "利用規約 | 弁護士法人AURA",
  description: "弁護士法人AURA 発信者情報開示請求サポートの利用規約です。",
};

export default function TermsPage() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <FileText className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              利用規約
            </h1>
            <p className="mt-2 text-sm text-gray-500">発信者情報開示請求サポート</p>
          </div>

          {/* Content */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-10">
            <div className="space-y-8 text-sm leading-relaxed text-gray-700">
              {/* 第1条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第1条（適用）</h2>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    本規約は、弁護士法人AURA（以下「当事務所」といいます。）が運営する「発信者情報開示請求サポート」
                    ウェブサイト（以下「本サイト」といいます。）の利用に関する条件を定めるものです。
                  </li>
                  <li>
                    利用者は、本サイトを利用することにより、本規約に同意したものとみなされます。
                  </li>
                </ol>
              </section>

              {/* 第2条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第2条（定義）</h2>
                <p>本規約において、次の用語はそれぞれ以下の意味で使用します。</p>
                <ol className="list-decimal space-y-2 pl-5 mt-2">
                  <li>「利用者」とは、本サイトを閲覧し、または本サイトの機能を利用するすべての方をいいます。</li>
                  <li>「依頼者」とは、当事務所と委任契約を締結した利用者をいいます。</li>
                  <li>「依頼者ポータル」とは、依頼者が案件の進捗確認・書類共有等に利用するログイン機能をいいます。</li>
                  <li>
                    「生成AI」とは、当事務所が業務補助のために利用する、外部事業者が提供する
                    人工知能（Large Language Model 等）サービスをいいます。
                  </li>
                </ol>
              </section>

              {/* 第3条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第3条（サービスの内容）</h2>
                <p>本サイトでは、以下のサービスを提供します。</p>
                <ol className="list-decimal space-y-2 pl-5 mt-2">
                  <li>発信者情報開示請求に関する情報提供</li>
                  <li>費用シミュレーション機能（概算表示。法的助言を構成しません）</li>
                  <li>無料相談の受付（相談フォーム）</li>
                  <li>依頼者ポータルによる案件進捗確認・メッセージ機能・書類共有</li>
                </ol>
              </section>

              {/* 第4条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第4条（相談フォームの利用）</h2>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    相談フォームからの送信は、法律相談の申込みであり、
                    委任契約の成立を意味するものではありません。
                  </li>
                  <li>
                    相談の受付および初回ご返信は、原則として平日24時間以内に行います
                    （土曜・日曜・祝日に受付されたものは翌営業日中）。ただし、
                    内容・混雑状況により前後することがあります。
                  </li>
                  <li>送信内容に虚偽の情報を含めないでください。</li>
                  <li>
                    アップロードされたファイルは、ご相談内容の確認のために利用し、
                    弁護士法第23条に定める守秘義務のもと厳重に管理されます。
                  </li>
                </ol>
              </section>

              {/* 第5条 ── 生成AI利用 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第5条（生成AIの利用）</h2>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    当事務所は、相談内容の整理・分類・要約、書類作成補助その他業務効率化のため、
                    外部事業者が提供する生成AIサービスを利用することがあります。
                    詳細は別途定めるプライバシーポリシー第5条をご参照ください。
                  </li>
                  <li>
                    利用者は、相談フォーム送信時に所定のチェックボックスにより、
                    生成AIの利用に同意したものとみなされます。
                  </li>
                  <li>
                    当事務所は、生成AIに送信するデータについて、
                    可能な限り個人を直接識別する情報の削除・仮名化を行います。
                  </li>
                  <li>
                    生成AIの出力は、あくまで弁護士の業務補助のための参考情報であり、
                    利用者への法的助言・最終的な事件処理の判断は全て当事務所の担当弁護士が行います。
                  </li>
                  <li>
                    本サイトおよび当事務所から提供される情報・書類における
                    法的助言・判断・最終的な内容の責任は、当事務所の担当弁護士が負います。
                    生成AI自体が利用者に対して法的助言を行うことはありません。
                  </li>
                </ol>
              </section>

              {/* 第6条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第6条（依頼者ポータル）</h2>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>依頼者ポータルの利用には、当事務所が発行するアカウントが必要です。</li>
                  <li>
                    アカウント情報（メールアドレス・パスワード）は、依頼者ご自身の責任で適切に管理してください。
                    第三者への譲渡・貸与はできません。
                  </li>
                  <li>
                    アカウントの不正利用により生じた損害について、当事務所は責任を負いません。
                    ただし、当事務所に故意または重大な過失がある場合はこの限りではありません。
                  </li>
                </ol>
              </section>

              {/* 第7条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第7条（禁止事項）</h2>
                <p>利用者は、本サイトの利用にあたり、以下の行為を行ってはなりません。</p>
                <ol className="list-decimal space-y-2 pl-5 mt-2">
                  <li>法令または公序良俗に反する行為</li>
                  <li>虚偽の情報を送信する行為</li>
                  <li>本サイトの運営を妨害する行為（大量アクセス、不正アクセス等）</li>
                  <li>他の利用者または第三者の権利を侵害する行為</li>
                  <li>
                    相談フォーム、メッセージ機能その他の入力欄において、
                    生成AIの動作を意図的に改変・操作することを目的とした指示
                    （プロンプトインジェクション）を送信する行為
                  </li>
                  <li>当事務所の名誉・信用を毀損する行為</li>
                  <li>本サイトのコンテンツを無断で複製・転載する行為</li>
                </ol>
              </section>

              {/* 第8条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第8条（知的財産権）</h2>
                <p>
                  本サイトに掲載されたすべてのコンテンツ（文章、画像、デザイン等）に関する著作権その他の知的財産権は、
                  当事務所または正当な権利者に帰属します。利用者は、当事務所の事前の書面による承諾なく、
                  これらを複製、転載、改変、公衆送信等することはできません。
                </p>
              </section>

              {/* 第9条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第9条（免責事項）</h2>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>
                    本サイトに掲載された情報および費用シミュレーターの結果は、一般的な法律情報・概算の提供を目的としたものであり、
                    個別の法律相談・確定的な見積もりを構成するものではありません。
                    具体的な法律問題・費用については、必ず弁護士にご相談ください。
                  </li>
                  <li>
                    当事務所は、本サイトの情報の正確性・完全性について合理的な努力を行いますが、
                    その内容を保証するものではありません。
                  </li>
                  <li>
                    システム障害、メンテナンス、外部AI事業者の障害等により本サイト又は関連機能が
                    一時的に利用できない場合があります。これにより利用者に生じた損害について、
                    当事務所の故意または重大な過失による場合を除き、責任を負いません。
                  </li>
                </ol>
              </section>

              {/* 第10条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第10条（サービスの変更・中止）</h2>
                <p>
                  当事務所は、利用者に事前の通知なく、本サイトのサービス内容を変更し、
                  または提供を中止することがあります。
                </p>
              </section>

              {/* 第11条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第11条（規約の変更）</h2>
                <p>
                  当事務所は、必要に応じて本規約を変更することがあります。変更後の規約は、
                  本サイトに掲載した時点で効力を生じるものとします。
                </p>
              </section>

              {/* 第12条 */}
              <section>
                <h2 className="mb-3 text-base font-bold text-gray-900">第12条（準拠法・管轄）</h2>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>本規約の解釈は、日本法に準拠するものとします。</li>
                  <li>
                    本サイトの利用に関して紛争が生じた場合は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                  </li>
                </ol>
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
