# External References

## VPS (作業の中心環境)
- **IP**: 160.251.137.47
- **ユーザー**: root
- **プロジェクトパス**: ~/disclosure-request/disclosure-request/
- **Claude Code CLI**: インストール済み (v2.1.104)
- **接続方法**: どのPCからでも `ssh root@160.251.137.47` → `cd ~/disclosure-request/disclosure-request` → `claude`
- .env はVPS上にのみ存在（gitには含まない）

## Vercel
- **Dashboard**: https://vercel.com/lawcorpaura-4238s-projects/auralaw-disclosure
- **本番URL**: https://auralaw-disclosure-two.vercel.app
- **旧project** (lexxtec2306): prj_yenOC0snl7NoSYtuSUQBFlfFdRIG — 安定動作確認後に削除予定

## Telegram Bot
- **Bot**: @AuraCode2026Bot
- **Chat ID**: 872352073
- サマリー送信用（CLAUDE.md に API 記載）

## 主要サービス
- **DB**: Supabase (Prisma)
- **Redis**: Upstash (rate limit / cost guard)
- **Email**: Resend (Phase B1 で本格利用予定)
- **AI**: Anthropic API (通常API、cost guard 付き)
