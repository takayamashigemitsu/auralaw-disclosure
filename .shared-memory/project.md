# Project Status

## 概要
発信者情報開示請求を弁護士がサポートするためのWebアプリ。
Next.js 16 + Prisma + Supabase + Vercel で構成。

## 現フェーズ (2026-04-13 時点)
- **A6 リリースゲート**: 6サンプル採点 → 承認待ち（ブラウザ操作が必要）
- AI は `AI_PROVIDER_FORCE_STUB=true` + `AI_RELEASE_GATE_USE_REAL=true` で稼働中
- リリースゲート承認後 → Phase B（メール通知、ポータル共有、クライアント招待、QStash）→ Phase C（並行運用、書類自動生成）

## ロードマップ
1. A6 リリースゲート承認
2. Phase C1: AI並行運用開始（1週間監視）
3. Phase B: B1 Resendメール通知 → B2 ポータル共有 → B3 クライアント招待 → B4 QStash+Job
4. Phase C2: docx-templates で書類自動生成

## 本番環境
- **Vercel team**: lawcorpaura-4238s-projects
- **URL**: https://auralaw-disclosure-two.vercel.app
- **DB**: Supabase (Prisma経由)
- **Redis**: Upstash (rate limit, cost guard)
- **サイトパスワード**: /gate で保護中

## 重要方針
- CAIO原則: AI出力は顧客に直接返さない（弁護士レビュー後のみ）
- 「AIで判断するな、AIで圧縮しろ」
- 環境変数の変更は人間のみが行う（Claudeは自動化しない）
- リリースゲートは廃止しない（将来的に月次自動再実行に昇格の可能性）
