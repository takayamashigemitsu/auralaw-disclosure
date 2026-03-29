import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      hashedPassword: hashSync("admin123", 10),
      name: "管理者",
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@example.com" },
    update: {},
    create: {
      email: "staff@example.com",
      hashedPassword: hashSync("staff123", 10),
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
