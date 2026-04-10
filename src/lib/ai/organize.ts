/**
 * AI整理（organize）— 相談内容の構造化圧縮
 *
 * CAIO方針: 「AIで判断するな、AIで圧縮しろ」
 *  - 法的判断・評価・見込みの出力は禁止
 *  - 事実整理・タイムライン・不足情報・確認質問の抽出のみ
 *  - 出力は必ず弁護士レビュー前提
 *
 * 二重防御:
 *  1. プロンプトで明示的に縛る
 *  2. 出力バリデーションで禁止ワードを strip + ログ
 *  3. riskFlags は構造化（type enum + detail）— 文字列自由記述ではない
 */
import { callAI } from "@/lib/ai/index";
import { maskPII, unmaskPII } from "@/lib/ai/pii-filter";

export const ORGANIZE_PROMPT_VERSION = "organize-v1";

/** 判断語の禁止ワード（法的評価に該当） */
const FORBIDDEN_WORDS = [
  "名誉毀損",
  "名誉棄損",
  "侮辱罪",
  "違法",
  "権利侵害",
  "該当する",
  "該当します",
  "認められる",
  "認められます",
  "開示請求が妥当",
  "開示請求が適当",
  "開示請求が認められ",
  "訴訟が有効",
  "勝訴",
  "敗訴",
  "高い見込み",
  "可能性が高い",
  "可能性が低い",
];

export const RISK_FLAG_TYPES = [
  "EVIDENCE_GAP",        // 証拠不足
  "MISSING_METADATA",    // メタデータ欠如（タイムスタンプ、URL等）
  "IDENTITY_UNCLEAR",    // 投稿者特定不可
  "SOURCE_UNVERIFIED",   // 出典未確認
  "TIMELINE_INCOMPLETE", // 時系列に穴
] as const;

export type RiskFlagType = (typeof RISK_FLAG_TYPES)[number];

export type RiskFlag = {
  type: RiskFlagType;
  detail: string;
};

export type TimelineEntry = {
  when: string;
  what: string;
  gap?: boolean;
};

export type Party = {
  role: string;
  name?: string;
  handle?: string;
};

export type OrganizeResult = {
  promptVersion: string;
  summary: string;              // 3行以内
  facts: string[];              // 最大7個
  parties: Party[];
  timeline: TimelineEntry[];
  suggestedQuestions: string[]; // 最大5個
  riskFlags: RiskFlag[];
  missingInfo: string[];
  rawResponse: string;
  /** 出力バリデーションで strip された禁止ワードが含まれていたかどうか */
  hadForbiddenWords: boolean;
};

const SYSTEM_PROMPT = `あなたは弁護士の業務補助AIです。
以下の厳格な制約を守ってください:

【禁止事項】
- 法的判断・評価を一切出力しない
- 「名誉毀損」「違法」「権利侵害」「該当する」「認められる」等の評価語を使わない
- 可能性の高低に言及しない
- 開示請求の見込み・妥当性に言及しない
- 推定や推測を事実として提示しない

【あなたの役割】
- 相談内容を構造化して圧縮する（事実整理）
- 時系列を抽出し、情報の穴（gap）を指摘する
- 弁護士が初回面談で必ず確認すべき質問を抽出する
- 事実ベースの「気づき」（証拠不足、メタデータ欠如等）を riskFlags として構造化する
- 不足している情報を指摘する

すべての出力は弁護士のレビューを前提とします。`;

const USER_PROMPT_TEMPLATE = (content: string) => `以下の相談内容を、指定されたJSON形式で整理してください。

【相談内容】
${content}

【出力形式】JSONのみを出力してください。前後の説明文は不要です。
{
  "summary": "3行以内の要約。事実のみ。評価語・判断語禁止。",
  "facts": ["事実1", "事実2", ...], // 最大7個
  "parties": [
    { "role": "相談者" | "投稿者" | "第三者" | その他, "name": "(任意)", "handle": "(任意)" }
  ],
  "timeline": [
    { "when": "日時 or 不明", "what": "何があったか", "gap": true /* 時系列に穴がある場合 */ }
  ],
  "suggestedQuestions": [
    "弁護士が初回面談で必ず確認する質問のみ。Yes/Noではなく具体情報を引き出す形式。"
  ], // 最大5個
  "riskFlags": [
    {
      "type": "EVIDENCE_GAP" | "MISSING_METADATA" | "IDENTITY_UNCLEAR" | "SOURCE_UNVERIFIED" | "TIMELINE_INCOMPLETE",
      "detail": "事実ベースの短い説明。評価語禁止。"
    }
  ],
  "missingInfo": ["聞くべき不足情報"]
}`;

/**
 * 出力バリデーション: 禁止ワードを strip する。
 * 文字列フィールドを走査し、禁止ワードにヒットしたら "[削除]" に置換。
 */
function stripForbiddenWords(value: string): { cleaned: string; hit: boolean } {
  let cleaned = value;
  let hit = false;
  for (const w of FORBIDDEN_WORDS) {
    if (cleaned.includes(w)) {
      hit = true;
      cleaned = cleaned.split(w).join("[削除]");
    }
  }
  return { cleaned, hit };
}

function sanitizeStringArray(arr: unknown): { cleaned: string[]; hit: boolean } {
  if (!Array.isArray(arr)) return { cleaned: [], hit: false };
  let hit = false;
  const cleaned: string[] = [];
  for (const item of arr) {
    if (typeof item !== "string") continue;
    const r = stripForbiddenWords(item);
    if (r.hit) hit = true;
    cleaned.push(r.cleaned);
  }
  return { cleaned, hit };
}

