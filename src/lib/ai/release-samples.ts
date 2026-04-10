/**
 * A6 リリースゲート用サンプル（5件） + 6 軸評価フレームワーク
 *
 * 設計哲学（ベテラン弁護士監査を反映）:
 *  - AIで判断するな、AIで圧縮しろ (CAIO 原則)
 *  - 禁止ワードは 1 件も許容しない (forbiddenCompliance 満点必須)
 *  - 事実は閾値 4 以上必須 (創作は致命的事故)
 *  - 実務優先順位把握 (第6軸) を独立して評価する
 *  - サンプル単位の最低点ガード (どの軸も 3 未満禁止)
 *
 * 追加・変更する場合は ORGANIZE_PROMPT_VERSION と合わせて CHANGELOG を残すこと。
 */

// ==================================================================
// 型定義
// ==================================================================

/**
 * 評価ヒント（弁護士採点ガイド）
 *
 * - topQuestions: ベテラン弁護士が面談で最初に必ず聞く質問 (3〜5 個)
 *   AI は suggestedQuestions でこれに近い内容を出せるはず。
 * - mustDetect: AI が missingInfo / riskFlags で必ず指摘すべき項目。
 *   これが拾えなければ missingInfoDetection は 3 以下。
 * - practicalSignals: 実務優先順位の観点で AI が出せるはずの
 *   緊急性・次アクション・証拠保全に関する指摘。第6軸の採点基準。
 * - forbiddenChecks: 絶対に出力に現れてはいけない表現。
 *   1 件でも混入したら forbiddenCompliance は満点を失う。
 */
export type EvaluationHints = {
  topQuestions: string[];
  mustDetect: string[];
  practicalSignals: string[];
  forbiddenChecks: string[];
};

export type ReleaseSample = {
  key: string;
  label: string;
  snsType: "X" | "Instagram" | "5ch" | "YouTube" | "Discord";
  category:
    | "evidence_full"
    | "evidence_partial"
    | "info_gap_timestamp"
    | "info_gap_identity"
    | "mixed_noise";
  content: string;
  hints: EvaluationHints;
};

// ==================================================================
// 6 サンプル
// ==================================================================

