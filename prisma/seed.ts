import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  全データ削除中...");

  // 依存関係順に削除（子テーブルから）
  await prisma.caseBilling.deleteMany();
  await prisma.caseTarget.deleteMany();
  await prisma.caseTimeline.deleteMany();
  await prisma.caseMessage.deleteMany();
  await prisma.caseDocument.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.clientInvitation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.case.deleteMany();
  await prisma.consultationFile.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.user.deleteMany();
  // DocumentTemplate は残す（upsertで管理）
  // AppLog は残す

  console.log("✅ 全データ削除完了");

  // ═══════════════════════════════════════════
  // 1. ユーザー（管理者・スタッフ・クライアント）
  // ═══════════════════════════════════════════
  const admin = await prisma.user.create({
    data: {
      email: "info@auralaw.jp",
      hashedPassword: hashSync("AURA2026@Disclosure#Law", 10),
      name: "AURA管理者",
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@auralaw.jp",
      hashedPassword: hashSync("AURA2026@Staff#Law", 10),
      name: "田中 美咲",
      role: "STAFF",
    },
  });

  // クライアントユーザー（ポータルアクセス用）
  const clientTanaka = await prisma.user.create({
    data: {
      email: "tanaka.yuki@gmail.com",
      hashedPassword: hashSync("Client2026#Tanaka", 10),
      name: "田中 悠希",
      role: "CLIENT",
    },
  });

  const clientSuzuki = await prisma.user.create({
    data: {
      email: "suzuki.kenji@outlook.com",
      hashedPassword: hashSync("Client2026#Suzuki", 10),
      name: "鈴木 健二",
      role: "CLIENT",
    },
  });

  console.log("👤 ユーザー作成完了");

  // ═══════════════════════════════════════════
  // 2. 相談データ（さまざまなステータス・SNSタイプ）
  // ═══════════════════════════════════════════

  // 相談① 新規 — X誹謗中傷（未対応）
  const consul1 = await prisma.consultation.create({
    data: {
      name: "山田 太郎",
      email: "yamada.taro@example.com",
      phone: "090-1234-5678",
      snsType: "X",
      content:
        "Xで匿名アカウントから「詐欺師」「犯罪者」等の誹謗中傷を繰り返し投稿されています。既に50件以上の投稿があり、実名と勤務先も晒されました。早急に発信者を特定し、損害賠償請求したいです。",
      status: "NEW",
    },
  });

  // 相談② 新規 — 5ちゃんねる（未対応）
  const consul2 = await prisma.consultation.create({
    data: {
      name: "高橋 真理子",
      email: "takahashi.m@example.com",
      phone: "080-2345-6789",
      snsType: "FIVECH",
      content:
        "5ちゃんねるの特定スレッドで、私の経営する飲食店について虚偽の口コミ（食中毒が出た等）を繰り返し書かれています。売上が激減しており、投稿の削除と発信者の特定を希望します。",
      status: "NEW",
    },
  });

  // 相談③ 対応中 — Instagram（スタッフが対応開始）
  const consul3 = await prisma.consultation.create({
    data: {
      name: "伊藤 さくら",
      email: "ito.sakura@example.com",
      phone: "070-3456-7890",
      snsType: "INSTAGRAM",
      content:
        "Instagramのストーリーで私の顔写真を無断使用され、性的な加工をされた画像を拡散されています。既にスクリーンショットは保存済みです。投稿者を特定し、慰謝料請求したいです。",
      status: "IN_PROGRESS",
      memo: "初回相談完了。被害スクリーンショット5枚確認済み。画像加工の悪質性が高い。名誉毀損＋肖像権侵害。次回連絡予定：4/3",
    },
  });

  // 相談④ 返信済 — Googleクチコミ
  const consul4 = await prisma.consultation.create({
    data: {
      name: "中村 大輔",
      email: "nakamura.d@example.com",
      snsType: "GOOGLE_REVIEW",
      content:
        "Googleマップの自社クチコミに「社長がセクハラしている」「残業代を払わない」等の虚偽投稿が3件あります。元従業員の嫌がらせと思われます。削除請求と発信者特定を希望します。",
      status: "RESPONDED",
      memo: "メール返信済。Googleの場合は開示命令申立（新制度）を推奨。見積書送付済み。回答待ち。",
    },
  });

  // 相談⑤ 案件化済 — YouTube（→案件に変換される）
  const consul5 = await prisma.consultation.create({
    data: {
      name: "田中 悠希",
      email: "tanaka.yuki@gmail.com",
      phone: "090-5678-1234",
      snsType: "YOUTUBE",
      content:
        "YouTubeの動画コメント欄で、私の本名・住所を晒した上で「前科者」と嘘の投稿をされています。動画のURLは保存済みです。",
      status: "CONVERTED",
      memo: "案件化決定。委任契約済み。",
    },
  });

  // 相談⑥ 案件化済 — 爆サイ（→案件に変換）
  const consul6 = await prisma.consultation.create({
    data: {
      name: "鈴木 健二",
      email: "suzuki.kenji@outlook.com",
      phone: "080-6789-2345",
      snsType: "BAKUSAI",
      content:
        "爆サイの地域掲示板で「鈴木は不倫している」「鈴木の嫁は元風俗嬢」等のプライバシー侵害投稿が複数あります。家族にも被害が及んでおり、早急な対応を希望します。",
      status: "CONVERTED",
      memo: "案件化。複数投稿あり。2件目の案件も受任。",
    },
  });

  // 相談⑦ 終了 — TikTok
  const consul7 = await prisma.consultation.create({
    data: {
      name: "渡辺 美優",
      email: "watanabe.miyu@example.com",
      phone: "070-7890-3456",
      snsType: "TIKTOK",
      content:
        "TikTokで私のダンス動画を無断転載され、侮辱的なコメントを付けて拡散されています。",
      status: "CLOSED",
      memo: "相談のみ。投稿削除済みのため対応不要。本人了承済み。",
    },
  });

  // 相談⑧ 対応中 — ブログ
  const consul8 = await prisma.consultation.create({
    data: {
      name: "小林 翔太",
      email: "kobayashi.s@example.com",
      phone: "090-8901-4567",
      snsType: "BLOG",
      content:
        "個人ブログで私の実名入りの誹謗中傷記事を書かれています。「小林は会社の金を横領した」という完全な虚偽です。検索結果の上位に表示されており、転職活動に支障が出ています。",
      status: "IN_PROGRESS",
      memo: "Whois情報からブログ運営者の特定を試行中。同時に検索結果削除の仮処分も検討。",
    },
  });

  console.log("📋 相談データ作成完了（8件）");

  // ═══════════════════════════════════════════
  // 3. 案件データ（さまざまな進行段階）
  // ═══════════════════════════════════════════

  // ── 案件A: 田中悠希 — YouTube開示請求（進行中・クライアント登録済み）
  const caseA = await prisma.case.create({
    data: {
      clientName: "田中 悠希",
      snsType: "YOUTUBE",
      status: "DISCLOSURE_REQUESTED",
      description:
        "YouTubeコメント欄での名誉毀損。本名・住所晒し＋虚偽の前科情報。開示命令申立（Google）で手続き中。",
      consultationId: consul5.id,
      clientUserId: clientTanaka.id,
    },
  });

  // ── 案件B: 鈴木健二 — 爆サイ①（仮処分申立段階・クライアント登録済み）
  const caseB = await prisma.case.create({
    data: {
      clientName: "鈴木 健二",
      snsType: "BAKUSAI",
      status: "INJUNCTION_FILED",
      description:
        "爆サイ地域掲示板でのプライバシー侵害投稿。不倫に関する虚偽投稿。IP開示仮処分申立中。",
      consultationId: consul6.id,
      clientUserId: clientSuzuki.id,
    },
  });

  // ── 案件C: 鈴木健二 — 爆サイ②（同一クライアントの2件目・別投稿者）
  const caseC = await prisma.case.create({
    data: {
      clientName: "鈴木 健二",
      snsType: "BAKUSAI",
      status: "ACCEPTED",
      description:
        "爆サイ地域掲示板での名誉毀損。「鈴木の嫁は元風俗嬢」投稿。案件Bとは別の投稿者と推定。",
      clientUserId: clientSuzuki.id,
    },
  });

  // ── 案件D: 佐藤一郎 — 5ちゃんねる（開示完了→訴訟提起段階）
  const caseD = await prisma.case.create({
    data: {
      clientName: "佐藤 一郎",
      snsType: "FIVECH",
      status: "LAWSUIT_FILED",
      description:
        "5ちゃんねるでの名誉毀損。発信者特定済み。慰謝料請求訴訟を東京地裁に提起。",
    },
  });

  // ── 案件E: 木村 あかり — X（和解で解決済み）
  const caseE = await prisma.case.create({
    data: {
      clientName: "木村 あかり",
      snsType: "X",
      status: "SETTLED",
      description:
        "Xでの誹謗中傷。発信者を特定後、示談交渉により和解成立。慰謝料80万円で解決。",
    },
  });

  // ── 案件F: 山本 健太 — Instagram（プロバイダ開示請求段階）
  const caseF = await prisma.case.create({
    data: {
      clientName: "山本 健太",
      snsType: "INSTAGRAM",
      status: "PROVIDER_REQUEST",
      description:
        "Instagramストーリーでの名誉毀損。Meta社からIP開示済み。NTTドコモに対し発信者情報開示請求中。",
    },
  });

  // ── 案件G: 松田 恵 — Googleクチコミ（終了）
  const caseG = await prisma.case.create({
    data: {
      clientName: "松田 恵",
      snsType: "GOOGLE_REVIEW",
      status: "CLOSED",
      description:
        "Googleクチコミへの虚偽投稿。削除請求のみ。Google側で削除対応完了。",
    },
  });

  console.log("📁 案件データ作成完了（7件）");

  // ═══════════════════════════════════════════
  // 4. 対象ターゲット（CaseTarget）
  // ═══════════════════════════════════════════

  // 案件A: YouTube — 1ターゲット
  await prisma.caseTarget.create({
    data: {
      caseId: caseA.id,
      snsType: "YOUTUBE",
      url: "https://www.youtube.com/watch?v=XXXXXXXXXX",
      postContent: "「田中悠希は前科者。住所は東京都〇〇区△△…」というコメント",
      status: "PENDING",
      note: "Google開示命令申立中",
    },
  });

  // 案件B: 爆サイ — 2ターゲット（同じスレッドの複数投稿）
  await prisma.caseTarget.create({
    data: {
      caseId: caseB.id,
      snsType: "BAKUSAI",
      url: "https://bakusai.com/thr_res/acode=1/ctgid=104/bid=XXXX/tid=YYYYY/",
      postContent: "「鈴木は不倫している。相手は会社の部下。」",
      status: "DISCLOSED",
      defendant: "NTTドコモ回線利用者",
      note: "IP開示済み。プロバイダ：NTTドコモ",
    },
  });
  await prisma.caseTarget.create({
    data: {
      caseId: caseB.id,
      snsType: "BAKUSAI",
      url: "https://bakusai.com/thr_res/acode=1/ctgid=104/bid=XXXX/tid=YYYYY/",
      postContent: "「鈴木は嫁に暴力振るっている。DV男。」",
      status: "PENDING",
      note: "別IDの投稿。同一人物の可能性あり",
    },
  });

  // 案件C: 爆サイ — 1ターゲット
  await prisma.caseTarget.create({
    data: {
      caseId: caseC.id,
      snsType: "BAKUSAI",
      postContent: "「鈴木の嫁は元風俗嬢。〇〇店で働いていた。」",
      status: "PENDING",
    },
  });

  // 案件D: 5ch — 3ターゲット（発信者特定済み）
  await prisma.caseTarget.create({
    data: {
      caseId: caseD.id,
      snsType: "FIVECH",
      url: "https://egg.5ch.net/test/read.cgi/sns/XXXXXXXXX/",
      postContent: "「佐藤一郎は横領犯。警察に通報済み。」",
      status: "IDENTIFIED",
      defendant: "東京都新宿区 高田 馬場太郎（仮名）",
    },
  });
  await prisma.caseTarget.create({
    data: {
      caseId: caseD.id,
      snsType: "FIVECH",
      url: "https://egg.5ch.net/test/read.cgi/sns/XXXXXXXXX/",
      postContent: "「佐藤の会社はブラック企業。社員はみんな辞めたがっている。」",
      status: "IDENTIFIED",
      defendant: "東京都新宿区 高田 馬場太郎（仮名）",
    },
  });
  await prisma.caseTarget.create({
    data: {
      caseId: caseD.id,
      snsType: "FIVECH",
      url: "https://egg.5ch.net/test/read.cgi/sns/YYYYYYYYY/",
      postContent: "「佐藤一郎は詐欺師。」",
      status: "IDENTIFIED",
      defendant: "埼玉県さいたま市 別の投稿者（仮名）",
      note: "別IPアドレス。2人目の投稿者。",
    },
  });

  // 案件E: X — 解決済み
  await prisma.caseTarget.create({
    data: {
      caseId: caseE.id,
      snsType: "X",
      url: "https://x.com/anonymous_user/status/XXXXXXXXXXXX",
      postContent: "「木村あかりは枕営業で出世した。」",
      status: "SETTLED",
      defendant: "神奈川県横浜市 匿名太郎（仮名）",
    },
  });

  // 案件F: Instagram — IP開示済み
  await prisma.caseTarget.create({
    data: {
      caseId: caseF.id,
      snsType: "INSTAGRAM",
      postContent: "ストーリーで「山本は薬をやっている」と虚偽投稿",
      status: "DISCLOSED",
      note: "Meta社よりIP開示済み。NTTドコモに開示請求中。",
    },
  });

  // 案件G: Google — 削除済み
  await prisma.caseTarget.create({
    data: {
      caseId: caseG.id,
      snsType: "GOOGLE_REVIEW",
      url: "https://maps.google.com/maps?cid=XXXXXXXXXXXXX",
      postContent: "「松田クリニックは診療報酬を不正請求している」",
      status: "SETTLED",
      note: "Google削除対応完了",
    },
  });

  console.log("🎯 ターゲットデータ作成完了");

  // ═══════════════════════════════════════════
  // 5. タイムライン
  // ═══════════════════════════════════════════

  // 案件A: YouTube
  await prisma.caseTimeline.createMany({
    data: [
      {
        caseId: caseA.id,
        title: "受任",
        description: "委任契約締結。着手金入金確認。",
        date: new Date("2026-02-15"),
        isVisibleToClient: true,
      },
      {
        caseId: caseA.id,
        title: "開示命令申立",
        description: "東京地裁にGoogle LLC宛の発信者情報開示命令を申立。",
        date: new Date("2026-02-28"),
        isVisibleToClient: true,
      },
      {
        caseId: caseA.id,
        title: "審尋期日",
        description: "第1回審尋期日（ウェブ期日）。Google側代理人出頭。",
        date: new Date("2026-03-15"),
        isVisibleToClient: true,
      },
    ],
  });

  // 案件B: 爆サイ①
  await prisma.caseTimeline.createMany({
    data: [
      {
        caseId: caseB.id,
        title: "受任",
        description: "委任契約締結。",
        date: new Date("2026-01-20"),
        isVisibleToClient: true,
      },
      {
        caseId: caseB.id,
        title: "IP開示仮処分申立",
        description: "爆サイ運営に対しIPアドレス開示の仮処分を申立。",
        date: new Date("2026-02-01"),
        isVisibleToClient: true,
      },
      {
        caseId: caseB.id,
        title: "IP開示決定",
        description: "裁判所が開示を認める決定。爆サイよりIP開示。",
        date: new Date("2026-02-20"),
        isVisibleToClient: true,
      },
      {
        caseId: caseB.id,
        title: "ログ保存仮処分",
        description: "NTTドコモに対しログ保存仮処分を申立。",
        date: new Date("2026-03-01"),
        isVisibleToClient: true,
      },
      {
        caseId: caseB.id,
        title: "発信者情報開示請求訴訟提起",
        description: "NTTドコモに対し訴訟提起。東京地裁。",
        date: new Date("2026-03-10"),
        isVisibleToClient: true,
      },
      {
        caseId: caseB.id,
        title: "内部メモ：被告側弁護士情報",
        description: "NTTドコモ代理人：〇〇法律事務所。過去の対応パターンから2ヶ月程度で開示見込み。",
        date: new Date("2026-03-12"),
        isVisibleToClient: false,
      },
    ],
  });

  // 案件C: 爆サイ②
  await prisma.caseTimeline.createMany({
    data: [
      {
        caseId: caseC.id,
        title: "受任",
        description: "鈴木健二氏2件目。委任契約締結。",
        date: new Date("2026-03-25"),
        isVisibleToClient: true,
      },
    ],
  });

  // 案件D: 5ch — 訴訟段階
  await prisma.caseTimeline.createMany({
    data: [
      {
        caseId: caseD.id,
        title: "受任",
        description: "委任契約締結。",
        date: new Date("2025-10-01"),
        isVisibleToClient: true,
      },
      {
        caseId: caseD.id,
        title: "IP開示仮処分",
        description: "5ちゃんねる運営に対しIP開示仮処分申立。",
        date: new Date("2025-10-15"),
        isVisibleToClient: true,
      },
      {
        caseId: caseD.id,
        title: "IP開示決定",
        description: "開示決定。3つのIPアドレスが判明。2つのプロバイダ特定。",
        date: new Date("2025-11-10"),
        isVisibleToClient: true,
      },
      {
        caseId: caseD.id,
        title: "発信者情報開示訴訟",
        description: "NTTドコモ・ソフトバンクに対し開示請求訴訟提起。",
        date: new Date("2025-12-01"),
        isVisibleToClient: true,
      },
      {
        caseId: caseD.id,
        title: "発信者特定完了",
        description: "2名の発信者を特定。東京都新宿区と埼玉県さいたま市の居住者。",
        date: new Date("2026-02-01"),
        isVisibleToClient: true,
      },
      {
        caseId: caseD.id,
        title: "慰謝料請求訴訟提起",
        description: "特定した2名に対し、各200万円の損害賠償請求訴訟を東京地裁に提起。",
        date: new Date("2026-03-01"),
        isVisibleToClient: true,
      },
    ],
  });

  // 案件E: X — 和解
  await prisma.caseTimeline.createMany({
    data: [
      {
        caseId: caseE.id,
        title: "受任",
        description: "委任契約締結。",
        date: new Date("2025-08-01"),
        isVisibleToClient: true,
      },
      {
        caseId: caseE.id,
        title: "開示命令申立",
        description: "X Corp宛に開示命令申立。",
        date: new Date("2025-08-20"),
        isVisibleToClient: true,
      },
      {
        caseId: caseE.id,
        title: "発信者特定",
        description: "発信者を特定。神奈川県横浜市在住。",
        date: new Date("2025-11-01"),
        isVisibleToClient: true,
      },
      {
        caseId: caseE.id,
        title: "示談交渉開始",
        description: "内容証明郵便送付。慰謝料100万円を請求。",
        date: new Date("2025-11-15"),
        isVisibleToClient: true,
      },
      {
        caseId: caseE.id,
        title: "和解成立",
        description: "慰謝料80万円で和解成立。投稿削除・今後の投稿禁止条項含む。",
        date: new Date("2026-01-10"),
        isVisibleToClient: true,
      },
    ],
  });

  // 案件F: Instagram
  await prisma.caseTimeline.createMany({
    data: [
      {
        caseId: caseF.id,
        title: "受任",
        description: "委任契約締結。",
        date: new Date("2026-02-01"),
        isVisibleToClient: true,
      },
      {
        caseId: caseF.id,
        title: "Meta社への仮処分申立",
        description: "IP開示の仮処分を申立。",
        date: new Date("2026-02-15"),
        isVisibleToClient: true,
      },
      {
        caseId: caseF.id,
        title: "IP開示",
        description: "Meta社よりIPアドレス開示。プロバイダ：NTTドコモと判明。",
        date: new Date("2026-03-10"),
        isVisibleToClient: true,
      },
      {
        caseId: caseF.id,
        title: "NTTドコモへ開示請求",
        description: "ログ保存仮処分＋発信者情報開示請求訴訟を準備中。",
        date: new Date("2026-03-20"),
        isVisibleToClient: true,
      },
    ],
  });

  // 案件G: Google — 終了
  await prisma.caseTimeline.createMany({
    data: [
      {
        caseId: caseG.id,
        title: "受任",
        description: "Googleクチコミ削除請求のみ。",
        date: new Date("2026-01-05"),
        isVisibleToClient: true,
      },
      {
        caseId: caseG.id,
        title: "削除申請",
        description: "Google Business Profileより削除申請。",
        date: new Date("2026-01-10"),
        isVisibleToClient: true,
      },
      {
        caseId: caseG.id,
        title: "削除完了",
        description: "Google側で削除対応完了。案件終了。",
        date: new Date("2026-02-01"),
        isVisibleToClient: true,
      },
    ],
  });

  console.log("📅 タイムライン作成完了");

  // ═══════════════════════════════════════════
  // 6. メッセージ
  // ═══════════════════════════════════════════

  // 案件A: 田中悠希 — やりとり
  await prisma.caseMessage.createMany({
    data: [
      {
        caseId: caseA.id,
        content: "委任契約書を郵送いたしました。届きましたらご署名・ご捺印の上ご返送ください。",
        isFromClient: false,
        userId: staff.id,
        createdAt: new Date("2026-02-16"),
      },
      {
        caseId: caseA.id,
        content: "受け取りました。記入して明日投函します。",
        isFromClient: true,
        userId: clientTanaka.id,
        createdAt: new Date("2026-02-17"),
      },
      {
        caseId: caseA.id,
        content: "3/15に審尋期日が入りました。ウェブ期日のため、ご出席は不要です。結果は追ってご報告します。",
        isFromClient: false,
        userId: staff.id,
        createdAt: new Date("2026-03-10"),
      },
      {
        caseId: caseA.id,
        content: "承知しました。よろしくお願いします。進捗があれば教えてください。",
        isFromClient: true,
        userId: clientTanaka.id,
        createdAt: new Date("2026-03-10"),
      },
    ],
  });

  // 案件B: 鈴木健二 — やりとり
  await prisma.caseMessage.createMany({
    data: [
      {
        caseId: caseB.id,
        content: "IP開示決定が出ました。NTTドコモの回線と判明しました。次のステップとしてログ保存仮処分を申立てます。",
        isFromClient: false,
        userId: staff.id,
        createdAt: new Date("2026-02-20"),
      },
      {
        caseId: caseB.id,
        content: "ありがとうございます。あと、もう1つ気になる投稿があるのですが、別案件として依頼できますか？",
        isFromClient: true,
        userId: clientSuzuki.id,
        createdAt: new Date("2026-03-20"),
      },
      {
        caseId: caseB.id,
        content: "はい、別の投稿者の可能性がありますので、別案件として受任いたします。詳細をお聞かせください。",
        isFromClient: false,
        userId: staff.id,
        createdAt: new Date("2026-03-21"),
      },
    ],
  });

  console.log("💬 メッセージ作成完了");

  // ═══════════════════════════════════════════
  // 7. 費用データ（CaseBilling）
  // ═══════════════════════════════════════════

  // 案件A: YouTube — Google開示命令
  await prisma.caseBilling.createMany({
    data: [
      {
        caseId: caseA.id,
        feeId: "order_google",
        label: "開示命令申立（Google）",
        amount: 330000,
        status: "PAID",
        isVisibleToClient: true,
        note: "着手金。2/15入金確認済み。",
      },
      {
        caseId: caseA.id,
        feeId: "order_provider_unlimited",
        label: "開示命令申立（接続プロバイダ・投稿数無制限）",
        amount: 220000,
        status: "ESTIMATED",
        isVisibleToClient: true,
        note: "Google開示後、プロバイダ向け手続き費用（予定）",
      },
      {
        caseId: caseA.id,
        feeId: "attendance_web",
        label: "ウェブ期日",
        amount: 0,
        status: "CONFIRMED",
        isVisibleToClient: false,
      },
    ],
  });

  // 案件B: 爆サイ① — 従来型手続き
  await prisma.caseBilling.createMany({
    data: [
      {
        caseId: caseB.id,
        feeId: "individual_ip_injunction",
        label: "IPアドレス開示仮処分",
        amount: 220000,
        status: "PAID",
        isVisibleToClient: true,
        note: "着手金。1/20入金確認済み。",
      },
      {
        caseId: caseB.id,
        feeId: "individual_log_preservation_unlimited",
        label: "ログ保存仮処分（投稿数無制限）",
        amount: 110000,
        status: "PAID",
        isVisibleToClient: true,
      },
      {
        caseId: caseB.id,
        feeId: "individual_disclosure_lawsuit_unlimited",
        label: "住所・氏名等の開示請求訴訟（投稿数無制限）",
        amount: 220000,
        status: "INVOICED",
        isVisibleToClient: true,
        note: "3/10請求書送付済み",
      },
      {
        caseId: caseB.id,
        feeId: "attendance_tokyo",
        label: "東京地裁本庁",
        amount: 10000,
        status: "CONFIRMED",
        isVisibleToClient: false,
        note: "出廷1回分",
      },
    ],
  });

  // 案件C: 爆サイ② — 受任のみ
  await prisma.caseBilling.createMany({
    data: [
      {
        caseId: caseC.id,
        feeId: "individual_ip_injunction",
        label: "IPアドレス開示仮処分",
        amount: 220000,
        status: "ESTIMATED",
        isVisibleToClient: true,
        note: "見積提示済み。入金待ち。",
      },
    ],
  });

  // 案件D: 5ch — 訴訟段階（多数の手続き）
  await prisma.caseBilling.createMany({
    data: [
      {
        caseId: caseD.id,
        feeId: "individual_ip_injunction",
        label: "IPアドレス開示仮処分",
        amount: 220000,
        status: "PAID",
        isVisibleToClient: true,
      },
      {
        caseId: caseD.id,
        feeId: "individual_log_preservation_5posts",
        label: "ログ保存仮処分（5投稿以内）",
        amount: 220000,
        status: "PAID",
        isVisibleToClient: true,
      },
      {
        caseId: caseD.id,
        feeId: "individual_disclosure_lawsuit_5posts",
        label: "住所・氏名等の開示請求訴訟（5投稿以内）",
        amount: 330000,
        status: "PAID",
        isVisibleToClient: true,
      },
      {
        caseId: caseD.id,
        feeId: "damages_plaintiff_5posts",
        label: "慰謝料請求訴訟 原告側（5投稿以内）",
        amount: 330000,
        status: "INVOICED",
        isVisibleToClient: true,
        note: "訴訟提起時に請求。3/1請求書送付。",
      },
      {
        caseId: caseD.id,
        feeId: "attendance_tokyo",
        label: "東京地裁本庁（出廷3回分）",
        amount: 30000,
        status: "CONFIRMED",
        isVisibleToClient: false,
        note: "IP仮処分1回、開示訴訟2回",
      },
    ],
  });

  // 案件E: X — 和解（全額入金済み）
  await prisma.caseBilling.createMany({
    data: [
      {
        caseId: caseE.id,
        feeId: "ident_to_lawsuit_designated",
        label: "投稿者特定から慰謝料請求訴訟まで（X）",
        amount: 440000,
        status: "PAID",
        isVisibleToClient: true,
      },
      {
        caseId: caseE.id,
        feeId: "attendance_web",
        label: "ウェブ期日（2回分）",
        amount: 0,
        status: "PAID",
        isVisibleToClient: false,
      },
    ],
  });

  // 案件F: Instagram — 進行中
  await prisma.caseBilling.createMany({
    data: [
      {
        caseId: caseF.id,
        feeId: "individual_ip_injunction",
        label: "IPアドレス開示仮処分",
        amount: 220000,
        status: "PAID",
        isVisibleToClient: true,
      },
      {
        caseId: caseF.id,
        feeId: "individual_log_preservation_unlimited",
        label: "ログ保存仮処分（投稿数無制限）",
        amount: 110000,
        status: "CONFIRMED",
        isVisibleToClient: true,
        note: "次ステップ。入金後に申立。",
      },
      {
        caseId: caseF.id,
        feeId: "individual_disclosure_lawsuit_unlimited",
        label: "住所・氏名等の開示請求訴訟（投稿数無制限）",
        amount: 220000,
        status: "ESTIMATED",
        isVisibleToClient: true,
        note: "今後の手続き費用（概算）",
      },
    ],
  });

  // 案件G: Google削除のみ
  await prisma.caseBilling.createMany({
    data: [
      {
        caseId: caseG.id,
        feeId: "deletion_site_admin",
        label: "サイト管理者に対する投稿の削除仮処分・訴訟（5投稿以内）",
        amount: 220000,
        status: "PAID",
        isVisibleToClient: true,
      },
    ],
  });

  console.log("💰 費用データ作成完了");

  // ═══════════════════════════════════════════
  // 8. 書類テンプレート
  // ═══════════════════════════════════════════

  await prisma.documentTemplate.upsert({
    where: { id: "tmpl_delegation" },
    update: {},
    create: {
      id: "tmpl_delegation",
      name: "委任状",
      category: "DELEGATION",
      description: "発信者情報開示請求に関する委任状",
      fields: JSON.stringify([
        { key: "clientName", label: "依頼者氏名", type: "text" },
        { key: "clientAddress", label: "依頼者住所", type: "text" },
        { key: "snsType", label: "対象SNS", type: "text" },
        { key: "lawyerName", label: "弁護士名", type: "text", defaultValue: "藤原 洋一" },
        { key: "date", label: "日付", type: "date" },
      ]),
    },
  });

  await prisma.documentTemplate.upsert({
    where: { id: "tmpl_disclosure" },
    update: {},
    create: {
      id: "tmpl_disclosure",
      name: "発信者情報開示請求書",
      category: "DISCLOSURE_REQUEST",
      description: "プロバイダへの発信者情報開示請求書",
      fields: JSON.stringify([
        { key: "clientName", label: "請求者氏名", type: "text" },
        { key: "providerName", label: "プロバイダ名", type: "text" },
        { key: "snsType", label: "対象サイト", type: "text" },
        { key: "targetUrl", label: "対象投稿URL", type: "text" },
        { key: "violatedRight", label: "侵害された権利", type: "text", defaultValue: "名誉権（名誉毀損）" },
        { key: "reason", label: "権利侵害の理由", type: "textarea" },
        { key: "lawyerName", label: "弁護士名", type: "text", defaultValue: "藤原 洋一" },
        { key: "date", label: "日付", type: "date" },
      ]),
    },
  });

  await prisma.documentTemplate.upsert({
    where: { id: "tmpl_notice" },
    update: {},
    create: {
      id: "tmpl_notice",
      name: "通知書",
      category: "NOTICE",
      description: "発信者に対する損害賠償請求の通知書",
      fields: JSON.stringify([
        { key: "clientName", label: "依頼者氏名", type: "text" },
        { key: "recipientName", label: "相手方氏名", type: "text" },
        { key: "snsType", label: "対象SNS", type: "text" },
        { key: "violationType", label: "侵害内容", type: "text", defaultValue: "名誉毀損に該当する投稿" },
        { key: "amount", label: "請求金額（円）", type: "text" },
        { key: "lawyerName", label: "弁護士名", type: "text", defaultValue: "藤原 洋一" },
        { key: "date", label: "日付", type: "date" },
      ]),
    },
  });

  console.log("📄 書類テンプレート作成完了");

  // ═══════════════════════════════════════════
  // 完了サマリ
  // ═══════════════════════════════════════════
  console.log("\n════════════════════════════════════");
  console.log("✅ シードデータ投入完了");
  console.log("════════════════════════════════════");
  console.log("ユーザー:");
  console.log("  管理者: info@auralaw.jp");
  console.log("  スタッフ: staff@auralaw.jp");
  console.log("  クライアント: tanaka.yuki@gmail.com / suzuki.kenji@outlook.com");
  console.log("相談: 8件（新規2/対応中2/返信済1/案件化済2/終了1）");
  console.log("案件: 7件（受任1/仮処分1/プロバイダ請求1/開示請求1/訴訟1/和解1/終了1）");
  console.log("  ※鈴木健二 = 2案件（同一クライアント複数案件）");
  console.log("費用: 各案件に実際の料金表ベースで設定");
  console.log("════════════════════════════════════\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
