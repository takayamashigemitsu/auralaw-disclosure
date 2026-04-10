/**
 * POST /api/admin/release-gate/run
 *
 * A6 リリースゲート: 全サンプルに対して organizeConsultation を
 * 実行し、AISampleRun + AIOrganizeResult を作成する。
 *
 * 注意:
 *  - ADMIN 限定（STAFF でも不可）
 *  - cost guard が効いているため日次上限に達すると途中で失敗する
 *  - 失敗サンプルは errorMessage に残し、成功分は保存する
 *
 * 本物 AI バイパス:
 *  - 環境変数 `AI_RELEASE_GATE_USE_REAL=true` が設定されている場合、
 *    このエンドポイントだけ `AI_PROVIDER_FORCE_STUB=true` を無視して
 *    本物の Anthropic を呼ぶ (forceReal=true を organize に渡す)
 *  - 他のエンドポイント (/api/consultations 等) は影響を受けない
 *  - ANTHROPIC_API_KEY 未設定の場合は getProvider() が例外を投げる
 *  - 使用時は AppLog に audit エントリを残す
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizeConsultation, ORGANIZE_PROMPT_VERSION } from "@/lib/ai/organize";
import { RELEASE_SAMPLES } from "@/lib/ai/release-samples";
import { AICostLimitError } from "@/lib/ai/cost-guard";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "ADMIN権限が必要です" }, { status: 403 });
  }

  const userId = session.user.id;
  const forceReal = process.env.AI_RELEASE_GATE_USE_REAL === "true";
  const results: Array<{
    sampleKey: string;
    runId: string;
    ok: boolean;
    error?: string;
  }> = [];

  let costLimitHit = false;

  // forceReal モードに入る前に audit ログを必ず残す (後から追跡可能に)
  if (forceReal) {
    await prisma.appLog.create({
      data: {
        level: "warn",
        category: "ai_safety",
        message: "release_gate: forceReal mode activated (bypassing AI_PROVIDER_FORCE_STUB)",
        context: JSON.stringify({
          promptVersion: ORGANIZE_PROMPT_VERSION,
          sampleCount: RELEASE_SAMPLES.length,
          triggeredBy: userId,
        }),
        userId,
      },
    });
  }

  for (const sample of RELEASE_SAMPLES) {
    if (costLimitHit) {
      // 途中でコスト上限に達したら残りはスキップしつつ "skipped" として記録
      const skipped = await prisma.aISampleRun.create({
        data: {
          sampleKey: sample.key,
          sampleLabel: sample.label,
          promptVersion: ORGANIZE_PROMPT_VERSION,
          errorMessage: "skipped: AI cost limit reached in earlier sample",
          runBy: userId,
        },
      });
      results.push({
        sampleKey: sample.key,
        runId: skipped.id,
        ok: false,
        error: "cost limit reached",
      });
      continue;
    }

    try {
      const content = `SNS: ${sample.snsType}\n相談内容:\n${sample.content}`;
      const result = await organizeConsultation({ content, userId, forceReal });

      // AIOrganizeResult + AISampleRun をトランザクションで保存
      const saved = await prisma.$transaction(async (tx) => {
        const created = await tx.aIOrganizeResult.create({
          data: {
            consultationId: null,
            caseId: null,
            createdBy: userId,
            promptVersion: result.promptVersion,
            summary: result.summary,
            facts: JSON.stringify(result.facts),
            parties: JSON.stringify(result.parties),
            timeline: JSON.stringify(result.timeline),
            suggestedQuestions: JSON.stringify(result.suggestedQuestions),
            riskFlags: JSON.stringify(result.riskFlags),
            missingInfo: JSON.stringify(result.missingInfo),
            rawResponse: result.rawResponse,
            // idempotencyKey は null のまま（サンプルは毎回実行したい）
          },
        });

        if (result.hadForbiddenWords) {
          await tx.appLog.create({
            data: {
              level: "warn",
              category: "ai_safety",
              message: "release_gate_sample: forbidden words stripped",
              context: JSON.stringify({
                sampleKey: sample.key,
                organizeResultId: created.id,
                promptVersion: result.promptVersion,
              }),
              userId,
            },
          });
        }

        const run = await tx.aISampleRun.create({
          data: {
            sampleKey: sample.key,
            sampleLabel: sample.label,
            promptVersion: result.promptVersion,
            organizeResultId: created.id,
            runBy: userId,
          },
        });
        return run;
      });

      results.push({ sampleKey: sample.key, runId: saved.id, ok: true });
    } catch (err) {
      if (err instanceof AICostLimitError) {
        costLimitHit = true;
        const failed = await prisma.aISampleRun.create({
          data: {
            sampleKey: sample.key,
            sampleLabel: sample.label,
            promptVersion: ORGANIZE_PROMPT_VERSION,
            errorMessage: `cost limit: ${err.message}`,
            runBy: userId,
          },
        });
        results.push({
          sampleKey: sample.key,
          runId: failed.id,
          ok: false,
          error: "cost limit",
        });
        continue;
      }
      console.error("[release-gate/run] sample failed", sample.key, err);
      const failed = await prisma.aISampleRun.create({
        data: {
          sampleKey: sample.key,
          sampleLabel: sample.label,
          promptVersion: ORGANIZE_PROMPT_VERSION,
          errorMessage:
            err instanceof Error ? err.message.slice(0, 500) : "unknown error",
          runBy: userId,
        },
      });
      results.push({
        sampleKey: sample.key,
        runId: failed.id,
        ok: false,
        error: "sample failed",
      });
    }
  }

  return NextResponse.json({
    promptVersion: ORGANIZE_PROMPT_VERSION,
    results,
    costLimitHit,
    forceReal,
  });
}