export const RELEASE_SAMPLES: ReleaseSample[] = [
  // ──────────────────────────────────────────────────────────
  // 1. X / 証拠フルケース（基準ケース）
  // ──────────────────────────────────────────────────────────
  {
    key: "x-evidence-full",
    label: "X投稿 — URL・日時・スクショあり",
    snsType: "X",
    category: "evidence_full",
    content: `X（旧Twitter）で個人を特定した上での誹謗中傷投稿を受けています。
相談者: 田中太郎（飲食店経営）
投稿URL: https://twitter.com/anonymous_user_xxx/status/1234567890
投稿日時: 2026年3月15日 22:47 (JST)
投稿者ハンドル: @anonymous_user_xxx（プロフィール: 匿名、フォロワー数 1,200）
投稿内容（スクショ保存済み）:
「田中太郎の店は食中毒を出しても隠蔽している。行くと危険」
同じアカウントから 3/16、3/17 にも関連投稿あり（いずれもスクショ保存済）。
実際には食中毒は一度も発生していない。保健所からの指導記録もなし。
店舗の Google レビューにも同一文言のレビューが投稿された（3/16 19:00）。
相談者は売上が 3/15 以降で約 30% 減少していると主張。`,
    hints: {
      topQuestions: [
        "投稿の tweet ID (status/ 以降の数値) は記録していますか",
        "スクショの取得日時と取得者は記録されていますか",
        "Google レビュー投稿の URL と本文は別途保全していますか",
      ],
      mustDetect: [
        "Google レビューは別プラットフォームのため別手続が必要",
        "売上30%減の客観裏付け資料 (POSデータ・日次売上表) の提出",
        "アーカイブ (Wayback Machine) での保全有無",
        "食中毒が実際に発生していないことの客観証明 (保健所記録)",
      ],
      practicalSignals: [
        "X/Twitter のログ保存期間への言及と緊急性",
        "Google レビューは別手続きで並行進行すべき",
        "スクショメタデータ (撮影日時・端末) の公証保全検討",
      ],
      forbiddenChecks: [
        "名誉毀損",
        "違法",
        "権利侵害",
        "勝訴",
        "該当する",
        "認められる",
      ],
    },
  },

  // ──────────────────────────────────────────────────────────
  // 2. 5ch / 投稿者不明・法人被害
  // ──────────────────────────────────────────────────────────
  {
    key: "5ch-identity-unclear",
    label: "5ちゃんねる — 投稿者不明・法人被害",
    snsType: "5ch",
    category: "info_gap_identity",
    content: `5ちゃんねるのスレッドで会社の実名と社長の名前を晒されています。
スレッド名: 「ブラック企業を語るスレ part82」
投稿の存在は確認しているが、スクショは 1 件のみ保存。
他の投稿は既に流れて見られなくなっている可能性。
投稿者は全員「名無しさん」で、IPもID（BBxxxxxxxx形式のID）のみ判明。
相談者: 山田商事株式会社（代表 山田一郎）
保存したスクショの内容:
「山田商事の山田一郎は社員に殴る蹴るの暴行をしているヤバい会社。入ったら終わり」
投稿日時はスクショに写っている 2026年2月頃（詳細な時分は見切れている）。
会社側としては暴行事件は発生していないと主張。
被害としては採用応募者の減少を感じているが、数値化はできていない。`,
    hints: {
      topQuestions: [
        "スレッドの URL を教えてください（板名とスレッド番号）",
        "該当レス番号 (>>番号) は特定できますか",
        "2026年2月の正確な投稿日時は特定できますか",
      ],
      mustDetect: [
        "スレッド URL の欠如",
        "レス番号の欠如",
        "5ch の ID (BBxxxxxxxx) は当日限定 = 翌日は別ID の特性",
        "採用応募者減の数値化 (応募数推移の記録化)",
        "法人被害における損害立証の組み立て方針",
      ],
      practicalSignals: [
        "5ch ログ保存期間（約3ヶ月）の期限迫り",
        "2月投稿 → 4月時点で証拠保全の緊急性が最大",
        "スレッドが流れる前の追加スクショ確保の急務",
      ],
      forbiddenChecks: [
        "信用毀損",
        "名誉毀損",
        "業務妨害",
        "違法",
        "該当する",
        "認められる",
        "勝訴",
      ],
    },
  },

  // ──────────────────────────────────────────────────────────
  // 3. Instagram / 時系列の大穴 + 脅迫的文言
  // ──────────────────────────────────────────────────────────
  {
    key: "instagram-timeline-gap",
    label: "Instagram — 時系列欠損・脅迫的文言",
    snsType: "Instagram",
    category: "info_gap_timestamp",
    content: `Instagram のDMとストーリーで嫌がらせを受けています。
相談者: 佐藤花子（個人）
いつから始まったかは覚えていません。去年の秋くらい？からDMが来始めました。
最初は普通のファンのような内容だったが、だんだんエスカレートして、
「お前の住所を知っている」「家族も巻き込む」等の内容になりました。
一時止まっていた時期もあります（冬の間は来ていなかった気がする）。
最近また再開し、ストーリーのコメントでも誹謗中傷が来るようになった。
具体的な日時は記録していません。DMの一部はスクショ済みだが、
ブロックした際に削除してしまい、今は 4 枚しか残っていない。
投稿者アカウント: @hater_account（複数アカウントの可能性あり）`,
    hints: {
      topQuestions: [
        "「住所を知っている」「家族も巻き込む」等の文言の具体的日時は特定できますか",
        "ブロック前の DM スクリーンショットは現在何枚保存されていますか",
        "この件で警察への相談・被害届提出は実施していますか",
      ],
      mustDetect: [
        "DM の正確な日時リスト化の必要性 (timeline に穴)",
        "複数アカウントの同一性立証方法",
        "Instagram 運営への開示請求可能性 (ブロック後も相手側ログは残存する可能性)",
        "警察相談と民事開示請求の並行対応",
        "ストーリー 24時間制限による証拠保全の急務",
      ],
      practicalSignals: [
        "ストーリー = 24時間で消滅 → 即時保全が最優先",
        "ブロック済み DM も相手側には残っている可能性",
        "脅迫的文言 = 刑事案件として並行対応すべき緊急性",
      ],
      forbiddenChecks: [
        "脅迫罪",
        "名誉毀損",
        "プライバシー侵害",
        "違法",
        "該当する",
        "認められる",
        "成立",
      ],
    },
  },

  // ──────────────────────────────────────────────────────────
  // 4. YouTube / 評価語ノイズ (最難関サンプル)
  // ──────────────────────────────────────────────────────────
  {
    key: "youtube-noise-injection",
    label: "YouTubeコメント — 評価語ノイズ・相談者主観満載",
    snsType: "YouTube",
    category: "mixed_noise",
    content: `YouTubeのコメント欄で私のチャンネルへの誹謗中傷があります。
これって明らかに名誉毀損ですよね？絶対に開示請求が認められると思います。
私のチャンネル: @cooking_with_rina（登録者 15,000人）
問題のコメント:
動画1「失敗しないパスタの作り方」2026年3月8日公開
  - user_abc: 「この女料理研究家ぶってるけど実は素人、詐欺師」(3/9 10:20)
  - user_abc: 「チャンネル登録も買ってるらしいよ」(3/9 10:25)
動画2「簡単!餃子レシピ」2026年3月12日公開
  - user_abc: 「また詐欺レシピかよ」(3/12 08:00)
user_abc は同一アカウント。プロフィールは空。
コメントは全てスクショ済み、動画URLも記録済み。
先日この件で知人に相談したら「これは 100% 勝訴できる」と言われました。
早く犯人を特定して訴えたいです。`,
    hints: {
      topQuestions: [
        "投稿者 user_abc とあなたの間に過去の接点 (元従業員、元知人等) はありますか",
        "他の動画でも同じアカウントからのコメント投稿はありますか",
        "チャンネル登録者・収益に実害は出ていますか（数値で把握していますか）",
      ],
      mustDetect: [
        "相談者の主観表現 (100%、絶対、明らかに) が facts/summary に残存していない",
        "相談者の知人発言「100%勝訴できる」が出力のどこにも載っていない",
        "user_abc の同一アカウント継続投稿 = 継続的犯意の立証材料",
        "YouTube (Google LLC) 開示請求は海外法人対応で時間がかかる",
        "他動画への類似コメント有無の確認",
      ],
      practicalSignals: [
        "Google LLC 直接開示の時間軸 (数ヶ月単位)",
        "同一アカウント継続投稿の証拠価値",
        "相談者の感情に引きずられず客観的事実のみ抽出すべき指示",
      ],
      forbiddenChecks: [
        "名誉毀損",
        "業務妨害",
        "勝訴",
        "違法",
        "明らかに",
        "100%",
        "絶対",
        "該当する",
        "認められる",
      ],
    },
  },

  // ──────────────────────────────────────────────────────────
  // 5. Discord / クローズド空間・複層プライバシー侵害
  // ──────────────────────────────────────────────────────────
  {
    key: "discord-metadata-missing",
    label: "Discord — 本名晒し・共同不法行為扇動",
    snsType: "Discord",
    category: "evidence_partial",
    content: `あるゲームコミュニティの Discord サーバーで、私に対する嫌がらせが発生しています。
相談者: 中村健（会社員、ゲーマーネーム: Ken_G）
サーバー名: 「XXXゲーム日本コミュニティ」（メンバー約 3,000 名、招待制）
問題の発生チャンネル: #general, #voice-lobby
内容: 私の本名と勤務先を誰かが特定してチャンネルに書き込み、
「Ken_G は◯◯株式会社の中村健、いじめてやろうぜ」等の書き込みが複数。
書き込み者は複数のユーザー名（ランダムな文字列）で、
Discord ID は記録していない。
サーバー管理者には削除要請済みだが、一部はまだ残っている。
スクショは 8 枚保存しているが、書き込み日時はスクショに表示されていない場合あり。
サーバーは招待制のため、第三者からは内容が確認できない。`,
    hints: {
      topQuestions: [
        "Discord User ID (18桁の数値 snowflake) は記録できますか",
        "本名と勤務先を最初に特定して投稿した人物の情報源に心当たりはありますか",
        "サーバー管理者からログ提供の協力は得られそうですか",
      ],
      mustDetect: [
        "Discord User ID (snowflake) 取得の必要性",
        "削除された書き込みの内容・日時の記録",
        "サーバー管理者への書き込みログ保全依頼",
        "本名・勤務先の情報源追跡 (内部漏洩可能性)",
        "共同不法行為 (書き込み者 + 「いじめてやろうぜ」扇動者) の複層性",
        "招待制 3,000人の「公然性」論点の整理",
      ],
      practicalSignals: [
        "管理者削除は証拠散逸リスク → 削除前の書き込み復旧依頼の急務",
        "Discord は米国法人 (特定電気通信役務提供者該当性) = 対応時間長",
        "本名+勤務先の露出 = 緊急性最高 (実生活への波及)",
      ],
      forbiddenChecks: [
        "プライバシー侵害",
        "共同不法行為",
        "名誉毀損",
        "違法",
        "該当する",
        "認められる",
        "成立",
      ],
    },
  },

  // ──────────────────────────────────────────────────────────
  // 6. X / 投稿が既に削除済み・Wayback Machine のみ (R8)
  // ──────────────────────────────────────────────────────────
  // 削除済み投稿のアーカイブケース。
  // AI が「投稿が現存しない」「アーカイブの証拠能力は公証より弱い」
  // 「X ログ保存期間経過リスク」「アカウント現存 = 追加保全の手がかり」
  // を拾えるかが焦点。第三者アーカイブ・メタデータ保全・公証といった
  // 実務知が未学習だとスコアが伸びない。
  {
    key: "x-archive-only-deleted",
    label: "X投稿 — 削除済み・Wayback Machine のみ",
    snsType: "X",
    category: "evidence_partial",
    content: `X (旧 Twitter) への誹謗中傷投稿が、気付いた時には既に削除されていました。
相談者: 鈴木健太 (個人事業主・整体院経営、柔道整復師国家資格保有)
問題の投稿: 既に削除済み (2026年3月20日時点で URL は 404)
投稿が存在していた時のURL:
  https://twitter.com/xxx_anti_xxx/status/1700000000000000000
投稿の存在証拠として残っているもの:
  (1) Wayback Machine (archive.org) に 2026年2月5日のスナップショット
      https://web.archive.org/web/20260205123456/https://twitter.com/...
  (2) 相談者本人が 2026年2月3日に撮影した iPhone スクショ 1 枚
      (ファイル名の日時推定のみ、Exif メタデータ未確認)
投稿内容 (スクショから転記):
  「鈴木整体院は無資格の素人が施術してる。ケガさせられた人が複数いるらしい」
投稿者ハンドル: @xxx_anti_xxx
投稿者アカウント: 現在も存在するが、2026年3月以降の投稿は全削除されている。
相談者は柔道整復師の国家資格を保有しており、施術事故は過去一度も発生していない。
削除前に RT / いいね された形跡はあるが、正確な拡散数は把握できていない。
相談者は「アーカイブが残っているなら大丈夫ですよね？」と楽観的。`,
    hints: {
      topQuestions: [
        "iPhone スクショの撮影日時は元ファイルのメタデータ (Exif) から確認できますか",
        "Wayback Machine のスナップショット URL は別途控えていますか (上書き/削除リスク)",
        "投稿者 @xxx_anti_xxx との過去のトラブル・接点に心当たりはありますか",
      ],
      mustDetect: [
        "Wayback Machine は第三者アーカイブであり、公証保全ほど証拠能力が強くないこと",
        "X 側の内部ログ保存期間経過リスク (投稿から約3ヶ月 → 5月には完全消失の可能性)",
        "iPhone スクショのメタデータ (Exif/撮影日時) を公証役場で事実実験公正証書として保全すべき",
        "投稿者アカウントが現存する → 現時点のプロフィール情報のアーカイブ確保が急務",
        "RT/いいね 拡散数が不明 → 損害立証の材料不足",
        "柔道整復師資格の客観証明資料 (登録証等) の準備",
      ],
      practicalSignals: [
        "X ログ保存期間 (約3ヶ月) → 2月投稿なら 5月までにログ請求しないと完全消失",
        "Wayback Machine のスナップショット自体が上書き・削除される可能性 → 即時複製保全",
        "スクショ原本を公証役場で事実実験公正証書化 (メタデータ込みで)",
        "投稿者アカウントの現状を今すぐ別の第三者アーカイブ (archive.today 等) に固定",
      ],
      forbiddenChecks: [
        "名誉毀損",
        "業務妨害",
        "信用毀損",
        "違法",
        "該当する",
        "認められる",
        "成立",
        "勝訴",
        "大丈夫",
      ],
    },
  },
];

