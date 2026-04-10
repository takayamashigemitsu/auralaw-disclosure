/**
 * PII (Personally Identifiable Information) マスキングパイプライン
 *
 * 設計原則:
 *  - AIに送信する前に、直接識別子（メール・電話・郵便番号・URL中のトークン等）を
 *    プレースホルダに置換する
 *  - 完全な匿名化は不可能であることを前提とし、ベストエフォートで「直接識別子」を消す
 *  - 画像は仮名化できないため、画像入力はこの関数を通さず、別途「弁護士目視確認後送信」
 *    のゲートを設けること
 *
 * マスキング方針:
 *  - 元のテキストの構造は保ち、識別子のみ <EMAIL_1>, <PHONE_1> のようなトークンに置換
 *  - マッピング（元→トークン）は監査ログのため呼び出し元に返す（DB保存は任意）
 *
 * 注意:
 *  - 氏名・住所は自由記述からの抽出が困難なため、このパイプラインでは検出しない
 *  - 氏名・住所は利用者が入力した name / phone フィールドから取得し、
 *    アプリ側で「構造化データ」として別途扱うこと（AI送信本文に埋め込まない）
 */

export type PIIMaskResult = {
  masked: string;
  mapping: Record<string, string>; // token -> original
  detections: {
    emails: number;
    phones: number;
    urls: number;
    postcodes: number;
  };
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// 日本の電話番号（0X0-XXXX-XXXX, 03-XXXX-XXXX など）
const PHONE_RE = /0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{2,4}/g;
// URL（クエリ文字列に個人情報が含まれることがある）
const URL_RE = /https?:\/\/[^\s<>"']+/g;
// 日本の郵便番号
const POSTCODE_RE = /〒?\d{3}[-－]\d{4}/g;

export function maskPII(input: string): PIIMaskResult {
  const mapping: Record<string, string> = {};
  const detections = { emails: 0, phones: 0, urls: 0, postcodes: 0 };

  let masked = input;

  // URL を先にマスク（URLの中にメールや電話が含まれている可能性があるため）
  masked = masked.replace(URL_RE, (m) => {
    detections.urls += 1;
    const token = `<URL_${detections.urls}>`;
    mapping[token] = m;
    return token;
  });

  masked = masked.replace(EMAIL_RE, (m) => {
    detections.emails += 1;
    const token = `<EMAIL_${detections.emails}>`;
    mapping[token] = m;
    return token;
  });

  masked = masked.replace(POSTCODE_RE, (m) => {
    detections.postcodes += 1;
    const token = `<POSTCODE_${detections.postcodes}>`;
    mapping[token] = m;
    return token;
  });

  masked = masked.replace(PHONE_RE, (m) => {
    detections.phones += 1;
    const token = `<PHONE_${detections.phones}>`;
    mapping[token] = m;
    return token;
  });

  return { masked, mapping, detections };
}

/**
 * マスク結果を元に戻す（AI出力にトークンが残っている場合の復元用）
 * 注意: AIがトークンを改変・幻覚した場合は復元できない。復元失敗はログに記録すること。
 */
export function unmaskPII(
  text: string,
  mapping: Record<string, string>
): string {
  let result = text;
  for (const [token, original] of Object.entries(mapping)) {
    result = result.split(token).join(original);
  }
  return result;
}

/**
 * このテキストをAIに送って安全か、簡易チェック。
 * 画像バイナリ・base64等が混ざっている場合は false を返す。
 */
export function isSafeToSendToAI(text: string): {
  safe: boolean;
  reason?: string;
} {
  if (text.length > 50_000) {
    return { safe: false, reason: "テキストが長すぎます（50000文字超）" };
  }
  // base64 の画像データらしきものが本文に埋め込まれていないか
  if (/data:image\/[a-z]+;base64,/.test(text)) {
    return { safe: false, reason: "base64画像データが混入しています" };
  }
  return { safe: true };
}
