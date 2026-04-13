@AGENTS.md

# 作業環境

**VPS (160.251.137.47) が作業の中心**。どのPCからでもSSHでVPSに入り、同じ環境で作業する。
- プロジェクトパス: `~/disclosure-request/disclosure-request/`
- .env はVPS上にのみ存在（gitには含まない）
- Claude Code CLI インストール済み
- node_modules / Prisma Client セットアップ済み

ツール操作はオートパイロット（auto-accept）だが、**以下は必ず人間に確認してから実行する**:
- 設計方針の変更・大きなリファクタリング
- 環境変数の変更（特に AI_PROVIDER_FORCE_STUB 等のセーフティ系）
- 本番デプロイ（`vercel --prod` / `git push`）
- 外部サービスへの操作（DB マイグレーション、Vercel 設定変更等）
- 費用が発生する操作
- 判断に迷う場面すべて

ローカルPC上で直接作業する場合も、VPS上で作業する場合も、以下のハンドオフルールを守ること。

# セッション間ハンドオフルール

このプロジェクトは複数のClaude Codeセッション（デスクトップアプリ、VPS上CLI、Telegram経由CLI等）から操作される。
作業経緯の共有のため、以下のルールを**必ず**守ること。

## セッション開始時（必須・省略不可）
1. `git pull origin main` を実行し、他PCからの変更を取り込む
2. `HANDOFF.md` を読み、前回までの経緯・状態・方針を把握する
3. `.shared-memory/` ディレクトリ内のファイルを読み、ユーザー情報・プロジェクト方針・フィードバックを把握する
4. 把握した内容に基づいて作業を開始する

## 作業中
- 重要な判断（設計方針の変更、ライブラリ選定、問題の発見など）があればメモしておく
- ユーザーの好み・方針・フィードバックを学んだら `.shared-memory/` に記録する（後述）

## セッション終了時・区切りがついた時（必須・省略不可）
1. `HANDOFF.md` の末尾に以下の形式でエントリを追記する:

```
## YYYY-MM-DD HH:MM | セッション種別 | 作業タイトル

**やったこと:**
- 箇条書きで簡潔に

**現在の状態:**
- ビルド可能か、dev serverの状態、未解決エラーなど

**次にやるべきこと:**
- 未完了タスク、次のステップ

**判断・方針メモ:**
- なぜその方法を選んだか、注意点など（あれば）
```

2. エントリが10件を超えたら、古いものを要約して圧縮する（最新5件は残す）
3. 変更を git commit + push する（**これを忘れると他PCで引き継げない**）:
   ```
   git add HANDOFF.md .shared-memory/
   git commit -m "handoff: <作業タイトル>"
   git push origin main
   ```
4. ユーザーに「push 完了、他のPCから引き継ぎ可能です」と伝える

## 共有メモリ (.shared-memory/)

ローカルの Claude Code メモリ (`~/.claude/projects/.../memory/`) は PC ごとに独立しており、
他の PC からは参照できない。**PC をまたいで保持すべき情報**は `.shared-memory/` に保存する。

### 保存すべき内容
- **user.md** — ユーザーの役割・好み・知識レベル
- **project.md** — プロジェクトの目的・現フェーズ・重要な方針決定
- **feedback.md** — ユーザーからの作業スタイルに関するフィードバック
- **references.md** — 外部システムへのポインタ（Vercel URL、DB接続先など）

### ルール
- 新しい情報を学んだら、対応するファイルに追記・更新する
- git に追跡されるので、セッション終了時の commit/push に含める
- 機密情報（APIキー、パスワード）は絶対に書かない

## Telegram通知
外出先からの確認用に、作業サマリーをTelegramに送信できる。
求められた場合、以下のAPIで送信する:

```
POST https://api.telegram.org/bot8026802092:AAG80vxVzaQmzWsW4QhIfrV-WeC5kuDMxsI/sendMessage
Body: { "chat_id": "872352073", "text": "..." }
```

---

# AI 本番解放後の並行運用ルール (R5 / 2026-04-10)

A6 リリースゲートが PASS + `ReleaseGateApproval` スナップショット記録 + Vercel 環境変数
`AI_PROVIDER_FORCE_STUB=false` 設定後、**必ず最低 1 週間**は以下の並行運用を行うこと。
このルールは Claude Code セッションからの提案・実装にも適用される安全ラインである。

## 並行運用ルール

