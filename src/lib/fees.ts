/**
 * 料金マスターデータ
 *
 * 料金表ページ・シミュレーター・管理画面の費用計算が
 * すべてこのデータを参照する。金額変更はここだけ。
 */

// ─── 型定義 ───
export type FeeCategory =
  | "DELETION"
  | "DISCLOSURE_FULL"
  | "IDENTIFICATION_TO_LAWSUIT"
  | "POSTER_SIDE"
  | "INDIVIDUAL_DISCLOSURE"
  | "DISCLOSURE_ORDER"
  | "DAMAGES_LAWSUIT"
  | "OTHER"
  | "COURT_ATTENDANCE"
  | "CONSULTATION";

export type FeeItem = {
  id: string;
  category: FeeCategory;
  name: string;
  amount: number; // 税込金額（円）
  displayFee: string; // 表示用文字列（"22万円" 等）
  reward?: string;
  note?: string;
};

export type FeeSection = {
  category: FeeCategory;
  title: string;
  description?: string;
  items: FeeItem[];
};

// ─── 全料金項目 ───
export const FEE_ITEMS: FeeItem[] = [
  // 削除請求
  {
    id: "deletion_site_admin",
    category: "DELETION",
    name: "サイト管理者に対する投稿の削除仮処分・訴訟（5投稿以内）",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "deletion_poster",
    category: "DELETION",
    name: "投稿者に対する投稿の削除仮処分・訴訟（5投稿以内）",
    amount: 330000,
    displayFee: "33万円",
    reward: "なし",
  },
  {
    id: "deletion_search_results",
    category: "DELETION",
    name: "検索結果の削除仮処分・訴訟（20検索結果以内）",
    amount: 330000,
    displayFee: "33万円",
    reward: "なし",
  },

  // 発信者情報開示請求（最後まで）
  {
    id: "disclosure_full_1post",
    category: "DISCLOSURE_FULL",
    name: "1投稿（投稿者特定）",
    amount: 330000,
    displayFee: "33万円",
    reward: "なし",
  },
  {
    id: "disclosure_full_1post_with_deletion",
    category: "DISCLOSURE_FULL",
    name: "1投稿（投稿者特定及び削除請求）",
    amount: 440000,
    displayFee: "44万円",
    reward: "なし",
  },

  // 投稿者特定から慰謝料請求訴訟まで
  {
    id: "ident_to_lawsuit_designated",
    category: "IDENTIFICATION_TO_LAWSUIT",
    name: "X（旧Twitter）、Instagram等の指定サイト",
    amount: 440000,
    displayFee: "44万円",
    reward: "なし",
  },
  {
    id: "ident_to_lawsuit_other",
    category: "IDENTIFICATION_TO_LAWSUIT",
    name: "上記以外のサイト",
    amount: 550000,
    displayFee: "55万円",
    reward: "なし",
  },

  // 投稿者側の対応
  {
    id: "poster_side_opinion_and_defense",
    category: "POSTER_SIDE",
    name: "意見照会回答＋被告側訴訟対応",
    amount: 330000,
    displayFee: "33万円",
    reward: "なし",
  },
  {
    id: "poster_side_opinion_only",
    category: "POSTER_SIDE",
    name: "意見照会回答のみ",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "poster_side_defense_only",
    category: "POSTER_SIDE",
    name: "被告側訴訟対応のみ",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "poster_side_negotiation_and_defense",
    category: "POSTER_SIDE",
    name: "任意交渉対応＋被告側訴訟対応",
    amount: 330000,
    displayFee: "33万円",
    reward: "なし",
  },

  // 個別手続（発信者情報開示請求）
  {
    id: "individual_ip_injunction",
    category: "INDIVIDUAL_DISCLOSURE",
    name: "IPアドレス開示仮処分",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "individual_log_preservation_unlimited",
    category: "INDIVIDUAL_DISCLOSURE",
    name: "ログ保存仮処分（投稿数無制限）",
    amount: 110000,
    displayFee: "11万円",
    reward: "なし",
  },
  {
    id: "individual_log_preservation_5posts",
    category: "INDIVIDUAL_DISCLOSURE",
    name: "ログ保存仮処分（5投稿以内）",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "individual_disclosure_lawsuit_unlimited",
    category: "INDIVIDUAL_DISCLOSURE",
    name: "住所・氏名等の開示請求訴訟（投稿数無制限）",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "individual_disclosure_lawsuit_5posts",
    category: "INDIVIDUAL_DISCLOSURE",
    name: "住所・氏名等の開示請求訴訟（5投稿以内）",
    amount: 330000,
    displayFee: "33万円",
    reward: "なし",
  },
  {
    id: "individual_indirect_enforcement",
    category: "INDIVIDUAL_DISCLOSURE",
    name: "間接強制",
    amount: 55000,
    displayFee: "5万5,000円",
    reward: "なし",
  },
  {
    id: "individual_opinion_response",
    category: "INDIVIDUAL_DISCLOSURE",
    name: "意見照会回答書",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },

  // 発信者情報開示命令事件（非訟手続）
  {
    id: "order_non_google",
    category: "DISCLOSURE_ORDER",
    name: "開示命令申立（Google以外）",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "order_google",
    category: "DISCLOSURE_ORDER",
    name: "開示命令申立（Google）",
    amount: 330000,
    displayFee: "33万円",
    reward: "なし",
  },
  {
    id: "order_provider_unlimited",
    category: "DISCLOSURE_ORDER",
    name: "開示命令申立（接続プロバイダ・投稿数無制限）",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "order_provider_5posts",
    category: "DISCLOSURE_ORDER",
    name: "開示命令申立（接続プロバイダ・5投稿以内）",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "order_indirect_enforcement",
    category: "DISCLOSURE_ORDER",
    name: "間接強制",
    amount: 55000,
    displayFee: "5万5,000円",
    reward: "なし",
  },
  {
    id: "order_objection_lawsuit",
    category: "DISCLOSURE_ORDER",
    name: "異議訴訟",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "order_opinion_response",
    category: "DISCLOSURE_ORDER",
    name: "意見照会回答",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },

  // 慰謝料請求訴訟
  {
    id: "damages_plaintiff_5posts",
    category: "DAMAGES_LAWSUIT",
    name: "原告側（5投稿以内）",
    amount: 330000,
    displayFee: "33万円",
    reward: "なし",
  },
  {
    id: "damages_defendant_5posts",
    category: "DAMAGES_LAWSUIT",
    name: "被告側（5投稿以内）",
    amount: 220000,
    displayFee: "22万円",
    reward: "なし",
  },
  {
    id: "damages_negotiation_5posts",
    category: "DAMAGES_LAWSUIT",
    name: "訴訟外の慰謝料請求示談交渉（請求側・5投稿以内）",
    amount: 330000,
    displayFee: "33万円",
    reward: "なし",
  },
  {
    id: "damages_debt_enforcement",
    category: "DAMAGES_LAWSUIT",
    name: "債権執行",
    amount: 55000,
    displayFee: "5万5,000円",
    reward: "なし",
  },
  {
    id: "damages_property_enforcement",
    category: "DAMAGES_LAWSUIT",
    name: "不動産執行",
    amount: 110000,
    displayFee: "11万円",
    reward: "なし",
  },

  // その他
  {
    id: "other_appeal_etc",
    category: "OTHER",
    name: "保全異議・保全抗告・即時抗告・控訴（1審から未受任時）",
    amount: 100000,
    displayFee: "各10万円",
  },
  {
    id: "other_viewing_restriction",
    category: "OTHER",
    name: "閲覧制限申立・秘匿決定申立",
    amount: 50000,
    displayFee: "1回5万円",
  },
  {
    id: "other_asset_disclosure",
    category: "OTHER",
    name: "財産開示手続申立",
    amount: 100000,
    displayFee: "10万円",
    note: "別途出廷日当",
  },
  {
    id: "other_cost_determination",
    category: "OTHER",
    name: "訴訟費用額確定処分申立",
    amount: 30000,
    displayFee: "3万円",
  },

  // 出廷日当（交通費込み）
  {
    id: "attendance_web",
    category: "COURT_ATTENDANCE",
    name: "ウェブ期日",
    amount: 0,
    displayFee: "0円",
  },
  {
    id: "attendance_tokyo",
    category: "COURT_ATTENDANCE",
    name: "東京地裁本庁",
    amount: 10000,
    displayFee: "1万円",
  },
  {
    id: "attendance_yokohama",
    category: "COURT_ATTENDANCE",
    name: "横浜地裁・さいたま地裁・立川支部",
    amount: 20000,
    displayFee: "2万円",
  },
  {
    id: "attendance_nagoya",
    category: "COURT_ATTENDANCE",
    name: "名古屋地裁",
    amount: 62000,
    displayFee: "6万2,000円",
  },
  {
    id: "attendance_osaka",
    category: "COURT_ATTENDANCE",
    name: "大阪地裁・神戸地裁本庁",
    amount: 89000,
    displayFee: "8万9,000円",
  },

  // 法律相談
  {
    id: "consultation_email_first",
    category: "CONSULTATION",
    name: "法律相談（メール初回）",
    amount: 55000,
    displayFee: "5万5,000円",
  },
];

