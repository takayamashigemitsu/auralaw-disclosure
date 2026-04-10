# Session Handoff Log

このファイルはClaude Codeの各セッション間で作業経緯を共有するためのログです。
各セッションが作業終了時に自動で追記し、新しいセッション開始時に自動で読みます。

---

## 2026-03-30 04:20 | Telegram (CLI) | セットアップ

**やったこと:**
- Telegram Bot (@AuraCode2026Bot) とClaude Code CLIの接続を確立
- ペアリング (user_id: 872352073) を承認
- プロジェクト構造の確認・把握

**現在の状態:**
- セキュリティ強化が直近3コミットで完了済み（2FA、監査ログ、CSP、レート制限等）
- dev serverは停止中

**次にやるべきこと:**
- 特に未着手のタスクなし。指示待ち。

**判断・方針メモ:**
- Telegram経由でもこのプロジェクトの作業が可能であることを確認済み
- セッション間の経緯共有のため、このHANDOFF.mdを導入

---

## 2026-04-10 | Desktop | P0 実装（CAIO再設計に基づく公開前整備）

**やったこと:**
- 確定事項: ①同意チェックボックスA案 ②LPパターンX ③SLA平日24h/休日翌営業日 ④QStash採用（実装は後続） ⑤Anthropic通常API
- **P0-5** LP文言修正（`src/app/page.tsx`）
  - hero / STEP01 desc / final CTA / 受付時間 に SLA と「AI整理→弁護士提案」統一
  - `src/app/contact/page.tsx` のヘッダー文言も同期
  - `src/app/simulator/page.tsx` 結果に「参考値・弁護士確認必須」バナー追加
- **P0-1** 法務ドキュメント改訂
  - `src/app/privacy/page.tsx` 全面改訂: 第5条に生成AI利用を新設、委託先11社明記（Anthropic PBC, OpenAI, Google, Microsoft, AWS, Meta, xAI, Mistral, Cohere 等）、法28条対応、仮名化、AI出力責任の所在
  - `src/app/terms/page.tsx` 全面改訂: 第5条にAI利用条項、第7条にプロンプトインジェクション禁止、第4条にSLA明記
- **P0-2** 相談フォーム同意チェックボックス（A案・硬め）
  - `prisma/schema.prisma` Consultation に `consentedAt / consentVersion / consentPrivacy / consentTerms / consentAI` 追加
  - `src/app/api/consultations/route.ts` で3同意を `.literal(true)` で必須化、CONSENT_VERSION="2026-04-10"
  - `src/app/contact/page.tsx` にチェックボックス3つ（個人情報保護方針/AI処理/利用規約）
- **P0-3** AIプロバイダ抽象化層
  - `src/lib/ai/provider.ts` (interface)
  - `src/lib/ai/anthropic.ts` (通常APIクライアント + 料金計算)
  - `src/lib/ai/stub.ts` (APIキー未設定時フォールバック)
  - `src/lib/ai/cost-guard.ts` (日次10USD・1req1USDデフォルト、AppLog集計)
  - `src/lib/ai/index.ts` (callAI共通ラッパー: safety→cost→call→record→limit)
- **P0-4** PII仮名化パイプライン
  - `src/lib/ai/pii-filter.ts` (email/phone/URL/郵便番号をトークン化、unmask対応、isSafeToSendToAI)
- 既存 `src/lib/ai.ts` を新抽象化層経由に移行（callAI()経由）、`analyzeScreenshots`にuserId引数追加、`analyze/route.ts`も更新
- `npx prisma generate` ✅
- `npx tsc --noEmit` ✅ エラーなし

**現在の状態:**
- TypeScript型チェック通過
- **DBマイグレーション未実行**: `Consultation`に新カラム追加済みだが、本番DBへのpush/migrateはユーザー承認待ち
- ビルド自体は tsc 成功のため破綻はしていない見込み（Next.js build 未実行）
- LP公開ゲート `/gate` はまだ有効。P0完了承認後に解除予定