function sanitizeRiskFlags(arr: unknown): { cleaned: RiskFlag[]; hit: boolean } {
  if (!Array.isArray(arr)) return { cleaned: [], hit: false };
  let hit = false;
  const cleaned: RiskFlag[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const type = obj.type;
    const detail = obj.detail;
    if (
      typeof type !== "string" ||
      !RISK_FLAG_TYPES.includes(type as RiskFlagType) ||
      typeof detail !== "string"
    ) {
      continue;
    }
    const r = stripForbiddenWords(detail);
    if (r.hit) hit = true;
    cleaned.push({ type: type as RiskFlagType, detail: r.cleaned });
  }
  return { cleaned, hit };
}

function sanitizeParties(arr: unknown): Party[] {
  if (!Array.isArray(arr)) return [];
  const out: Party[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    if (typeof obj.role !== "string") continue;
    out.push({
      role: obj.role,
      name: typeof obj.name === "string" ? obj.name : undefined,
      handle: typeof obj.handle === "string" ? obj.handle : undefined,
    });
  }
  return out;
}

function sanitizeTimeline(arr: unknown): { cleaned: TimelineEntry[]; hit: boolean } {
  if (!Array.isArray(arr)) return { cleaned: [], hit: false };
  let hit = false;
  const cleaned: TimelineEntry[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    if (typeof obj.when !== "string" || typeof obj.what !== "string") continue;
    const w = stripForbiddenWords(obj.what);
    if (w.hit) hit = true;
    cleaned.push({
      when: obj.when,
      what: w.cleaned,
      gap: obj.gap === true,
    });
  }
  return { cleaned, hit };
}

/**
 * 相談内容を AI で整理する。
 * PII は仮名化してから送信、戻り値で unmask する。
 */
export async function organizeConsultation(params: {
  content: string;
  userId: string;
}): Promise<OrganizeResult> {
  const { content, userId } = params;

  // PII 仮名化
  const { masked, mapping } = maskPII(content);

  const res = await callAI({
    purpose: "organize_consultation",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: USER_PROMPT_TEMPLATE(masked) }],
    maxTokens: 1500,
    userId,
  });

  if (res.isStub) {
    return stubResult(res.text);
  }

  // JSON抽出
  const text = res.text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("AI応答のJSON抽出に失敗しました");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    throw new Error("AI応答のJSONパースに失敗しました");
  }

  // Sanitize + unmask
  const summaryRaw = typeof parsed.summary === "string" ? parsed.summary : "";
  const summaryStripped = stripForbiddenWords(summaryRaw);
  const summaryLines = unmaskPII(summaryStripped.cleaned, mapping)
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0)
    .slice(0, 3);

  const factsR = sanitizeStringArray(parsed.facts);
  const facts = factsR.cleaned.slice(0, 7).map((f) => unmaskPII(f, mapping));

  const parties = sanitizeParties(parsed.parties).map((p) => ({
    role: p.role,
    name: p.name ? unmaskPII(p.name, mapping) : undefined,
    handle: p.handle ? unmaskPII(p.handle, mapping) : undefined,
  }));

  const timelineR = sanitizeTimeline(parsed.timeline);
  const timeline = timelineR.cleaned.map((t) => ({
    ...t,
    what: unmaskPII(t.what, mapping),
  }));

  const questionsR = sanitizeStringArray(parsed.suggestedQuestions);
  const suggestedQuestions = questionsR.cleaned
    .slice(0, 5)
    .map((q) => unmaskPII(q, mapping));

  const riskR = sanitizeRiskFlags(parsed.riskFlags);
  const riskFlags = riskR.cleaned.map((r) => ({
    ...r,
    detail: unmaskPII(r.detail, mapping),
  }));

  const missingR = sanitizeStringArray(parsed.missingInfo);
  const missingInfo = missingR.cleaned.map((m) => unmaskPII(m, mapping));

  const hadForbiddenWords =
    summaryStripped.hit ||
    factsR.hit ||
    timelineR.hit ||
    questionsR.hit ||
    riskR.hit ||
    missingR.hit;

  return {
    promptVersion: ORGANIZE_PROMPT_VERSION,
    summary: summaryLines.join("\n"),
    facts,
    parties,
    timeline,
    suggestedQuestions,
    riskFlags,
    missingInfo,
    rawResponse: text,
    hadForbiddenWords,
  };
}

function stubResult(rawText: string): OrganizeResult {
  return {
    promptVersion: ORGANIZE_PROMPT_VERSION,
    summary:
      "（AI Stub応答）\nANTHROPIC_API_KEY 未設定または AI_PROVIDER_FORCE_STUB=true のため\n実際のAI整理は実行されていません。",
    facts: [
      "これはプレースホルダー出力です",
      "実際のAI整理を有効化するには Vercel 環境変数を確認してください",
    ],
    parties: [],
    timeline: [],
    suggestedQuestions: [
      "（サンプル）投稿が行われた正確な日時を教えてください",
      "（サンプル）投稿のURLは保存されていますか",
    ],
    riskFlags: [
      { type: "MISSING_METADATA", detail: "Stub応答のため実データなし" },
    ],
    missingInfo: ["Stub応答のため不足情報の抽出は未実施"],
    rawResponse: rawText,
    hadForbiddenWords: false,
  };
}
