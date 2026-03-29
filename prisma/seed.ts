import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Remove old test accounts if they exist
  await prisma.user.deleteMany({
    where: { email: { in: ["admin@example.com", "staff@example.com"] } },
  });

  const admin = await prisma.user.upsert({
    where: { email: "info@auralaw.jp" },
    update: { hashedPassword: hashSync("AURA2026@Disclosure#Law", 10) },
    create: {
      email: "info@auralaw.jp",
      hashedPassword: hashSync("AURA2026@Disclosure#Law", 10),
      name: "AURA管理者",
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@auralaw.jp" },
    update: {},
    create: {
      email: "staff@auralaw.jp",
      hashedPassword: hashSync("AURA2026@Staff#Law", 10),
      name: "スタッフ",
      role: "STAFF",
    },
  });

  const consultation1 = await prisma.consultation.create({
    data: {
      name: "山田 太郎",
      email: "yamada@example.com",
      phone: "090-1234-5678",
      snsType: "X",
      content:
        "Xで誹謗中傷を受けています。匿名アカウントから繰り返し攻撃的な投稿をされており、発信者の特定を希望します。",
      status: "NEW",
    },
  });

  const consultation2 = await prisma.consultation.create({
    data: {
      name: "佐藤 花子",
      email: "sato@example.com",
      phone: "080-9876-5432",
      snsType: "INSTAGRAM",
      content:
        "Instagramで個人情報を晒されました。投稿者を特定して法的措置を取りたいです。",
      status: "IN_PROGRESS",
      memo: "初回相談完了。被害状況のスクリーンショット確認済み。",
    },
  });

  const sampleCase = await prisma.case.create({
    data: {
      clientName: "鈴木 一郎",
      snsType: "FIVECH",
      status: "DISCLOSURE_REQUESTED",
      description:
        "5ちゃんねるでの名誉毀損投稿に対する発信者情報開示請求",
      consultationId: consultation2.id,
    },
  });

  await prisma.caseTimeline.createMany({
    data: [
      {
        caseId: sampleCase.id,
        title: "受任",
        description: "委任契約締結",
        date: new Date("2026-03-01"),
        isVisibleToClient: true,
      },
      {
        caseId: sampleCase.id,
        title: "仮処分申立",
        description: "東京地方裁判所に発信者情報開示の仮処分を申立",
        date: new Date("2026-03-10"),
        isVisibleToClient: true,
      },
      {
        caseId: sampleCase.id,
        title: "開示請求中",
        description: "プロバイダに対して発信者情報の開示を請求",
        date: new Date("2026-03-20"),
        isVisibleToClient: true,
      },
    ],
  });

  // Document templates
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

  console.log("Seed completed:", { admin: admin.email, staff: staff.email });
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