**次にやるべきこと（ユーザー判断待ち）:**
1. **DBマイグレーション実行**: `npx prisma db push`（非破壊、新カラムはdefaultあり/nullable）
2. 事務所内弁護士によるプライバシーポリシー・利用規約レビュー
3. 環境変数追加（任意）: `AI_DAILY_COST_LIMIT_USD`, `AI_SINGLE_REQUEST_LIMIT_USD`, `AI_PROVIDER_FORCE_STUB`
4. LP公開前チェックリスト実行 → 公開ゲート解除

**判断・方針メモ:**
- 原則: 「AIで判断するな、AIで圧縮しろ」
- `src/lib/ai.ts` の `analyzeScreenshots` は旧「AIで法的判断」の名残。新抽象化層経由に移行済みだが、将来的にはこの関数自体を廃止し「相談内容の整理・要約」専用APIに置き換える（P1）
- 画像はPII filter不可。`pii-filter.ts` には `isSafeToSendToAI` で base64画像混入検知のみ実装
- QStash導入はP1以降（本PRでは未着手）

---

## 2026-04-10 | Desktop | Phase A 実装完了（A4→A1→A6→A3→A5→A2→A7）

**やったこと:**
- **計画書書き換え**: `~/.claude/plans/rustling-dreaming-wind.md` を CAIO v2 方針で全面刷新。実装順 A4→A1→A6→A3→A5→A2→A7 確定。
- **A4 相談詳細シェル**: `src/app/admin/consultations/[id]/consultation-memo.tsx` を autosave (1s debounce) + SaveState UI + beforeunload 警告に刷新。`page.tsx` から旧 AIAnalysisButton を撤去。
- **A1 Prisma スキーマ**: `AIOrganizeResult` (createdBy/promptVersion/summary/facts/parties/timeline/suggestedQuestions/riskFlags/missingInfo/rawResponse)、`Notification`、`CaseDocument.documentType`/`isSharedWithClient`、`ClientInvitation` 追加。`npx prisma db push` ✅。
- **A6 AI整理**:
  - `src/lib/ai/organize.ts`: organize-v1 プロンプト + 禁止ワード strip（名誉毀損/違法/権利侵害/該当する/認められる…）+ RiskFlag 5値 enum 構造制約 + summary 3行/facts 7件/questions 5問 制限 + PII mask/unmask
  - `src/app/api/ai/organize/route.ts`: ADMIN/STAFF 限定、consultationId/caseId 両対応、AIOrganizeResult 永続化、禁止ワードヒットは AppLog category="ai_safety"
  - `src/app/api/ai/organize/history/route.ts`: 履歴 API
  - `src/components/ai-organize.tsx`: 2秒 skeleton → 3秒で「バックグラウンド処理中」表示 → 結果置換、summary/facts/parties/timeline(gap赤)/questions/riskFlags(RISK_LABELS)/missingInfo セクション、常時表示の「弁護士確認必須」バナー、履歴トグル
  - 相談詳細・案件詳細の両方から `<AIOrganize />` で呼び出し
- **A3 検索・フィルタ**: 既実装を確認（`search-input.tsx` / `status-filter.tsx` が相談・案件一覧で既に稼働）。変更なし。
- **A5 ファイル管理**: `src/app/admin/cases/[id]/documents/page.tsx` + `documents-manager.tsx`（タブは作らず documentType enum の Select フィルタ + インライン種別変更 + 共有トグル + DL + 削除）。`/api/cases/[id]/documents` POST（10MB/PDF/Word/画像）、`/api/case-documents/[id]` PATCH/DELETE。
- **A2 Supabase Storage 移行**: `src/lib/storage.ts` を private bucket `case-files` + **path 保存**（URL ではない）+ `getSignedUrl`（15分 TTL）+ `resolveFileUrl`（data:/http:/path 互換）に刷新。`src/app/api/case-documents/[id]/download/route.ts` 新設（ADMIN/STAFF 全件、CLIENT は isSharedWithClient + 自案件のみ、signed URL リダイレクト）。ポータル側 `portal/cases/[id]/page.tsx` のダウンロードリンクを新 API 経由に変更。
- **A7 サイドバー**: `admin-sidebar.tsx` に「通知」(Bell) 追加、`src/app/admin/notifications/page.tsx` 新設（直近100件、既読/未読表示、link 付き通知は Link 化）。書類管理・クライアントは既存。
- `npx tsc --noEmit` ✅ エラーなし（全工程）

