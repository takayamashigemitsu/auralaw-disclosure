/**
 * タスク自動生成エンジン
 *
 * 案件ステータス変更時に、そのステータスで必要な全タスクを自動生成する。
 * 「タスクが存在しない状態」を絶対に作らない。
 */

import { prisma } from "@/lib/prisma";
import type { CaseStatusKey } from "@/lib/constants";

// ─── タスクテンプレート定義 ───
type TaskTemplateDef = {
  key: string;
  title: string;
  description?: string;
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  dueDaysOffset: number; // ステータス変更日から何日後が期限か
  sortOrder: number;
};

const TASK_TEMPLATES: Record<string, TaskTemplateDef[]> = {
  ACCEPTED: [
    {
      key: "accepted_screenshot",
      title: "対象投稿のスクリーンショット保全",
      description: "投稿が削除される前に証拠を保全する。URL・日時・内容を記録。",
      priority: "HIGH",
      dueDaysOffset: 1,
      sortOrder: 1,
    },
    {
      key: "accepted_delegation",
      title: "委任契約書の作成",
      description: "委任状を作成し、依頼者に送付準備。",
      priority: "HIGH",
      dueDaysOffset: 1,
      sortOrder: 2,
    },
    {
      key: "accepted_send_delegation",
      title: "委任契約書の送付・署名確認",
      description: "依頼者に委任状を送付し、署名・返送を依頼する。",
      priority: "HIGH",
      dueDaysOffset: 3,
      sortOrder: 3,
    },
    {
      key: "accepted_payment",
      title: "着手金の入金確認",
      description: "着手金の入金を確認する。未入金の場合は依頼者に連絡。",
      priority: "URGENT",
      dueDaysOffset: 7,
      sortOrder: 4,
    },
    {
      key: "accepted_records",
      title: "事件記録の整理",
      description: "相談内容・添付ファイル・スクリーンショットを案件ファイルに整理。",
      priority: "NORMAL",
      dueDaysOffset: 3,
      sortOrder: 5,
    },
  ],

  PROVIDER_REQUEST: [
    {
      key: "provider_draft",
      title: "発信者情報開示請求書の作成",
      description: "プロバイダ宛の開示請求書を起案する。",
      priority: "HIGH",
      dueDaysOffset: 3,
      sortOrder: 1,
    },
    {
      key: "provider_log_check",
      title: "ログ保存の必要性確認",
      description: "ログ消去リスクを評価し、保存仮処分の要否を判断。",
      priority: "HIGH",
      dueDaysOffset: 2,
      sortOrder: 2,
    },
    {
      key: "provider_id_docs",
      title: "本人確認書類の収集",
      description: "依頼者から身分証明書のコピーを取得。",
      priority: "NORMAL",
      dueDaysOffset: 5,
      sortOrder: 3,
    },
    {
      key: "provider_send",
      title: "プロバイダへの請求書送付",
      description: "開示請求書をプロバイダ宛に送付（内容証明）。",
      priority: "HIGH",
      dueDaysOffset: 5,
      sortOrder: 4,
    },
    {
      key: "provider_monitor",
      title: "プロバイダ回答期限の監視",
      description: "回答期限（約2ヶ月）を管理。未回答の場合は法的措置を検討。",
      priority: "NORMAL",
      dueDaysOffset: 60,
      sortOrder: 5,
    },
    {
      key: "provider_followup_30",
      title: "1ヶ月経過時のフォローアップ",
      description: "送付後1ヶ月経過。プロバイダの対応状況を確認。",
      priority: "HIGH",
      dueDaysOffset: 30,
      sortOrder: 6,
    },
  ],

  INJUNCTION_FILED: [
    {
      key: "injunction_draft",
      title: "仮処分申立書の作成",
      description: "発信者情報開示仮処分の申立書を起案する。",
      priority: "HIGH",
      dueDaysOffset: 5,
      sortOrder: 1,
    },
    {
      key: "injunction_evidence",
      title: "証拠説明書・証拠の整理",
      description: "スクリーンショット等の証拠を証拠説明書にまとめる。",
      priority: "HIGH",
      dueDaysOffset: 5,
      sortOrder: 2,
    },
    {
      key: "injunction_file",
      title: "裁判所への申立て",
      description: "東京地方裁判所に仮処分申立書を提出。",
      priority: "URGENT",
      dueDaysOffset: 7,
      sortOrder: 3,
    },
    {
      key: "injunction_bond",
      title: "担保金の準備指示",
      description: "依頼者に担保金（通常10〜30万円）の準備を依頼。",
      priority: "HIGH",
      dueDaysOffset: 3,
      sortOrder: 4,
    },
    {
      key: "injunction_hearing",
      title: "審尋期日の確認・準備",
      description: "裁判所から指定された審尋期日に向けて準備。",
      priority: "NORMAL",
      dueDaysOffset: 14,
      sortOrder: 5,
    },
    {
      key: "injunction_service",
      title: "債務者への送達確認",
      description: "相手方（サイト運営者等）への送達を確認。",
      priority: "NORMAL",
      dueDaysOffset: 21,
      sortOrder: 6,
    },
  ],

  DISCLOSURE_REQUESTED: [
    {
      key: "disclosure_send",
      title: "開示請求書の送付",
      description: "接続プロバイダ宛に発信者情報開示請求書を送付。",
      priority: "HIGH",
      dueDaysOffset: 3,
      sortOrder: 1,
    },
    {
      key: "disclosure_opinion",
      title: "意見照会書への対応準備",
      description: "プロバイダから意見照会があった場合の対応方針を検討。",
      priority: "NORMAL",
      dueDaysOffset: 14,
      sortOrder: 2,
    },
    {
      key: "disclosure_followup_30",
      title: "1ヶ月経過フォローアップ",
      description: "開示請求から1ヶ月。プロバイダの対応状況を確認、必要なら催促。",
      priority: "HIGH",
      dueDaysOffset: 30,
      sortOrder: 3,
    },
    {
      key: "disclosure_deadline",
      title: "回答期限の管理（2ヶ月目安）",
      description: "回答期限到来。未回答の場合は訴訟提起を検討。",
      priority: "URGENT",
      dueDaysOffset: 60,
      sortOrder: 4,
    },
  ],

  DISCLOSURE_RECEIVED: [
    {
      key: "received_review",
      title: "開示情報の確認・整理",
      description: "開示された発信者情報（氏名・住所等）を確認し記録。",
      priority: "HIGH",
      dueDaysOffset: 3,
      sortOrder: 1,
    },
    {
      key: "received_identify",
      title: "発信者の本人特定調査",
      description: "開示情報を基に発信者を特定。住所確認等。",
      priority: "HIGH",
      dueDaysOffset: 7,
      sortOrder: 2,
    },
    {
      key: "received_report",
      title: "クライアントへの報告・方針説明",
      description: "開示結果と今後の方針（損害賠償請求等）を依頼者に報告。",
      priority: "HIGH",
      dueDaysOffset: 5,
      sortOrder: 3,
    },
    {
      key: "received_strategy",
      title: "損害賠償請求の方針決定",
      description: "訴訟 or 示談交渉の方針を決定。",
      priority: "NORMAL",
      dueDaysOffset: 7,
      sortOrder: 4,
    },
  ],

  LAWSUIT_FILED: [
    {
      key: "lawsuit_draft",
      title: "訴状の作成",
      description: "損害賠償請求訴訟の訴状を起案。",
      priority: "HIGH",
      dueDaysOffset: 7,
      sortOrder: 1,
    },
    {
      key: "lawsuit_evidence",
      title: "証拠説明書の作成",
      description: "証拠を整理し、証拠説明書を作成。",
      priority: "HIGH",
      dueDaysOffset: 7,
      sortOrder: 2,
    },
    {
      key: "lawsuit_file",
      title: "裁判所への訴状提出",
      description: "管轄裁判所に訴状を提出。印紙・切手を準備。",
      priority: "URGENT",
      dueDaysOffset: 10,
      sortOrder: 3,
    },
    {
      key: "lawsuit_hearing",
      title: "第一回口頭弁論期日の確認",
      description: "裁判所から期日指定の連絡を待ち、日程を管理。",
      priority: "NORMAL",
      dueDaysOffset: 30,
      sortOrder: 4,
    },
    {
      key: "lawsuit_defense",
      title: "答弁書の確認・反論準備",
      description: "相手方の答弁書を確認し、反論を準備。",
      priority: "NORMAL",
      dueDaysOffset: 45,
      sortOrder: 5,
    },
  ],

  SETTLED: [
    {
      key: "settled_confirm",
      title: "和解条件の確認",
      description: "和解条件の最終確認。金額・削除義務・投稿禁止条項等。",
      priority: "HIGH",
      dueDaysOffset: 3,
      sortOrder: 1,
    },
    {
      key: "settled_agreement",
      title: "和解契約書の作成",
      description: "和解契約書を起案し、両当事者の署名を取得。",
      priority: "HIGH",
      dueDaysOffset: 5,
      sortOrder: 2,
    },
    {
      key: "settled_payment",
      title: "和解金の入金確認",
      description: "相手方からの和解金入金を確認。期限管理。",
      priority: "URGENT",
      dueDaysOffset: 30,
      sortOrder: 3,
    },
    {
      key: "settled_transfer",
      title: "クライアントへの和解金送金",
      description: "和解金受領後、依頼者に送金。",
      priority: "HIGH",
      dueDaysOffset: 37,
      sortOrder: 4,
    },
    {
      key: "settled_deletion",
      title: "投稿削除の確認",
      description: "和解条件に基づく投稿削除がなされたか確認。",
      priority: "NORMAL",
      dueDaysOffset: 14,
      sortOrder: 5,
    },
  ],

  CLOSED: [
    {
      key: "closed_report",
      title: "最終報告書の作成",
      description: "案件の経過と結果をまとめた最終報告書を作成。",
      priority: "NORMAL",
      dueDaysOffset: 5,
      sortOrder: 1,
    },
    {
      key: "closed_billing",
      title: "費用精算の完了確認",
      description: "全ての費用が精算されているか確認。未精算があれば請求。",
      priority: "HIGH",
      dueDaysOffset: 7,
      sortOrder: 2,
    },
    {
      key: "closed_archive",
      title: "書類の保管・整理",
      description: "案件関連書類をアーカイブ。保管期限を設定。",
      priority: "LOW",
      dueDaysOffset: 14,
      sortOrder: 3,
    },
  ],
};