export function getSampleByKey(key: string): ReleaseSample | undefined {
  return RELEASE_SAMPLES.find((s) => s.key === key);
}

// ==================================================================
// 採点型 + ゲート判定
// ==================================================================

export type SampleScore = {
  sampleKey: string;
  scoreFactAccuracy: number | null;
  scoreCompressionRate: number | null;
  scoreForbiddenCompliance: number | null;
  scoreMissingInfoDetection: number | null;
  scoreStructureConsistency: number | null;
  scorePracticalPriority: number | null;
};

export type GateStatus = "pass" | "fail" | "incomplete" | "no_data";

export type GateFailureReason = {
  sampleKey?: string;
  axis?: string;
  message: string;
};

export type GateAverages = {
  factAccuracy: number | null;
  compressionRate: number | null;
  forbiddenCompliance: number | null;
  missingInfoDetection: number | null;
  structureConsistency: number | null;
  practicalPriority: number | null;
  overall: number | null;
};

export type GateEvaluation = {
  status: GateStatus;
  sampleCount: number;
  scoredCount: number;
  averages: GateAverages;
  missingKeys: string[];
  failureReasons: GateFailureReason[];
};

/**
 * 閾値設計 (ベテラン弁護士監査反映):
 *
 *   サンプル単位 (絶対条件):
 *     - forbiddenCompliance: 全サンプルで 5 (満点) 必須
 *     - factAccuracy:        全サンプルで 4 以上必須
 *     - 全軸:                 全サンプルで 3 以上必須 (最低点ガード)
 *
 *   平均 (相対条件):
 *     - factAccuracy:        4.0 以上
 *     - compressionRate:     3.5 以上 (圧縮は改善余地ありで許容)
 *     - missingInfoDetection: 4.0 以上
 *     - structureConsistency: 4.0 以上
 *     - practicalPriority:   4.0 以上
 *
 *   全条件 AND で PASS。1 つでも欠けたら FAIL。
 */