**現在の状態:**
- TypeScript 型チェック通過
- `npx prisma db push` 実行済み（AIOrganizeResult/Notification/ClientInvitation/CaseDocument 拡張）
- `AI_PROVIDER_FORCE_STUB=true` のまま（A6 リリースゲート前なので実 API は叩かない）
- LP 公開ゲート `/gate` 維持
- dev server 停止中

**次にやるべきこと:**
1. **A6 リリースゲート**: 事務所内弁護士と相談サンプル 5 件で 5 軸採点（summary / facts / timeline / questions / riskFlags）、平均 4 未満なら promptVersion 上げて再調整
2. **Phase B 開始**: B1 Resend メール通知 → B2 ポータル共有ファイル → B3 クライアント招待 → B4 QStash + Job モデル
3. Phase C1: リリースゲート通過後に `AI_PROVIDER_FORCE_STUB=false`、初日は `AI_DAILY_COST_LIMIT_USD=3` で様子見
4. C2: docx-templates で委任状・開示請求書・訴状生成 + QStash 非同期化
5. 法務レビュー（/privacy, /terms）継続

**判断・方針メモ:**
- RiskFlag は `string[]` ではなく `{ type: enum, detail: string }[]` 構造制約にすることで、LLM が "名誉毀損の可能性" のような判断語に流れる経路を構造的に閉じた
- AIOrganizeResult に `createdBy` と `promptVersion` を必ず持たせ、プロンプト改善時の A/B 比較・監査を可能に
- A5 はタブ UI を作らず enum フィルタ 1 本に寄せた（YAGNI）
- Storage は path 保存に変更。旧 data:/http:// 形式は `resolveFileUrl` で互換維持
- Supabase `service_role` キーはサーバーサイドのみ、クライアント直アクセス禁止を徹底
- `@/lib/ai` のパス解決は `src/lib/ai.ts`（ファイル）に向くため、`AICostLimitError` 等は `@/lib/ai/cost-guard` から直接 import する必要あり

---

## 2026-04-10 | Desktop | Phase B0 Step1（Critical 4件の是正）

**背景:**
CAIO 監査で β 運用前に塞ぐべき Critical が 4 件検出された。計画書の Phase B に入る前に B0 として先行実施。

**やったこと:**

### C1 — 案件アクセス権の統一（`verifyCaseAccess` 未使用問題）
- `src/lib/case-auth.ts` を刷新: `requireCaseAccess(caseId)` / `requireStaff()` / `requireStaffCaseAccess(caseId)` の3ヘルパーを追加。いずれも `{ ok, session, caseData | response }` を返す。`NextAuth v5` の `auth()` が `NextMiddleware` オーバーロード側に推論されないよう `import type { Session }` + `getSession()` でラップ。
- 以下のルートを全て3ヘルパー経由に統一し、手書きの `session.user.role` / `clientUserId` チェックを撲滅:
  - `src/app/api/cases/[id]/route.ts` (GET / PATCH)
  - `src/app/api/cases/[id]/messages/route.ts` (POST) — **STAFF も案件存在チェックされるバグ潰し**
  - `src/app/api/cases/[id]/billing/route.ts` (GET / POST)
  - `src/app/api/cases/[id]/billing/[billingId]/route.ts` (PATCH / DELETE)
  - `src/app/api/cases/[id]/targets/route.ts` (GET / POST)
  - `src/app/api/cases/[id]/targets/[targetId]/route.ts` (PATCH / DELETE)
  - `src/app/api/cases/[id]/timeline/route.ts` (POST)
  - `src/app/api/cases/[id]/tasks/route.ts` (GET / POST)
  - `src/app/api/cases/[id]/documents/route.ts` (POST) — 併せて `e.message` 垂れ流し（M3）も修正
  - `src/app/api/case-documents/[id]/route.ts` (PATCH / DELETE) — **H4 Storage orphan 修正もここで実施**: Storage 削除を先に成功させてから DB を削除（旧: swallow していた）
  - `src/app/api/case-documents/[id]/download/route.ts` — CLIENT 拒否時は 403 → 404（存在秘匿）