// ─── タスク生成関数 ───

/**
 * ステータス変更時にタスクを自動生成する
 */
export async function generateTasksForStatusChange(
  caseId: string,
  newStatus: string,
  changedAt: Date,
  defaultAssigneeId?: string
): Promise<number> {
  const templates = TASK_TEMPLATES[newStatus];
  if (!templates || templates.length === 0) return 0;

  // デフォルト担当者を決定（指定がなければADMIN/STAFFの最初のユーザー）
  let assigneeId = defaultAssigneeId;
  if (!assigneeId) {
    const staffUser = await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "STAFF"] } },
      orderBy: { createdAt: "asc" },
    });
    assigneeId = staffUser?.id;
  }

  const tasksData = templates.map((t) => ({
    caseId,
    templateKey: t.key,
    title: t.title,
    description: t.description || null,
    category: "AUTO" as const,
    priority: t.priority,
    status: "PENDING" as const,
    caseStatus: newStatus,
    dueDate: addDays(changedAt, t.dueDaysOffset),
    assigneeId: assigneeId || null,
    sortOrder: t.sortOrder,
  }));

  await prisma.caseTask.createMany({ data: tasksData });

  // タイムラインに自動記録
  await prisma.caseTimeline.create({
    data: {
      caseId,
      title: "タスク自動生成",
      description: `ステータス変更に伴い${templates.length}件のタスクを生成しました。`,
      date: changedAt,
      isVisibleToClient: false,
    },
  });

  return templates.length;
}