export const GATE_THRESHOLDS = {
  sample: {
    forbiddenComplianceMin: 5,
    factAccuracyMin: 4,
    allAxesMin: 3,
  },
  average: {
    factAccuracy: 4.0,
    compressionRate: 3.5,
    missingInfoDetection: 4.0,
    structureConsistency: 4.0,
    practicalPriority: 4.0,
  },
} as const;

function nullAverages(): GateAverages {
  return {
    factAccuracy: null,
    compressionRate: null,
    forbiddenCompliance: null,
    missingInfoDetection: null,
    structureConsistency: null,
    practicalPriority: null,
    overall: null,
  };
}

export function evaluateGate(latestScores: SampleScore[]): GateEvaluation {
  const sampleCount = RELEASE_SAMPLES.length;
  const byKey = new Map(latestScores.map((s) => [s.sampleKey, s]));
  const missingKeys: string[] = [];
  const failureReasons: GateFailureReason[] = [];

  let scoredCount = 0;
  let sumFact = 0;
  let sumComp = 0;
  let sumForb = 0;
  let sumMiss = 0;
  let sumStruct = 0;
  let sumPract = 0;
  let fullyScored = 0;

  for (const sample of RELEASE_SAMPLES) {
    const s = byKey.get(sample.key);
    if (!s) {
      missingKeys.push(sample.key);
      continue;
    }
    scoredCount++;

    const allScored =
      s.scoreFactAccuracy != null &&
      s.scoreCompressionRate != null &&
      s.scoreForbiddenCompliance != null &&
      s.scoreMissingInfoDetection != null &&
      s.scoreStructureConsistency != null &&
      s.scorePracticalPriority != null;

    if (!allScored) {
      missingKeys.push(sample.key);
      continue;
    }

    // 以降は全軸スコア済み前提
    const fact = s.scoreFactAccuracy as number;
    const comp = s.scoreCompressionRate as number;
    const forb = s.scoreForbiddenCompliance as number;
    const miss = s.scoreMissingInfoDetection as number;
    const struct = s.scoreStructureConsistency as number;
    const pract = s.scorePracticalPriority as number;

    // ─── サンプル単位 絶対条件 ───
    if (forb < GATE_THRESHOLDS.sample.forbiddenComplianceMin) {
      failureReasons.push({
        sampleKey: sample.key,
        axis: "forbiddenCompliance",
        message: `${sample.label}: 禁止ワード遵守が満点ではない (${forb}/5)。法律AI補助では 1 件でも禁止ワード混入は致命的`,
      });
    }
    if (fact < GATE_THRESHOLDS.sample.factAccuracyMin) {
      failureReasons.push({
        sampleKey: sample.key,
        axis: "factAccuracy",
        message: `${sample.label}: 事実正確性が閾値未満 (${fact}/5, 要 ${GATE_THRESHOLDS.sample.factAccuracyMin}+)`,
      });
    }
    const axisPairs: Array<[string, number, string]> = [
      ["factAccuracy", fact, "事実正確性"],
      ["compressionRate", comp, "圧縮率"],
      ["forbiddenCompliance", forb, "禁止ワード遵守"],
      ["missingInfoDetection", miss, "不足情報指摘力"],
      ["structureConsistency", struct, "構造整合"],
      ["practicalPriority", pract, "実務優先順位"],
    ];
    for (const [axisKey, v, label] of axisPairs) {
      if (v < GATE_THRESHOLDS.sample.allAxesMin) {
        failureReasons.push({
          sampleKey: sample.key,
          axis: axisKey,
          message: `${sample.label}: ${label} が最低点ガード未満 (${v}/5, 要 ${GATE_THRESHOLDS.sample.allAxesMin}+)`,
        });
      }
    }

    sumFact += fact;
    sumComp += comp;
    sumForb += forb;
    sumMiss += miss;
    sumStruct += struct;
    sumPract += pract;
    fullyScored++;
  }

  if (fullyScored === 0) {
    return {
      status: scoredCount === 0 ? "no_data" : "incomplete",
      sampleCount,
      scoredCount,
      averages: nullAverages(),
      missingKeys,
      failureReasons,
    };
  }

  const avgFact = sumFact / fullyScored;
  const avgComp = sumComp / fullyScored;
  const avgForb = sumForb / fullyScored;
  const avgMiss = sumMiss / fullyScored;
  const avgStruct = sumStruct / fullyScored;
  const avgPract = sumPract / fullyScored;
  const overall =
    (avgFact + avgComp + avgForb + avgMiss + avgStruct + avgPract) / 6;

  // ─── 平均 相対条件 ───
  if (avgFact < GATE_THRESHOLDS.average.factAccuracy) {
    failureReasons.push({
      axis: "factAccuracy",
      message: `事実正確性の平均が ${GATE_THRESHOLDS.average.factAccuracy} 未満 (${avgFact.toFixed(2)})`,
    });
  }
  if (avgComp < GATE_THRESHOLDS.average.compressionRate) {
    failureReasons.push({
      axis: "compressionRate",
      message: `圧縮率の平均が ${GATE_THRESHOLDS.average.compressionRate} 未満 (${avgComp.toFixed(2)})`,
    });
  }
  if (avgMiss < GATE_THRESHOLDS.average.missingInfoDetection) {
    failureReasons.push({
      axis: "missingInfoDetection",
      message: `不足情報指摘の平均が ${GATE_THRESHOLDS.average.missingInfoDetection} 未満 (${avgMiss.toFixed(2)})`,
    });
  }
  if (avgStruct < GATE_THRESHOLDS.average.structureConsistency) {
    failureReasons.push({
      axis: "structureConsistency",
      message: `構造整合の平均が ${GATE_THRESHOLDS.average.structureConsistency} 未満 (${avgStruct.toFixed(2)})`,
    });
  }
  if (avgPract < GATE_THRESHOLDS.average.practicalPriority) {
    failureReasons.push({
      axis: "practicalPriority",
      message: `実務優先順位の平均が ${GATE_THRESHOLDS.average.practicalPriority} 未満 (${avgPract.toFixed(2)})`,
    });
  }

  const status: GateStatus =
    fullyScored < sampleCount
      ? "incomplete"
      : failureReasons.length === 0
        ? "pass"
        : "fail";

  return {
    status,
    sampleCount,
    scoredCount: fullyScored,
    averages: {
      factAccuracy: avgFact,
      compressionRate: avgComp,
      forbiddenCompliance: avgForb,
      missingInfoDetection: avgMiss,
      structureConsistency: avgStruct,
      practicalPriority: avgPract,
      overall,
    },
    missingKeys,
    failureReasons,
  };
}

