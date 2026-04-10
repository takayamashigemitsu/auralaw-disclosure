/**
 * A6 リリースゲート用サンプル（5件）
 *
 * CAIO 方針: AI整理の品質を 5 軸で定量評価するための
 * 固定テストスイート。SNS種別・証拠充実度・情報欠損パターンを
 * 意図的にバラけさせて、プロンプト改善の影響を定点観測できる。
 *
 * 追加・変更する場合は promptVersion と合わせて CHANGELOG を残すこと。
 */
export type ReleaseSample = {
  /** 一意キー。/admin/release-gate の履歴絞り込み用 */
  key: string;
  /** 人間向けラベル */
  label: string;
  /** SNS 種別 */
  snsType: "X" | "Instagram" | "5ch" | "YouTube" | "Discord";
  /** 想定カテゴリ（評価時の観点メモ） */
  category:
    | "evidence_full"
    | "evidence_partial"
    | "info_gap_timestamp"
    | "info_gap_identity"
    | "mixed_noise";
  /** 相談内容テキスト（PIIは仮名で構成） */
  content: string;
  /** このサンプルで特に見るべき評価ポイント（弁護士へのヒント） */
  evaluationHints: string[];
};

export const RELEASE_SAMPLES: ReleaseSample[] = [
  // ──────────────────────────────────────────────────────────
  // 1. X / 証拠がほぼ揃っているクリアケース
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
    evaluationHints: [
      "投稿URL・日時・ハンドルが facts に抽出されているか",
      "timeline に 3/15, 3/16, 3/17 の時系列が並ぶか",
      "売上30%減を事実として書けているか（評価語なし）",
      "不足情報として「食中毒がなかったことの証明方法」を指摘できるか",
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 2. 5ch / 証拠部分的・投稿者特定困難
  // ──────────────────────────────────────────────────────────
  {
    key: "5ch-identity-unclear",
    label: "5ちゃんねる — 投稿者不明・部分証拠",
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
    evaluationHints: [
      "投稿者特定不可が IDENTITY_UNCLEAR riskFlag で出るか",
      "日時が「2月頃」の曖昧さを timeline.gap で示せるか",
      "missingInfo に「追加のスクショ取得」「応募者減の数値化」が入るか",
      "「ヤバい会社」等の口語表現を事実として扱えているか",
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 3. Instagram / 時系列の穴が大きい
  // ──────────────────────────────────────────────────────────
  {
    key: "instagram-timeline-gap",
    label: "Instagram — タイムライン欠損",
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
    evaluationHints: [
      "timeline.gap=true が複数出るか",
      "TIMELINE_INCOMPLETE riskFlag が出るか",
      "missingInfo に「DMの正確な日時リスト」「アカウント同一性」が入るか",
      "「覚えていません」「気がする」を事実として扱わず、質問事項に回す",
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 4. YouTube / ノイズ混入・評価語誘発
  // ──────────────────────────────────────────────────────────
  {
    key: "youtube-noise-injection",
    label: "YouTubeコメント — ノイズ混入・評価語誘発",
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
    evaluationHints: [
      "「名誉毀損」「開示請求が認められる」「勝訴」等の評価語が summary/facts から除去されているか",
      "禁止ワード strip が発火して hadForbiddenWords=true になるか",
      "事実（コメント内容・日時・アカウント）は正しく抽出されているか",
      "相談者の主観（「絶対」「明らかに」）は suggestedQuestions 側に逃げているか",
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 5. Discord / クローズド空間・メタデータ欠如
  // ──────────────────────────────────────────────────────────
  {
    key: "discord-metadata-missing",
    label: "Discord — クローズド空間・メタデータ欠如",
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
    evaluationHints: [
      "MISSING_METADATA riskFlag（Discord ID未記録、日時欠落）が出るか",
      "SOURCE_UNVERIFIED 相当の指摘（招待制で第三者確認不可）が出るか",
      "missingInfo に「Discord ID 取得」「サーバー管理者からのログ取得」が入るか",
      "本名・勤務先の露出を事実として記述できているか",
    ],
  },
];

export function getSampleByKey(key: string): ReleaseSample | undefined {
  return RELEASE_SAMPLES.find((s) => s.key === key);
}

/**
 * リリースゲート判定: すべてのサンプルが 5 軸全てで平均 4.0 以上なら pass。
 * 採点行が 1 件でも未完了なら incomplete。
 */
export type GateStatus = "pass" | "fail" | "incomplete" | "no_data";

export type GateEvaluation = {
  status: GateStatus;
  sampleCount: number;
  scoredCount: number;
  averages: {
    factAccuracy: number | null;
    compressionRate: number | null;
    forbiddenCompliance: number | null;
    missingInfoDetection: number | null;
    structureConsistency: number | null;
    overall: number | null;
  };
  missingKeys: string[];
};

export type SampleScore = {
  sampleKey: string;
  scoreFactAccuracy: number | null;
  scoreCompressionRate: number | null;
  scoreForbiddenCompliance: number | null;
  scoreMissingInfoDetection: number | null;
  scoreStructureConsistency: number | null;
};

export function evaluateGate(
  latestScores: SampleScore[],
  passThreshold = 4.0
): GateEvaluation {
  const sampleCount = RELEASE_SAMPLES.length;
  const byKey = new Map(latestScores.map((s) => [s.sampleKey, s]));
  const missingKeys: string[] = [];
  let scoredCount = 0;

  let sumFact = 0;
  let sumComp = 0;
  let sumForb = 0;
  let sumMiss = 0;
  let sumStruct = 0;
  let fullyScored = 0;

  for (const sample of RELEASE_SAMPLES) {
    const s = byKey.get(sample.key);
    if (!s) {
      missingKeys.push(sample.key);
      continue;
    }
    scoredCount++;
    if (
      s.scoreFactAccuracy != null &&
      s.scoreCompressionRate != null &&
      s.scoreForbiddenCompliance != null &&
      s.scoreMissingInfoDetection != null &&
      s.scoreStructureConsistency != null
    ) {
      sumFact += s.scoreFactAccuracy;
      sumComp += s.scoreCompressionRate;
      sumForb += s.scoreForbiddenCompliance;
      sumMiss += s.scoreMissingInfoDetection;
      sumStruct += s.scoreStructureConsistency;
      fullyScored++;
    } else {
      missingKeys.push(sample.key);
    }
  }

  if (fullyScored === 0) {
    return {
      status: scoredCount === 0 ? "no_data" : "incomplete",
      sampleCount,
      scoredCount,
      averages: {
        factAccuracy: null,
        compressionRate: null,
        forbiddenCompliance: null,
        missingInfoDetection: null,
        structureConsistency: null,
        overall: null,
      },
      missingKeys,
    };
  }

  const avgFact = sumFact / fullyScored;
  const avgComp = sumComp / fullyScored;
  const avgForb = sumForb / fullyScored;
  const avgMiss = sumMiss / fullyScored;
  const avgStruct = sumStruct / fullyScored;
  const overall = (avgFact + avgComp + avgForb + avgMiss + avgStruct) / 5;

  const allAxesPass =
    avgFact >= passThreshold &&
    avgComp >= passThreshold &&
    avgForb >= passThreshold &&
    avgMiss >= passThreshold &&
    avgStruct >= passThreshold;

  const status: GateStatus =
    fullyScored < sampleCount
      ? "incomplete"
      : allAxesPass
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
      overall,
    },
    missingKeys,
  };
}