1. **全ての相談に対して、まず弁護士が人力で整理を行う**（AI を見る前）
2. **同じ相談に対して AI 整理も実行する** (`AIOrganizeResult`)
3. 弁護士整理と AI 整理の差分を運用ログに記録する
   - 差分記録先: `HANDOFF.md` の「並行運用ログ」セクション、または別ファイル
4. 以下のいずれかが 1 件でも発生したら**即座に `AI_PROVIDER_FORCE_STUB=true` に戻す**:
   - AI 出力に禁止ワードが混入（strip 漏れ）
   - AI 出力が相談内容から逸脱（創作・事実捏造）
   - AI 出力が弁護士整理と致命的に齟齬（特に優先順位・緊急性の逆転）
   - `AI_DAILY_COST_LIMIT_USD` 超過による自動停止
   - レスポンス時間が継続的に 10 秒超

## 初日設定 (Vercel 環境変数)

人間 (プロジェクトオーナー) が手動設定する:

```
AI_PROVIDER_FORCE_STUB=false
AI_DAILY_COST_LIMIT_USD=3      # 初日は絞る
AI_REQUEST_COST_LIMIT_USD=1    # 1リクエストあたり
```

**Claude はこれらの環境変数を絶対に変更しない**。設計上、本番 AI の解放は
人間の手動操作でのみ行われる。Claude が自動化してはいけない。

## リリースゲート専用バイパス (推奨経路)

リリースゲートで本物 AI を採点するために `AI_PROVIDER_FORCE_STUB=false` を
全体設定してしまうと、採点が終わる前に `/consultations` 等のエンドポイントでも
本物 AI が叩けてしまう。これを避けるため、専用バイパスフラグを用意している:

```
AI_PROVIDER_FORCE_STUB=true           # 全体は Stub のまま
AI_RELEASE_GATE_USE_REAL=true         # リリースゲートだけ本物
ANTHROPIC_API_KEY=sk-ant-...          # 本物呼び出しに必須
AI_DAILY_COST_LIMIT_USD=3
AI_REQUEST_COST_LIMIT_USD=1
```

この設定で `/api/admin/release-gate/run` のみが本物の Anthropic を呼び、
他のエンドポイントは引き続き Stub 応答を返す。cost guard は通常通り適用される。

`AI_RELEASE_GATE_USE_REAL=true` が有効な状態でリリースゲートを実行すると、
`AppLog` に `category="ai_safety" / message="release_gate: forceReal mode activated"`
の audit エントリが自動記録される。

## 解放の二段階

1. **ゲート採点フェーズ**: `AI_PROVIDER_FORCE_STUB=true` + `AI_RELEASE_GATE_USE_REAL=true`
   - 本物 AI は release-gate だけ
   - 何度でもプロンプト改訂 → 再実行 → 採点のループが可能
   - `/consultations` は Stub のままなので顧客向けに事故が出ない

2. **並行運用フェーズ**: ゲート承認後に `AI_PROVIDER_FORCE_STUB=false`
   - このタイミングで初めて `/consultations` 等で本物 AI が動く
   - `AI_RELEASE_GATE_USE_REAL` はもう不要だが、残しても害はない
   - R5 並行運用ルールに従って 1 週間監視

## 評価観点 (並行運用 1 週間)

| 観点 | 合格条件 |
|---|---|
| 圧縮率 | AI 整理の文字数が弁護士整理の 60% 以下 |
| 網羅性 | 弁護士が拾った論点の 80% 以上を AI も拾う |
| 禁止ワード遵守 | 1 週間を通じて 1 件も混入しない |
| 実務優先順位 | 緊急性判断が弁護士と実質一致 |
| コスト | 日次 $3 以内、1req $0.3 以内 |

## 解放条件 (並行運用卒業)

1 週間で上記全て OK であれば:
- `AI_DAILY_COST_LIMIT_USD` を 3 → 10 に段階緩和
- 全相談で AI 整理を「弁護士参考資料」として正式運用開始
- ただし **AI 出力は顧客に直接返さない**（CAIO 原則: 顧客向けは必ず弁護士レビュー後）

## リリースゲートの再実行義務

以下のケースは必ず A6 リリースゲートを再実行 (6軸採点 + ReleaseGateApproval 再作成):

- `ORGANIZE_PROMPT_VERSION` bump 時（プロンプト改訂）
- AI プロバイダ (Anthropic のモデル) 変更時
- 新しいサンプルが RELEASE_SAMPLES に追加された時
- 並行運用中に致命的事故が発生し、原因修正後に再解放する時

**リリースゲートは廃止しない**。将来的に「毎月自動再実行 → 人間承認」のような
運用ケイデンスに昇格する可能性あり。