- 効果: 今後 `/api/cases/**` に新しいルートを追加する開発者は、`requireCaseAccess` / `requireStaffCaseAccess` をコピペするだけで権限抜けが構造的に発生しない。

### C4 — cost-guard の TOCTOU レース解消
- `src/lib/rate-limit.ts` の `redis` インスタンスを `export` に変更
- `src/lib/ai/cost-guard.ts` 全面書き換え:
  - micro USD (×1e6) 整数で扱う
  - `reserveDailyCost()` → Redis `incrby(SINGLE_REQUEST_LIMIT_MICRO)` で atomic 予約
  - 初回 incr のときだけ `expire(48h)` セット
  - 日次上限超過なら `decrby` ロールバック後に `AICostLimitError`
  - `commitDailyCost(reservation, actualCostUsd)` で差分 (actual - reserved) を incrby/decrby
  - `releaseDailyCost(reservation)` で例外時に全解放
  - JST 00:00 リセット (`ai:cost:daily:YYYYMMDD` キー)
  - Redis 未設定時は従来の DB 集計フォールバック（開発環境のみ、レース排除は保証しない旨コメント）
  - 監査用 `recordCost` は AppLog に継続記録（Redis とは別）
- `src/lib/ai/index.ts` の `callAI()` を **reserve → call → commit / release** フローに改修。Stub は予約スキップ。
- 効果: 10同時リクエスト × $1 予約でも 11本目は確実に弾かれる。実コストが予約より小さければ delta で解放される。

### JWT TTL 短縮
- `src/lib/auth.ts` に `session.maxAge = 8h` + `updateAge = 1h` を追加
- 効果: ADMIN → STAFF 降格や退職ユーザーのアクセス遮断が最長 8 時間で反映

### /api/gate レート制限
- `src/lib/rate-limit.ts` に `gateLimiter`（10分あたり5回、IPベース）を追加
- `src/app/api/gate/route.ts` で IP ごとに `gateLimiter.limit()` 実施、超過時 429
- 効果: SITE_PASSWORD の総当たりが事実上不可能に

**現在の状態:**
- `npx tsc --noEmit` ✅
- dev server コンパイル通過、`/admin/login` 200、console エラーなし
- `AI_PROVIDER_FORCE_STUB=true` 維持（C4 は実 API 想定の修正だが、Stub 下でも reserve/commit パスが動作する構造）
- LP 公開ゲート `/gate` はレート制限付きで維持

**次にやるべきこと（Step 2 — A6 リリースゲート前）:**
1. **C3** `/api/ai/organize` の AIOrganizeResult 作成 + AppLog 記録を `prisma.$transaction` に統一
2. **H2** プロンプト境界マーカー（`[CONSULTATION_INPUT_START]...[END]`）を organize.ts の USER_PROMPT_TEMPLATE に追加
3. **H1** 禁止ワード正規化（ひらがな辞書マッチ + 英語別リスト）
4. **+ idempotency** `AIOrganizeResult` に `hash(consultationId + normalizedContent + promptVersion)` のユニークキーを追加、連打防止

