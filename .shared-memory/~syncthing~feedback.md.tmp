# User Feedback

## 最重要方針
- **重要な判断は必ず人間（プロジェクトオーナー）に確認する。** オートパイロットはツール操作の自動承認であり、意思決定の自動化ではない
- **どのPCからでも同じように操作ができること。シームレスに続きができること。**
- VPSを中心環境とし、SSHで入ればどのPCからでも同じ状態で作業できる
- セッション間の引き継ぎを最重視する（HANDOFF.md + 共有メモリを必ず更新・push）
- 重要な作業は Telegram 通知で外出先からも確認できるようにする

## 技術方針
- NextAuth v5 は「設定省略できる」系の判断を避け、URL や secret は必ず明示する
- Windows 環境で Next.js 16 の `--prebuilt` deploy は symlink 問題があるため避ける → `vercel --prod` を使う
- git config は永続変更しない（`git -c` で一時 override する）