// ─── カテゴリ定義 ───
const CATEGORY_META: Record<
  FeeCategory,
  { title: string; description?: string }
> = {
  DELETION: {
    title: "削除請求",
    description: "誹謗中傷投稿の削除を求める手続き",
  },
  DISCLOSURE_FULL: {
    title: "発信者情報開示請求（最後まで）",
    description: "投稿者の特定に必要な全手続きを一括で対応",
  },
  IDENTIFICATION_TO_LAWSUIT: {
    title: "投稿者特定から慰謝料請求訴訟まで",
    description: "発信者の特定から損害賠償請求までワンストップで対応",
  },
  POSTER_SIDE: {
    title: "投稿者側の対応",
    description: "開示請求を受けた側の対応",
  },
  INDIVIDUAL_DISCLOSURE: {
    title: "個別手続（発信者情報開示請求）",
    description: "従来型の手続きを個別にご依頼いただく場合",
  },
  DISCLOSURE_ORDER: {
    title: "発信者情報開示命令事件（非訟手続）",
    description: "2022年改正法による新制度を利用する場合",
  },
  DAMAGES_LAWSUIT: {
    title: "慰謝料請求訴訟",
    description: "特定された発信者に対する損害賠償請求",
  },
  OTHER: { title: "その他" },
  COURT_ATTENDANCE: { title: "出廷日当（交通費込み）" },
  CONSULTATION: { title: "法律相談" },
};

