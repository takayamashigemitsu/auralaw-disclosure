"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Banknote, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  BILLING_STATUS,
  getBillingStatusLabel,
  getBillingStatusColor,
} from "@/lib/constants";
import {
  FEE_CATEGORY_OPTIONS,
  getFeesByCategory,
  getFeeItem,
  formatYen,
  type FeeCategory,
} from "@/lib/fees";

type BillingItem = {
  id: string;
  feeId: string;
  label: string;
  amount: number;
  status: string;
  note: string | null;
  isVisibleToClient: boolean;
};

export function CaseBillingSection({
  caseId,
  billings,
}: {
  caseId: string;
  billings: BillingItem[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "" as FeeCategory | "",
    feeId: "",
    isCustom: false,
    customLabel: "",
    customAmount: "",
    note: "",
    isVisibleToClient: false,
  });

  const totalAmount = billings.reduce((sum, b) => sum + b.amount, 0);

  const categoryFees =
    form.category ? getFeesByCategory(form.category as FeeCategory) : [];
  const selectedFee = form.feeId ? getFeeItem(form.feeId) : undefined;

  function resetForm() {
    setForm({
      category: "",
      feeId: "",
      isCustom: false,
      customLabel: "",
      customAmount: "",
      note: "",
      isVisibleToClient: false,
    });
  }

  async function handleAdd() {
    const label = form.isCustom ? form.customLabel : selectedFee?.name;
    const amount = form.isCustom
      ? parseInt(form.customAmount, 10)
      : selectedFee?.amount;

    if (!label) {
      toast.error("費用項目を選択またはカスタム項目名を入力してください");
      return;
    }
    if (amount === undefined || isNaN(amount)) {
      toast.error("金額を入力してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeId: form.isCustom ? null : form.feeId,
          label,
          amount,
          note: form.note || null,
          isVisibleToClient: form.isVisibleToClient,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("費用を追加しました");
      resetForm();
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("追加に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(billingId: string) {
    if (!confirm("この費用項目を削除しますか？")) return;
    try {
      const res = await fetch(`/api/cases/${caseId}/billing/${billingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("削除しました");
      router.refresh();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  async function handleStatusChange(billingId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/cases/${caseId}/billing/${billingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("ステータスを更新しました");
      router.refresh();
    } catch {
      toast.error("更新に失敗しました");
    }
  }

  async function handleVisibilityToggle(
    billingId: string,
    currentValue: boolean
  ) {
    try {
      const res = await fetch(`/api/cases/${caseId}/billing/${billingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisibleToClient: !currentValue }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        !currentValue
          ? "クライアントに表示します"
          : "クライアントから非表示にしました"
      );
      router.refresh();
    } catch {
      toast.error("更新に失敗しました");
    }
  }

  // ステータス別合計
  const totalsByStatus = Object.keys(BILLING_STATUS).reduce(
    (acc, key) => {
      acc[key] = billings
        .filter((b) => b.status === key)
        .reduce((sum, b) => sum + b.amount, 0);
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">
            <Banknote className="mr-2 inline h-4 w-4" />
            費用管理（{billings.length}件）
          </CardTitle>
          <p className="text-lg font-bold text-gray-900">
            合計: {formatYen(totalAmount)}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1 h-3 w-3" />
          追加
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 既存の費用項目 */}
        {billings.map((b) => {
          const statusColor = getBillingStatusColor(b.status);
          const statusLabel = getBillingStatusLabel(b.status);
          return (
            <div key={b.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {b.label}
                  </span>
                  <Badge variant="outline" className="shrink-0">
                    {formatYen(b.amount)}
                  </Badge>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Select
                    value={b.status}
                    onValueChange={(v) => v && handleStatusChange(b.id, v)}
                  >
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue>{statusLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BILLING_STATUS).map(([val, cfg]) => (
                        <SelectItem key={val} value={val}>
                          {cfg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    title={
                      b.isVisibleToClient
                        ? "クライアントに表示中"
                        : "クライアントに非表示"
                    }
                    onClick={() =>
                      handleVisibilityToggle(b.id, b.isVisibleToClient)
                    }
                  >
                    {b.isVisibleToClient ? (
                      <Eye className="h-3 w-3 text-blue-500" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(b.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {b.note && (
                <p className="text-xs text-gray-400">備考: {b.note}</p>
              )}
            </div>
          );
        })}

        {billings.length === 0 && !showForm && (
          <p className="text-sm text-gray-500 text-center py-3">
            費用項目が登録されていません。
          </p>
        )}

        {/* 追加フォーム */}
        {showForm && (
          <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 space-y-3">
            {/* カスタム項目チェックボックス */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCustom"
                checked={form.isCustom}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isCustom: e.target.checked,
                    feeId: "",
                    category: "",
                  })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="isCustom" className="text-xs">
                カスタム項目
              </Label>
            </div>

            {form.isCustom ? (
              <>
                {/* カスタム項目: 手動入力 */}
                <div className="space-y-1">
                  <Label className="text-xs">項目名 *</Label>
                  <Input
                    placeholder="費用項目名を入力"
                    value={form.customLabel}
                    onChange={(e) =>
                      setForm({ ...form, customLabel: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">金額（円） *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.customAmount}
                    onChange={(e) =>
                      setForm({ ...form, customAmount: e.target.value })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                {/* マスター選択 */}
                <div className="space-y-1">
                  <Label className="text-xs">カテゴリ *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      v &&
                      setForm({
                        ...form,
                        category: v as FeeCategory,
                        feeId: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {form.category
                          ? FEE_CATEGORY_OPTIONS.find(
                              (o) => o.value === form.category
                            )?.label
                          : "カテゴリを選択"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_CATEGORY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">費用項目 *</Label>
                  <Select
                    value={form.feeId}
                    onValueChange={(v) => v && setForm({ ...form, feeId: v })}
                    disabled={!form.category}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {form.feeId
                          ? selectedFee?.name
                          : form.category
                            ? "項目を選択"
                            : "先にカテゴリを選択"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categoryFees.map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedFee && (
                  <p className="text-sm font-medium text-gray-700">
                    金額: {formatYen(selectedFee.amount)}
                  </p>
                )}
              </>
            )}

            <div className="space-y-1">
              <Label className="text-xs">備考</Label>
              <Textarea
                placeholder="備考があれば入力..."
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVisibleToClient"
                checked={form.isVisibleToClient}
                onChange={(e) =>
                  setForm({ ...form, isVisibleToClient: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="isVisibleToClient" className="text-xs">
                クライアントに公開
              </Label>
              <span className="text-xs text-gray-400">
                チェックするとクライアントポータルに表示されます
              </span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading}>
                {loading && (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                )}
                追加
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}

        {/* ステータス別合計フッター */}
        {billings.length > 0 && (
          <div className="rounded-lg border bg-gray-50 p-3 space-y-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              {Object.entries(BILLING_STATUS).map(([key, cfg]) => (
                <span key={key}>
                  {cfg.label}: {formatYen(totalsByStatus[key] || 0)}
                </span>
              ))}
            </div>
            <p className="text-sm font-bold text-gray-900">
              総合計: {formatYen(totalAmount)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