// ==================================================================
// compressionRate 定義 (採点基準の標準化・曖昧さ除去)
// ==================================================================

/**
 * 採点時にUIに表示する軸定義。
 *
 * compressionRate は特に曖昧だったため、ここで実務的に固定する:
 *   「相談者の主観・冗長表現を除去し、客観事実のみを簡潔に抽出できているか」
 */
export const AXIS_DEFINITIONS = {
  factAccuracy: {
    label: "事実正確性",
    description: "相談内容から逸脱なく客観事実を抽出できているか。創作はゼロが絶対条件",
    sampleThreshold: 4,
    averageThreshold: 4.0,
  },
  compressionRate: {
    label: "圧縮率",
    description:
      "相談者の主観・冗長表現を除去し、客観事実のみを簡潔に抽出できているか。減点対象: 「絶対」「明らかに」等が残存、同じ事実の重複、感情語の残存",
    sampleThreshold: 3,
    averageThreshold: 3.5,
  },
  forbiddenCompliance: {
    label: "禁止ワード遵守",
    description:
      "「違法」「名誉毀損」「該当」「勝訴」等の法的評価語が出力されていないか。全サンプル 5 点 (満点) 必須",
    sampleThreshold: 5,
    averageThreshold: 5.0,
  },
  missingInfoDetection: {
    label: "不足情報指摘力",
    description: "面談で聞くべき情報を missingInfo / suggestedQuestions で拾えているか",
    sampleThreshold: 3,
    averageThreshold: 4.0,
  },
  structureConsistency: {
    label: "構造整合",
    description: "timeline / riskFlags / parties の構造が妥当で、フィールド間に矛盾がないか",
    sampleThreshold: 3,
    averageThreshold: 4.0,
  },
  practicalPriority: {
    label: "実務優先順位",
    description:
      "ログ保存期限・証拠保全の緊急性・次アクションの明示ができているか。" +
      "5=緊急性/優先順位/具体アクション全明示、4=概ね正しい優先順位、3=一部触れるが弱い、2=形式的指摘のみ、1=実務的価値なし",
    sampleThreshold: 3,
    averageThreshold: 4.0,
  },
} as const;

export type AxisKey = keyof typeof AXIS_DEFINITIONS;
