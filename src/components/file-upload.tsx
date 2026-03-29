"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  FileImage,
  FileText,
  Shield,
  Camera,
} from "lucide-react";

type UploadedFile = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: string;
  preview?: string;
};

export function FileUpload({
  files,
  onChange,
}: {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 5;
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError("");
      const newFiles: UploadedFile[] = [...files];

      for (const file of Array.from(fileList)) {
        if (newFiles.length >= MAX_FILES) {
          setError(`アップロードは${MAX_FILES}件までです`);
          break;
        }
        if (!ALLOWED.includes(file.type)) {
          setError(`${file.name}: JPG, PNG, WebP, PDF のみ対応しています`);
          continue;
        }
        if (file.size > MAX_SIZE) {
          setError(`${file.name}: 2MB以下のファイルを選択してください`);
          continue;
        }

        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        const preview = file.type.startsWith("image/")
          ? `data:${file.type};base64,${base64}`
          : undefined;

        newFiles.push({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          data: base64,
          preview,
        });
      }

      onChange(newFiles);
    },
    [files, onChange]
  );

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          <Camera className="mr-1 inline h-4 w-4" />
          証拠スクリーンショット
        </label>
        <span className="text-xs text-gray-400">
          {files.length}/{MAX_FILES}件（各2MBまで）
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-700">
          スクリーンショットをドラッグ&ドロップ
        </p>
        <p className="mt-1 text-xs text-gray-500">
          またはクリックして選択（JPG, PNG, PDF対応）
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Trust signal */}
      <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2">
        <Shield className="h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-xs text-blue-700">
          アップロードされたファイルは、弁護士の守秘義務のもと厳重に管理されます。
        </p>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {files.map((file, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-lg border bg-white"
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.fileName}
                  className="h-24 w-full object-cover"
                />
              ) : (
                <div className="flex h-24 items-center justify-center bg-gray-100">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="p-1.5">
                <p className="truncate text-xs text-gray-600">
                  {file.fileName}
                </p>
                <p className="text-[10px] text-gray-400">
                  {formatSize(file.fileSize)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
