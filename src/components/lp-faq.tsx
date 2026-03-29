"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "相談だけでも大丈夫ですか？",
    a: "もちろんです。初回相談は完全無料で、相談後に依頼いただかなくても問題ございません。まずは被害の状況をお聞かせください。",
  },
  {
    q: "削除された投稿でも開示請求できますか？",
    a: "削除後も一定期間はプロバイダにログが保存されています。ただし保存期間は最大3〜6ヶ月程度のため、気づいた時点でお早めにご相談ください。時間が経つほど困難になります。",
  },
  {
    q: "費用はいくらかかりますか？",
    a: "着手金は20万円〜が目安です。案件の難易度・投稿数・利用するSNSによって異なります。費用シミュレーターでおおよその金額をご確認いただけます。相談は無料ですのでまずはお問い合わせください。",
  },
  {
    q: "必ず発信者を特定できますか？",
    a: "残念ながら100%の保証はできません。ログが既に削除されている場合や、VPN・海外サーバー利用の場合は特定が難しいことがあります。相談時に可能性についてご説明いたします。",
  },
  {
    q: "どのSNS・サービスに対応していますか？",
    a: "X（旧Twitter）、Instagram、Facebook、YouTube、TikTok、5ちゃんねる・爆サイ等の掲示板、各種ブログサービスに対応しています。対象外のサービスについてもご相談ください。",
  },
  {
    q: "地方在住でも依頼できますか？",
    a: "はい、全国対応しています。オンライン相談も可能ですので、遠方の方もお気軽にお問い合わせください。",
  },
  {
    q: "手続きにどれくらいの期間がかかりますか？",
    a: "仮処分申立からプロバイダへの開示命令まで、概ね3〜6ヶ月程度が目安です。裁判所の混雑状況や相手方の対応によって変わることがあります。",
  },
  {
    q: "個人情報は安全ですか？",
    a: "弁護士には厳格な守秘義務があります。ご相談内容・個人情報は厳重に管理し、第三者に漏洩することは一切ありません。",
  },
];

export function LpFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
        >
          <button
            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <span className="font-semibold text-gray-900 text-sm md:text-base">
              <span className="mr-3 text-blue-600">Q.</span>
              {faq.q}
            </span>
            <ChevronDown
              className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                openIndex === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              <p className="text-sm leading-relaxed text-gray-700">
                <span className="mr-3 font-bold text-amber-600">A.</span>
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
