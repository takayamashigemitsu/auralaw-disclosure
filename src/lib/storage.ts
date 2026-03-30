import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Storage client with service role key (server-side only)
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const BUCKET_NAME = "case-files";

/**
 * ファイルをSupabase Storageにアップロード
 * Supabase未設定時はbase64をそのまま返す（フォールバック）
 */
export async function uploadFile(
  data: Buffer | string,
  fileName: string,
  mimeType: string,
  folder: string = "uploads"
): Promise<{ url: string; isBase64: boolean }> {
  if (!supabase) {
    // Fallback: return as data URL (base64)
    const base64 = typeof data === "string" ? data : data.toString("base64");
    return {
      url: `data:${mimeType};base64,${base64}`,
      isBase64: true,
    };
  }

  const buffer = typeof data === "string" ? Buffer.from(data, "base64") : data;
  const path = `${folder}/${Date.now()}_${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return {
    url: urlData.publicUrl,
    isBase64: false,
  };
}

/**
 * Supabase Storageからファイルを削除
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!supabase || fileUrl.startsWith("data:")) return;

  // Extract path from URL
  const urlParts = fileUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
  if (urlParts.length < 2) return;

  const path = urlParts[1];
  await supabase.storage.from(BUCKET_NAME).remove([path]);
}

/**
 * Supabase Storageが設定されているか
 */
export function isStorageConfigured(): boolean {
  return supabase !== null;
}
