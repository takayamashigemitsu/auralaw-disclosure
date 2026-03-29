"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

type FieldDef = {
  key: string;
  label: string;
  type: string;
  defaultValue?: string;
};

type Template = {
  id: string;
  name: string;
  category: string;
  fields: string;
};

export function DocumentGenerator({
  caseId,
  defaultValues,
}: {
  caseId: string;
  defaultValues?: Record<string, string>;
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState("");
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/documents/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  function handleSelect(category: string | null) {
    if (!category) return;
    setSelected(category);
    const tmpl = templates.find((t) => t.category === category);
    if (tmpl) {
      const fieldDefs: FieldDef[] = JSON.parse(tmpl.fields);
      setFields(fieldDefs);
      const initial: Record<string, string> = {};
      for (const f of fieldDefs) {
        initial[f.key] = defaultValues?.[f.key] || f.defaultValue || "";
      }
      setValues(initial);
      setShowForm(true);
    }
  }

  function handleFieldChange(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateCategory: selected,
          values,
          caseId,
        }),
      });

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ||
        `document_${selected}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("書類を生成・ダウンロードしました");
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("書類の生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            <FileText className="mr-2 inline h-4 w-4" />
            書類作成
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selected} onValueChange={handleSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="テンプレートを選択">
                {selected
                  ? templates.find((t) => t.category === selected)?.name
                  : "テンプレートを選択"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.category}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {templates.find((t) => t.category === selected)?.name} を作成
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <Label className="text-xs">{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                value={values[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                rows={3}
              />
            ) : field.type === "date" ? (
              <Input
                type="date"
                value={values[field.key] || new Date().toISOString().split("T")[0]}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
            ) : (
              <Input
                value={values[field.key] || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
            )}
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleGenerate} disabled={loading} size="sm">
            {loading ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Download className="mr-1 h-3 w-3" />
            )}
            生成・ダウンロード
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(false)}
          >
            キャンセル
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