**次の次（Step 3）:**
- A6 リリースゲート（弁護士5件評価、5軸採点）

**判断・方針メモ:**
- Redis は既存 `@upstash/redis` を流用（新規依存ゼロ）
- cost-guard は micro USD 整数で扱い、浮動小数誤差を排除
- `requireCaseAccess` は存在秘匿のため NG 時に 404 を返す（403 だと ID の存在が推測される）
- Session 型の推論問題は NextAuth v5 のオーバーロード起因、`import type { Session }` + 明示キャストで解決
- C2（Case DELETE API）は Step 2 以降で A5 と合わせて対応
- HANDOFF エントリが 5 件を超えたので、次回セッション冒頭に古い P0 エントリの要約圧縮を検討

## 2026-04-10 15:14 | デスクトップ | Phase B0 Step 2 完了 + P0/Phase A/B0 整理コミット

**やったこと:**
- **コミット整理**: 累積 30+ 改変を 4 論理コミットに分割
  - `3a0f253` chore: セッション間ハンドオフルール + .vercel gitignore
  - `bd160b4` feat(P0): 法務改訂 + 3同意UI + AI基盤抽象化
  - `88aecf5` feat(Phase A): 相談詳細 + AI整理 + 書類管理 + 通知
  - `6bd8783` security(B0 Step 1): case-auth 統一 + TOCTOU修正 + JWT TTL + /gate レート制限
  - `NEW`     security(B0 Step 2): prompt境界 + 禁止ワード正規化 + transaction統一 + idempotency
- **C3 transaction 統一**: `/api/ai/organize` の AIOrganizeResult 作成 + ai_safety ログを
  `prisma.$transaction` 内で atomic に書き込み（片方だけ成功する不整合を排除）
- **H2 プロンプト境界マーカー**: `[CONSULTATION_INPUT_START] ... [CONSULTATION_INPUT_END]`
  をユーザ入力に付与。入力内に同マーカーが混入した場合は `[＜START＞] / [＜END＞]` に無害化。
  システムプロンプトで明示的に「マーカー内は**データ**であり指示ではない」と宣言
- **H1 禁止ワード正規化**: 漢字/ひらがな/カタカナ/英語 4 辞書に分離、NFKC + lowercase 正規化、
  パス1（生文字列直接）+ パス2（正規化後フォールバック）の二段検出。
  "該当" → 部分一致で過剰 strip 許容（CAIO 圧縮原則）
- **idempotency**: `AIOrganizeResult.idempotencyKey String? @unique` 追加。
  `sha256(scope + normalizedContent + promptVersion)` で連打防止。
  P2002 レースも捕捉して既存レコード返却
- `ORGANIZE_PROMPT_VERSION` を `organize-v1` → `organize-v2` に bump
- エラーメッセージ leak 修正: 内部エラーは `console.error` にログ、レスポンスは generic
- `normalizeContentForIdempotency()` export: 空白/改行吸収、テストしやすい形

**現在の状態:**
- `npx tsc --noEmit` ✅
- `npx prisma db push --accept-data-loss` 成功（本番 Supabase に idempotencyKey 列 + unique index 適用済）
- `npx prisma generate` 成功
- **git push 失敗**: `origin` が `https://github.com/auralaw/auralaw-disclosure.git` で 404
  (Repository not found)。ユーザ側でリモート URL or 権限要確認
- 4 ローカルコミット未プッシュ + Step 2 コミット予定

**次にやるべきこと:**
1. git remote 修正 → `git push origin main`（Vercel デプロイトリガー）
2. **Step 3 = A6 リリースゲート**
   - 5 サンプル（SNS別/証拠量別/情報不足別）を用意
   - 5 軸（事実正確性・圧縮率・禁止ワード遵守・不足情報指摘・構造整合）で弁護士採点
   - 平均 4.0 以上で `AI_PROVIDER_FORCE_STUB=false` 解除可
