/**
 * 案件ステータス遷移制御
 *
 * 法律手続きには決まった順序がある。
 * 逆戻りや飛び越しを防止する。
 */

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  ACCEPTED: ["PROVIDER_REQUEST", "INJUNCTION_FILED"],
  PROVIDER_REQUEST: ["INJUNCTION_FILED", "DISCLOSURE_REQUESTED"],
  INJUNCTION_FILED: ["DISCLOSURE_REQUESTED"],
  DISCLOSURE_REQUESTED: ["DISCLOSURE_RECEIVED"],
  DISCLOSURE_RECEIVED: ["LAWSUIT_FILED", "SETTLED"],
  LAWSUIT_FILED: ["SETTLED"],
  SETTLED: ["CLOSED"],
  CLOSED: [], // terminal state
};

export type StatusTransitionResult =
  | { valid: true }
  | { valid: false; reason: string };

export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): StatusTransitionResult {
  if (currentStatus === newStatus) {
    return { valid: false, reason: "同じステータスへの変更はできません" };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) {
    return { valid: false, reason: `不明なステータスです: ${currentStatus}` };
  }

  if (allowed.length === 0) {
    return { valid: false, reason: "終了済みの案件のステータスは変更できません" };
  }

  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      reason: `${currentStatus} から ${newStatus} への遷移は許可されていません。許可: ${allowed.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * 指定ステータスから遷移可能なステータス一覧を返す
 * UI側でドロップダウンの選択肢を制限するために使用
 */
export function getAllowedNextStatuses(currentStatus: string): string[] {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}
