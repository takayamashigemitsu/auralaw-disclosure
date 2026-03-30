"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { FileUpload } from "@/components/file-upload";
import { SNS_OPTIONS } from "@/lib/constants";
import {
  MessageSquare,
  Loader2,
  Camera,
  Clock,
  Shield,
  CheckCircle,
} from "lucide-react";

type UploadedFile = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: string;
  preview?: string;
};

// --- Validation helpers ---

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Japanese phone: 0X0-XXXX-XXXX, 0X-XXXX-XXXX, 0120-XXX-XXX, etc.
const PHONE_REGEX = /^0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{2,4}$/;

const CONTENT_MAX = 2000;

function validateName(value: string): string | null {
  if (!value.trim()) return "お名前を入力してください";
  if (value.trim().length > 50)
    return "お名前は50文字以内で入力してください";
  return null;
}

function validateEmail(value: string): string | null {
  if (!value.trim()) return "メールアドレスを入力してください";
  if (!EMAIL_REGEX.test(value))
    return "正しいメールアドレスの形式で入力してください";
  return null;
}

function validatePhone(value: string): string | null {
  if (!value.trim()) return null; // optional
  if (!PHONE_REGEX.test(value.trim()))
    return "電話番号の形式が正しくありません（例: 090-1234-5678）";
  return null;
}

function validateSnsType(value: string): string | null {
  if (!value) return "SNS・サイトを選択してください";
  return null;
}