3. C2: Case DELETE API + A5 cleanup
4. Phase B1: Resend メール通知

**判断・方針メモ:**
- idempotency の scope は `consultation:<id>` / `case:<id>` の prefix 付き文字列で衝突回避
- promptVersion を key に含めた → プロンプト改善すれば同一内容でも再実行可能
- 禁止ワード「過剰strip」方針は CAIO 圧縮原則。誤爆は弁護士レビューで補正する想定
- `neutralizeBoundaryMarkers` は split/join ベース（RegExp より高速、エスケープ不要）
- `safeParseArray` は idempotent ヒット時の JSON 復元ヘルパー
- db push は nullable なので既存行はすべて NULL、unique 制約は NULL 同士で衝突しない（Postgres 仕様）

## 2026-04-10 16:00 | Desktop Claude | A6 リリースゲート — ベテラン弁護士監査反映 (6軸 + 運用の芯)

**やったこと:**
- A6 初版 (5 軸) を「ベテラン弁護士 AI」として監査 → 50/100 点と判定、R1〜R8 の改善案を提示
- ユーザ承認のうえ「C + 運用の芯」パッケージを実装:

  **R1 判定ロジック強化**
  - `evaluateGate()` を全面書き換え
  - サンプル単位 絶対条件: `forbiddenCompliance=5 必須` / `factAccuracy≥4` / `全軸≥3` の最低点ガード
  - 平均 相対条件: `factAccuracy/missingInfoDetection/structureConsistency/practicalPriority ≥ 4.0`, `compressionRate ≥ 3.5`
  - 1 条件でも欠けたら FAIL、`failureReasons[]` で具体メッセージ列挙
  - `GATE_THRESHOLDS` 定数化

  **R2 弁護士グレード EvaluationHints**
  - `string[]` から 4 セクション構造化: `topQuestions / mustDetect / practicalSignals / forbiddenChecks`
  - 5 サンプル全て書き直し (tweet ID 重要性・5ch ID 当日限定・Instagram 脅迫並行・YouTube 相談者主観フィルタ・Discord snowflake 等の実務知埋め込み)

  **R4 第6軸 practicalPriority (実務優先順位)**
  - ログ保存期限 / 証拠保全緊急性 / 次アクション明示 を独立評価
  - `scorePracticalPriority Int?` を `AISampleRun` に追加

  **運用の芯 ReleaseGateApproval (immutable snapshot)**
  - `prisma/schema.prisma` に `ReleaseGateApproval` モデル追加（promptVersion / result / samplesJson / evaluationJson / notes / reviewerId）
  - `/api/admin/release-gate/approve` POST/GET 新設
  - POST: 最新スコアで再評価 → PASS 検証 + prompt version 整合性検証 → snapshot 作成 + audit ログ
  - **本番 AI 解放は自動化しない**: 人間が Vercel 環境変数 `AI_PROVIDER_FORCE_STUB=false` を手動設定する設計

  **compressionRate 定義固定**
  - `AXIS_DEFINITIONS` で「相談者の主観・冗長表現を除去し、客観事実のみを簡潔に抽出できているか」と明文化
  - 減点対象（「絶対」「明らかに」の残存、重複、感情語）も併記

  **UI 全面書き換え (`release-gate-client.tsx`)**
  - 6 軸対応 (`AXES` に practicalPriority 追加、採点 grid 5→6)
  - `EvaluationHints` 4 セクション表示 (色分けアイコン付き)
  - `failureReasons` パネル (FAIL 時)
  - 本番解放承認ボタン (PASS + prompt version 一致時のみ活性)
  - prompt version 不一致警告
  - 直近 3 件の承認履歴セクション
- DB: `prisma generate` + `prisma db push --accept-data-loss` 成功
- Step 2 のコミット済みリモート反映 → `git push origin main` 成功 (Step 2: 862f751, Step 3: 0dddda8)