// ─── 優先度スコア計算 ───

export type ComputedPriority = {
  score: number;
  label: "URGENT" | "HIGH" | "NORMAL" | "LOW";
};

/**
 * タスクの実効優先度を計算する
 * - 期限超過は常にURGENT
 * - スコアが高いほど緊急
 */
export function calculatePriorityScore(task: {
  priority: string;
  dueDate: Date | null;
  status: string;
  createdAt: Date;
}): ComputedPriority {
  if (task.status === "DONE" || task.status === "SKIPPED") {
    return { score: 0, label: "LOW" };
  }

  const basePriority: Record<string, number> = {
    URGENT: 40,
    HIGH: 25,
    NORMAL: 10,
    LOW: 0,
  };

  let score = basePriority[task.priority] ?? 10;

  // 期限によるスコア加算
  if (task.dueDate) {
    const now = new Date();
    const diffMs = task.dueDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < -7) score += 50; // 7日以上超過
    else if (diffDays < 0) score += 40; // 超過
    else if (diffDays < 1) score += 30; // 今日
    else if (diffDays < 3) score += 20; // 3日以内
    else if (diffDays < 7) score += 10; // 1週間以内
  }

  // 放置ペナルティ（7日以上PENDINGのまま）
  const createdDaysAgo =
    (Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (task.status === "PENDING" && createdDaysAgo > 7) {
    score += 10;
  }

  // ラベル決定
  let label: ComputedPriority["label"];
  if (score >= 70) label = "URGENT";
  else if (score >= 40) label = "HIGH";
  else if (score >= 15) label = "NORMAL";
  else label = "LOW";

  return { score, label };
}

// ─── ヘルパー ───

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * ステータスに対するテンプレート一覧を取得
 */
export function getTemplatesForStatus(status: string): TaskTemplateDef[] {
  return TASK_TEMPLATES[status] || [];
}
