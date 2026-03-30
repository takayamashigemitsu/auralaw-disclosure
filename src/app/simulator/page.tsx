"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArrowRight, Calculator, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getFeeItem, formatYen } from "@/lib/fees";
import { SNS_OPTIONS } from "@/lib/constants";

const procedureOptions = [
  {
    value: "new_procedure",
    label: "発信者情報開示命令（新制度）",
    tooltip: "2022年改正法による新しい非訟手続。1つの手続で開示まで進められます。",
  },
  {
    value: "injunction_and_lawsuit",
    label: "仮処分＋訴訟（従来制度）",
    tooltip: "従来型の2段階手続。仮処分でIP開示→訴訟で発信者情報開示を行います。",
  },
];

const postCountOptions = [
  { value: "1", label: "1件" },
  { value: "2-3", label: "2〜3件" },
  { value: "4-10", label: "4〜10件" },
  { value: "11+", label: "11件以上" },
];

type EstimateResult = {
  lawyerFeeMin: number;
  lawyerFeeMax: number;
  courtCostMin: number;
  courtCostMax: number;
  totalMin: number;
  totalMax: number;
};

function calculateEstimate(
  sns: string,
  procedure: string,
  postCount: string
): EstimateResult {
  // Base lawyer fee from fee master
  let baseLawyerFee: number;
  if (procedure === "new_procedure") {
    // 新制度: 開示命令申立（Google以外）= 22万円
    baseLawyerFee = getFeeItem("order_non_google")?.amount ?? 220000;
  } else {
    // 従来制度: IPアドレス開示仮処分 + 住所・氏名等の開示請求訴訟（投稿数無制限）
    const injunction = getFeeItem("individual_ip_injunction")?.amount ?? 220000;
    const lawsuit = getFeeItem("individual_disclosure_lawsuit_unlimited")?.amount ?? 220000;
    baseLawyerFee = injunction + lawsuit;
  }

  let courtCost = procedure === "new_procedure" ? 30000 : 50000;

  // SNS modifier
  if (sns === "GOOGLE_REVIEW" || sns === "YOUTUBE") {
    // Google系: 開示命令申立（Google）との差額分を上乗せ
    const googleFee = getFeeItem("order_google")?.amount ?? 330000;
    const nonGoogleFee = getFeeItem("order_non_google")?.amount ?? 220000;
    baseLawyerFee += googleFee - nonGoogleFee;
  } else if (sns === "FIVECH") {
    baseLawyerFee *= 0.9;
  } else if (sns === "INSTAGRAM" || sns === "TIKTOK") {
    baseLawyerFee *= 1.1;
  } else if (sns === "OTHER" || sns === "BLOG") {
    baseLawyerFee *= 1.2;
  }

  // Post count multiplier
  const countMultiplier =
    postCount === "1"
      ? 1
      : postCount === "2-3"
        ? 1.2
        : postCount === "4-10"
          ? 1.5
          : 2.0;

  baseLawyerFee *= countMultiplier;

  const lawyerFeeMin = Math.round(baseLawyerFee / 10000) * 10000;
  const lawyerFeeMax = Math.round((baseLawyerFee * 1.5) / 10000) * 10000;
  const courtCostMin = courtCost;
  const courtCostMax = courtCost * 2;

  return {
    lawyerFeeMin,
    lawyerFeeMax,
    courtCostMin,
    courtCostMax,
    totalMin: lawyerFeeMin + courtCostMin,
    totalMax: lawyerFeeMax + courtCostMax,
  };
}

export default function SimulatorPage() {
  const [sns, setSns] = useState("");
  const [procedure, setProcedure] = useState("");
  const [postCount, setPostCount] = useState("");
  const [result, setResult] = useState<EstimateResult | null>(null);

  const canCalculate = sns && procedure && postCount;

  function handleCalculate() {
    if (!canCalculate) return;
    setResult(calculateEstimate(sns, procedure, postCount));
  }

  return (
    <>
      <PublicHeader />
      <main className="flex-1 bg-gray-50 py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4">
          <div className="text-center">
            <Calculator className="mx-auto h-10 w-10 text-blue-700" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
              費用シミュレーター
            </h1>
            <p className="mt-2 text-gray-600">
              条件を選択して、発信者情報開示請求にかかる概算費用を確認できます。
            </p>
          </div>

          <Card className="mt-8">
            <CardContent className="space-y-6 pt-6">
              {/* SNS */}
              <div className="space-y-2">
                <Label>対象SNS・サイト</Label>
                <Select value={sns} onValueChange={(v) => v && setSns(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="SNSを選択">
                      {sns ? SNS_OPTIONS.find((o) => o.value === sns)?.label : "SNSを選択"}
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
              </div>

              {/* Procedure */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  手続きの種類
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        2022年の法改正により、新しい非訟手続（開示命令）が利用可能になりました。
                        従来の仮処分+訴訟より迅速・低コストで進められる場合があります。
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select value={procedure} onValueChange={(v) => v && setProcedure(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="手続きを選択">
                      {procedure ? procedureOptions.find((o) => o.value === procedure)?.label : "手続きを選択"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {procedureOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Post count */}
              <div className="space-y-2">
                <Label>対象投稿数</Label>
                <Select value={postCount} onValueChange={(v) => v && setPostCount(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="投稿数を選択">
                      {postCount ? postCountOptions.find((o) => o.value === postCount)?.label : "投稿数を選択"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {postCountOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCalculate}
                disabled={!canCalculate}
              >
                費用を計算する
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">概算費用</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">着手金</span>
                    <span className="font-semibold">
                      {formatYen(result.lawyerFeeMin)}〜
                      {formatYen(result.lawyerFeeMax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">裁判所実費</span>
                    <span className="font-semibold">
                      {formatYen(result.courtCostMin)}〜
                      {formatYen(result.courtCostMax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">成功報酬</span>
                    <span className="font-semibold text-green-700">
                      なし
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-900">合計目安</span>
                      <span className="font-bold text-blue-700">
                        {formatYen(result.totalMin)}〜
                        {formatYen(result.totalMax)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  ※上記は概算です。実際の費用は案件の難易度・内容により異なります。
                  正確な見積もりは無料相談にてお伝えします。
                </p>
                <Button asChild className="w-full">
                  <Link href="/contact">
                    この内容で無料相談する
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