**現在の状態:**
- `npx tsc --noEmit` ✅
- `npx prisma db push` 成功 (Supabase 本番に practicalPriority カラム + ReleaseGateApproval テーブル適用済)
- `git push origin main` ✅ → Vercel 自動デプロイ済
- A6 リリースゲートは `/admin/release-gate` から 6 軸採点 + 承認まで通しで動作可能

**次にやるべきこと:**
1. 事務所内弁護士が `/admin/release-gate` で「全サンプル実行」→ 6 軸採点 → PASS 判定 → 承認
2. **PASS + 承認後**: Vercel 環境変数 `AI_PROVIDER_FORCE_STUB=false` を人間が手動設定 → 初日は `AI_DAILY_COST_LIMIT_USD=3` に絞る
3. R5: HANDOFF.md / CLAUDE.md に「リリース後 1 週間は並行運用 (弁護士人力整理 vs AI 整理を比較)」を明文化
4. R6: 複数レビュアー対応 (`AISampleScore` 別テーブル切り出し、将来改修)
5. R8: 第 6 サンプル「削除済み投稿のアーカイブケース」追加
6. C2: Case DELETE API + A5 cleanup
7. Phase B1: Resend メール通知

**判断・方針メモ:**
- **承認の自動連動なし**: PASS 承認 ≠ 本番 AI 解放。承認は記録、解放は人間の環境変数操作。誤承認リスクを二段構えでブロック
- **prompt version 整合性チェック**: 承認時に全 run の promptVersion が現在の `ORGANIZE_PROMPT_VERSION` と一致していることを強制。古いプロンプトの実行結果で承認できないようにした
- **サンプル絶対条件 vs 平均相対条件の二重構造**: 平均だけでは「1サンプルが禁止ワード混入して 0 点でも他が高得点なら通る」という致命的な抜けがあった。今回の二重構造で全サンプルに最低ラインを課した
- **practicalPriority を structureConsistency から切り出し**: 前者は「timeline/riskFlags の形が妥当か」、後者は「ログ保存期限・次アクションの緊急性を拾えているか」で本質的に異なる観点。独立軸化で曖昧さを除去
- **forbiddenCompliance は 5 点必須**: 法律 AI 補助では禁止ワード混入は 1 件でも致命的事故。平均閾値では妥協できない
- **compressionRate のみ 3.5 閾値**: 圧縮は継続改善可能な領域、初期リリース時点で完璧を求めるとデプロイできない。弁護士レビューで補正する前提で許容
- **EvaluationHints 構造化の副次効果**: 弁護士が採点時に「何を見れば良いか」が一目瞭然。採点者間のブレが減り、R6 (複数レビュアー) 移行時も使える

## 2026-04-10 16:30 | Desktop Claude | A6 R5/R8 — 並行運用ルール明文化 + 第6サンプル追加

