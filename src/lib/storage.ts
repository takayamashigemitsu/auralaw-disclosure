/**
 * Supabase Storage ラッパー
 *
 * 設計原則:
 *  - service_role は SERVER SIDE のみ。クライアント直アクセス禁止。
 *  - 書類はすべて private bucket。外部に渡すURLは必ず signed URL（期限付き）。
 *  - `CaseDocument.fileUrl` には **bucket内のpath** を保存する（URLではなく）。
 *    - 新規アップロード: `cases/{caseId}/{timestamp}_{filename}`
 *    - 旧データ（base64 data: URL や publicUrl）はそのまま残し、ダウンロード側で互換処理。
 *  - 取得は必ず API 経由: `/api/case-documents/[id]/download` → signed URL にリダイレクト。
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

const BUCKET_NAME = "case-files";

/** signed URL の既定有効期限（秒） */
export const DEFAULT_SIGNED_URL_TTL_SEC = 15 * 60; // 15分

/**
 * ファイルをアップロードする。
 *  - Supabase 設定済み: bucket内の path を返す（URLではない）
 *  - 未設定: base64 data: URL を返す（下位互換フォールバック）
 */
export async function uploadFile(
  data: Buffer | string,
  fileName: string,
  mimeType: string,
  folder: string = "uploads"
): Promise<{ url: string; isBase64: boolean }> {
  if (!supabase) {
    const base64 = typeof data === "string" ? data : data.toString("base64");
    return {
      url: `data:${mimeType};base64,${base64}`,
      isBase64: true,
    };
  }

  const buffer = typeof data === "string" ? Buffer.from(data, "base64") : data;
  // 安全なファイル名に変換（ASCII以外の文字を除去、スラッシュを排除）
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // path を保存する。URLはダウンロード時に signed で発行。
  return {
    url: path,
    isBase64: false,
  };
}

/**
 * bucket内の path に対して signed URL を発行する。
 * 期限切れ後はURLは無効になる。
 */
export async function getSignedUrl(
  path: string,
  expiresInSec: number = DEFAULT_SIGNED_URL_TTL_SEC
): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase Storage が設定されていません");
  }
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresInSec);
  if (error || !data) {
    throw new Error(`signed URL発行に失敗しました: ${error?.message || "unknown"}`);
  }
  return data.signedUrl;
}

/**
 * `CaseDocument.fileUrl` の値を解決する。
 *  - `data:` → base64 data URL（そのまま返す、互換用）
 *  - `http://` or `https://` → 旧 publicUrl（そのまま返す、互換用）
 *  - それ以外 → bucket内 path とみなして signed URL を発行
 */
export async function resolveFileUrl(fileUrlOrPath: string): Promise<string> {
  if (fileUrlOrPath.startsWith("data:")) return fileUrlOrPath;
  if (fileUrlOrPath.startsWith("http://") || fileUrlOrPath.startsWith("https://")) {
    return fileUrlOrPath;
  }
  return getSignedUrl(fileUrlOrPath);
}

/**
 * Supabase Storage からファイルを削除
 */
export async function deleteFile(fileUrlOrPath: string): Promise<void> {
  if (!supabase) return;
  if (fileUrlOrPath.startsWith("data:")) return;

  let path: string | null = null;
  if (fileUrlOrPath.startsWith("http")) {
    // 旧 publicUrl 形式: /storage/v1/object/public/{bucket}/{path}
    const parts = fileUrlOrPath.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
    if (parts.length >= 2) path = parts[1];
  } else {
    path = fileUrlOrPath;
  }

  if (!path) return;
  await supabase.storage.from(BUCKET_NAME).remove([path]);
}

export function isStorageConfigured(): boolean {
  return supabase !== null;
}
