/**
 * 定数定義（一元管理）
 *
 * ステータス・SNSラベル等をここで一括管理。
 * 各ページ・コンポーネントはこのファイルからインポートする。
 */

// ─── 案件ステータス ───
export const CASE_STATUS = {
  ACCEPTED: { label: "受任", color: "bg-blue-100 text-blue-800" },
  PROVIDER_REQUEST: { label: "プロバイダ開示請求", color: "bg-cyan-100 text-cyan-800" },
  INJUNCTION_FILED: { label: "仮処分申立", color: "bg-yellow-100 text-yellow-800" },
  DISCLOSURE_REQUESTED: { label: "開示請求中", color: "bg-orange-100 text-orange-800" },
  DISCLOSURE_RECEIVED: { label: "開示完了", color: "bg-green-100 text-green-800" },
  LAWSUIT_FILED: { label: "訴訟提起", color: "bg-purple-100 text-purple-800" },
  SETTLED: { label: "和解", color: "bg-gray-100 text-gray-800" },
  CLOSED: { label: "終了", color: "bg-gray-100 text-gray-600" },
} as const;

export type CaseStatusKey = keyof typeof CASE_STATUS;

export const CASE_STATUS_LIST = Object.entries(CASE_STATUS).map(
  ([value, config]) => ({
    value,
    label: config.label,
    color: config.color,
  })
);

// ─── 相談ステータス ───
export const CONSULTATION_STATUS = {
  NEW: { label: "新規", variant: "destructive" as const },
  IN_PROGRESS: { label: "対応中", variant: "default" as const },
  RESPONDED: { label: "返信済", variant: "secondary" as const },
  CONVERTED: { label: "案件化済", variant: "outline" as const },
  CLOSED: { label: "終了", variant: "secondary" as const },
} as const;

export type ConsultationStatusKey = keyof typeof CONSULTATION_STATUS;

// ─── SNS / 対象サイト ───
export const SNS_LABELS: Record<string, string> = {
  X: "X（旧Twitter）",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  FIVECH: "5ちゃんねる",
  BAKUSAI: "爆サイ",
  GOOGLE_REVIEW: "Googleクチコミ",
  BLOG: "ブログ",
  OTHER: "その他",
};

export const SNS_OPTIONS = Object.entries(SNS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// ─── 書類タイプ ───
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CREATED: "作成",
  COURT: "裁判所",
  OPPONENT: "相手方",
  UPLOADED: "アップロード",
};

// ─── 書類カテゴリ ───
export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  DELEGATION: "委任状",
  DISCLOSURE_REQUEST: "開示請求書",
  COMPLAINT: "訴状",
  NOTICE: "通知書",
  OTHER: "その他",
};

// ─── 費用ステータス ───
export const BILLING_STATUS = {
  ESTIMATED: { label: "見積", color: "bg-gray-100 text-gray-700" },
  CONFIRMED: { label: "確定", color: "bg-blue-100 text-blue-700" },
  INVOICED: { label: "請求済", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "入金済", color: "bg-green-100 text-green-700" },
} as const;

export type BillingStatusKey = keyof typeof BILLING_STATUS;

export const BILLING_STATUS_LIST = Object.entries(BILLING_STATUS).map(
  ([value, config]) => ({
    value,
    label: config.label,
    color: config.color,
  })
);

export function getBillingStatusLabel(status: string): string {
  return (BILLING_STATUS as Record<string, { label: string }>)[status]?.label || status;
}

export function getBillingStatusColor(status: string): string {
  return (BILLING_STATUS as Record<string, { color: string }>)[status]?.color || "bg-gray-100 text-gray-700";
}

/**
 * 英語enum値を日本語ラベルに変換するヘルパー
 */
export function getCaseStatusLabel(status: string): string {
  return (CASE_STATUS as Record<string, { label: string }>)[status]?.label || status;
}

export function getCaseStatusColor(status: string): string {
  return (CASE_STATUS as Record<string, { color: string }>)[status]?.color || "bg-gray-100 text-gray-800";
}

export function getSnsLabel(snsType: string): string {
  return SNS_LABELS[snsType] || snsType;
}

export function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] || "アップロード";
}