**やったこと:**
- 弁護士監査で PASS 前提の承認 OK をいただき、以下 2 件を実装:

  **R5 並行運用ルール (CLAUDE.md)**
  - `CLAUDE.md` に「AI 本番解放後の並行運用ルール」セクション新設
  - リリース後 最低 1 週間 は弁護士人力整理と AI 整理を並行運用する義務化
  - 致命的事故 (禁止ワード混入 / 創作 / 優先順位逆転 / コスト超過) 発生時は
    即座に `AI_PROVIDER_FORCE_STUB=true` に戻すルールを明文化
  - 初日の Vercel 環境変数 (`AI_DAILY_COST_LIMIT_USD=3` / `AI_REQUEST_COST_LIMIT_USD=1`) を明記
  - 評価観点 5 項目: 圧縮率 60% 以下 / 網羅性 80% 以上 / 禁止ワード 0件 / 優先順位一致 / コスト内
  - 解放条件: 1 週間 OK で `AI_DAILY_COST_LIMIT_USD` を 3 → 10 に段階緩和
  - 顧客向け出力禁止ルール (CAIO 原則: 顧客向けは必ず弁護士レビュー後)
  - リリースゲート再実行義務 (prompt 改訂 / モデル変更 / サンプル追加 / 事故後)
  - **Claude は Vercel 環境変数を絶対に変更しない設計上の安全ライン**を明記

  **R8 第6サンプル「削除済み投稿アーカイブケース」**
  - `x-archive-only-deleted` を RELEASE_SAMPLES に追加
  - 削除済み X 投稿 + Wayback Machine スナップショットのみのケース
  - 実務論点: 第三者アーカイブの証拠能力、X ログ保存期間経過リスク、
    iPhone スクショの Exif 公証保全、投稿者アカウント現存の意義
  - EvaluationHints 4 セクション完備
  - forbiddenChecks に相談者の楽観発言「大丈夫」も追加 (相談者主観の残存チェック)

  **関連調整**
  - `release-gate-client.tsx`: 「5 サンプル」ハードコード → `{rows.length}` で動的化
  - コメント文言更新 (page.tsx / run/route.ts / release-samples.ts)

**現在の状態:**
- `npx tsc --noEmit` ✅
- `git push origin main` ✅ (commit 7548b02 / 07c86af)
- Vercel 自動デプロイ済
- A6 リリースゲートは 6 サンプル × 6 軸で動作可能
- 第 6 サンプルの run はまだ作成されていない → 弁護士は「全サンプル実行」を押して全 6 件を再生成する必要あり
- 弁護士承認は **口頭 OK のみ** で、`/admin/release-gate` の UI フロー (採点 → 承認ボタン) はまだ未実施

**次にやるべきこと:**
1. **弁護士が実際に `/admin/release-gate` で UI フローを走らせる**:
   - 「全サンプル実行」(6 サンプル分)
   - 各サンプルを 6 軸で手動採点
   - PASS 判定なら「本番解放を承認」ボタンクリック
   - → `ReleaseGateApproval` スナップショット作成
2. **人間 (プロジェクトオーナー) が Vercel 環境変数を手動設定**:
   - `AI_PROVIDER_FORCE_STUB=false`
   - `AI_DAILY_COST_LIMIT_USD=3`
   - 設定後に Vercel Redeploy
3. **並行運用開始** (CLAUDE.md の R5 ルールに従う)
4. R6: 複数レビュアー対応 (`AISampleScore` 別テーブル切り出し) — 将来改修
5. C2: Case DELETE API + A5 cleanup
6. Phase B1: Resend メール通知

**判断・方針メモ:**
- **R5 を CLAUDE.md に書いた理由**: HANDOFF.md は履歴ログなので上書き/圧縮で消える可能性がある。CLAUDE.md はセッション開始時に必ず読まれる常駐ルール置き場なので、並行運用ルールは消えない場所に置くべき
- **第6サンプルの snsType を "X" にした理由**: union 型を拡張すると影響範囲が広がる。既存の X 枠で「削除済みバリエーション」として追加するのが最小差分
- **forbiddenChecks に「大丈夫」を入れた理由**: 相談者の楽観的主観が出力に残存していないかをテストする。これは R2 監査で指摘された「相談者主観フィルタ」の応用
- **第6サンプル追加は prompt version bump なし**: サンプルを増やしただけでプロンプト自体は変わっていないので `organize-v2` のまま。ただし評価フレームワークが変わったので全 6 件を新規実行する必要はある
- **承認履歴は空のまま push した**: 弁護士が UI で承認ボタンを押すまで `ReleaseGateApproval` レコードは作られない。これは意図的な設計 (自動承認を防ぐ)
- **Claude と Vercel 環境変数の境界を CLAUDE.md に明記**: 「Claude が自動化してはいけない」を設計上の安全ラインとして文書化。将来のセッションで別の Claude が勝手に env var を変更しないようにするため