// ─── セクション別データ（料金表ページ用） ───
const CATEGORY_ORDER: FeeCategory[] = [
  "DELETION",
  "DISCLOSURE_FULL",
  "IDENTIFICATION_TO_LAWSUIT",
  "POSTER_SIDE",
  "INDIVIDUAL_DISCLOSURE",
  "DISCLOSURE_ORDER",
  "DAMAGES_LAWSUIT",
  "OTHER",
  "COURT_ATTENDANCE",
  "CONSULTATION",
];

export const FEE_SECTIONS: FeeSection[] = CATEGORY_ORDER.map((cat) => ({
  category: cat,
  title: CATEGORY_META[cat].title,
  description: CATEGORY_META[cat].description,
  items: FEE_ITEMS.filter((item) => item.category === cat),
}));

// ─── カテゴリ選択肢（管理画面用） ───
export const FEE_CATEGORY_OPTIONS = CATEGORY_ORDER.map((cat) => ({
  value: cat,
  label: CATEGORY_META[cat].title,
}));

// ─── ヘルパー関数 ───
export function getFeeItem(id: string): FeeItem | undefined {
  return FEE_ITEMS.find((item) => item.id === id);
}

export function getFeesByCategory(category: FeeCategory): FeeItem[] {
  return FEE_ITEMS.filter((item) => item.category === category);
}

export function formatYen(amount: number): string {
  if (amount === 0) return "0円";
  if (amount >= 10000 && amount % 10000 === 0) {
    return `${amount / 10000}万円`;
  }
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const rest = amount % 10000;
    return `${man}万${rest.toLocaleString()}円`;
  }
  return `${amount.toLocaleString()}円`;
}

/**
 * 複数の料金IDから合計金額を計算
 */
export function calculateTotal(feeIds: string[]): number {
  return feeIds.reduce((sum, id) => {
    const item = getFeeItem(id);
    return sum + (item?.amount ?? 0);
  }, 0);
}