function validateContent(value: string): string | null {
  if (!value.trim()) return "被害の状況を入力してください";
  if (value.trim().length < 10)
    return "被害の状況は10文字以上で入力してください";
  if (value.length > CONTENT_MAX)
    return `${CONTENT_MAX}文字以内で入力してください`;
  return null;
}

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Controlled form values for real-time validation
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [snsType, setSnsType] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Mark a field as touched (on blur)
  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Run validation for the blurred field
      let error: string | null = null;
      switch (field) {
        case "name":
          error = validateName(name);
          break;
        case "email":
          error = validateEmail(email);
          break;
        case "phone":
          error = validatePhone(phone);
          break;
        case "snsType":
          error = validateSnsType(snsType);
          break;
        case "content":
          error = validateContent(content);
          break;
      }
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[field] = error;
        } else {
          delete next[field];
        }
        return next;
      });
    },
    [name, email, phone, snsType, content]
  );

  // Whether the submit button should be enabled
  const isFormValid = useMemo(() => {
    return (
      name.trim().length >= 1 &&
      name.trim().length <= 50 &&
      EMAIL_REGEX.test(email) &&
      !!snsType &&
      content.trim().length >= 10 &&
      content.length <= CONTENT_MAX
    );
  }, [name, email, snsType, content]);

  // Validate all fields and return true if valid
  function validateAll(): boolean {
    const newErrors: Record<string, string> = {};
    const nameErr = validateName(name);
    if (nameErr) newErrors.name = nameErr;
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    const phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const snsErr = validateSnsType(snsType);
    if (snsErr) newErrors.snsType = snsErr;
    const contentErr = validateContent(content);
    if (contentErr) newErrors.content = contentErr;

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      snsType: true,
      content: true,
    });
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateAll()) return;

    setLoading(true);
    setErrors({});

    // Include honeypot fields from the form
    const formEl = e.currentTarget;
    const websiteVal = (formEl.elements.namedItem("website") as HTMLInputElement)?.value || "";
    const companyVal = (formEl.elements.namedItem("company") as HTMLInputElement)?.value || "";

    const data = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      snsType,
      content: content.trim(),
      files: files.map(({ fileName, fileSize, mimeType, data }) => ({
        fileName,
        fileSize,
        mimeType,
        data,
      })),
      website: websiteVal,
      company: companyVal,
    };

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        const fieldErrors: Record<string, string> = {};

        if (result.errors && Array.isArray(result.errors)) {
          // ZodError format: errors is an array of { path, message }
          for (const err of result.errors) {
            const field = err.path?.[0];
            if (field && typeof field === "string") {
              // Keep only the first error per field
              if (!fieldErrors[field]) {
                fieldErrors[field] = err.message;
              }
            }
          }
        }

        // Fallback: if API returned a top-level message but no field errors
        if (
          Object.keys(fieldErrors).length === 0 &&
          result.message
        ) {
          fieldErrors.form = result.message;
        } else if (
          Object.keys(fieldErrors).length === 0 &&
          result.error
        ) {
          fieldErrors.form =
            typeof result.error === "string"
              ? result.error
              : "送信に失敗しました。入力内容をご確認ください。";
        }

        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      router.push("/contact/complete");
    } catch {
      setErrors({
        form: "送信に失敗しました。しばらくしてから再度お試しください。",
      });
      setLoading(false);
    }
  }

  // Helper to compute border class for invalid fields
  function fieldBorderClass(field: string): string {
    return touched[field] && errors[field] ? "border-red-500" : "";
  }

  return (
    <>
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-xl px-4">
          {/* Header */}
          <div className="text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-blue-700" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
              無料相談フォーム
            </h1>
            <p className="mt-2 text-gray-600">
              スクリーンショットを送るだけでOK。
              <br />
              弁護士が被害状況を確認し、最適な対応をご提案します。
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              3分で完了
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-green-600" />
              秘密厳守
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
              相談無料
            </span>
          </div>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot fields - hidden from real users, bots will fill them */}
                <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Screenshot upload - FIRST for conversion */}
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50/30 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-blue-700" />
                    <h2 className="font-semibold text-gray-900">
                      まずはスクリーンショットを送るだけ
                    </h2>
                  </div>
                  <p className="mb-3 text-xs text-gray-500">
                    誹謗中傷の投稿画面をスクリーンショットで撮影し、アップロードしてください。
                    URLのわかる状態で撮影いただくとスムーズです。
                  </p>
                  <FileUpload files={files} onChange={setFiles} />
                </div>

                <Separator />

                {/* Contact info */}
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        お名前 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="山田 太郎"
                        maxLength={50}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleBlur("name")}
                        className={fieldBorderClass("name")}
                      />
                      {touched.name && errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">電話番号</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="090-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        className={fieldBorderClass("phone")}
                      />
                      {touched.phone && errors.phone ? (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      ) : (
                        phone.trim() &&
                        !errors.phone && (
                          <p className="text-sm text-gray-400">
                            例: 090-1234-5678 / 03-1234-5678
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      メールアドレス <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={fieldBorderClass("email")}
                    />
                    {touched.email && errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      被害を受けたSNS・サイト{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={snsType}
                      onValueChange={(v) => {
                        if (v) {
                          setSnsType(v);
                          // Clear error immediately on selection
                          setTouched((prev) => ({ ...prev, snsType: true }));
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.snsType;
                            return next;
                          });
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`w-full ${fieldBorderClass("snsType")}`}
                        onBlur={() => handleBlur("snsType")}
                      >
                        <SelectValue placeholder="SNSを選択">
                          {snsType
                            ? SNS_OPTIONS.find((o) => o.value === snsType)
                                ?.label
                            : "SNSを選択"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {SNS_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.snsType && errors.snsType && (
                      <p className="text-sm text-red-500">{errors.snsType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">
                      被害の状況 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="いつ頃から、どのような投稿をされているかなど、わかる範囲でお書きください。スクリーンショットを添付いただければ、詳しく書かなくても大丈夫です。"
                      rows={5}
                      maxLength={CONTENT_MAX}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onBlur={() => handleBlur("content")}
                      className={fieldBorderClass("content")}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-h-[1.25rem]">
                        {touched.content && errors.content && (
                          <p className="text-sm text-red-500">
                            {errors.content}
                          </p>
                        )}
                      </div>
                      <p
                        className={`shrink-0 text-sm ${
                          content.length > CONTENT_MAX
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {content.length} / {CONTENT_MAX}文字
                      </p>
                    </div>
                  </div>
                </div>

                {errors.form && (
                  <p className="text-sm text-red-500">{errors.form}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || !isFormValid}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      送信中...
                    </>
                  ) : files.length > 0 ? (
                    `スクリーンショット${files.length}件と一緒に送信する`
                  ) : (
                    "相談内容を送信する"
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  ご入力いただいた情報は、ご相談への対応以外の目的で使用いたしません。
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
