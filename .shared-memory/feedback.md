# User Feedback

## 作業スタイル
- セッション間の引き継ぎを最重視する（HANDOFF.md + 共有メモリを必ず更新・push）
- 重要な作業は Telegram 通知で外出先からも確認できるようにする

## 技術方針
- NextAuth v5 は「設定省略できる」系の判断を避け、URL や secret は必ず明示する
- Windows 環境で Next.js 16 の `--prebuilt` deploy は symlink 問題があるため避ける → `vercel --prod` を使う
- git config は永続変更しない（`git -c` で一時 override する）
