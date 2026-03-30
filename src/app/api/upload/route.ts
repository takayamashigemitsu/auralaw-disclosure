import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const caseId = formData.get("caseId") as string | null;

    if (files.length === 0) {
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "アップロードは5件までです" },
        { status: 400 }
      );
    }

    const processed = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `${file.name}: 対応していないファイル形式です（JPG, PNG, WebP, PDF のみ）`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name}: ファイルサイズは2MBまでです` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const folder = caseId ? `cases/${caseId}` : "uploads";
      const { url, isBase64 } = await uploadFile(buffer, file.name, file.type, folder);

      if (isBase64) {
        // Fallback: return base64 data for backward compatibility
        processed.push({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          data: buffer.toString("base64"),
        });
      } else {
        // Supabase Storage: return URL
        processed.push({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          url,
          data: undefined,
        });
      }
    }

    return NextResponse.json({ success: true, files: processed });
  } catch {
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
