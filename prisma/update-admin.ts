/**
 * 管理者アカウントを更新するスクリプト
 * 実行: npx tsx prisma/update-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 旧テストアカウント削除
  const deleted = await prisma.user.deleteMany({
    where: { email: { in: ["admin@example.com", "staff@example.com"] } },
  });
  if (deleted.count > 0) {
    console.log(`旧テストアカウント ${deleted.count}件を削除しました`);
  }

  // 管理者アカウント更新
  const admin = await prisma.user.upsert({
    where: { email: "info@auralaw.jp" },
    update: {
      hashedPassword: hashSync("AURA2026@Disclosure#Law", 10),
      name: "AURA管理者",
      role: "ADMIN",
    },
    create: {
      email: "info@auralaw.jp",
      hashedPassword: hashSync("AURA2026@Disclosure#Law", 10),
      name: "AURA管理者",
      role: "ADMIN",
    },
  });

  console.log("✅ 管理者アカウント更新完了:", admin.email);
  console.log("   Email:", "info@auralaw.jp");
  console.log("   Pass:  AURA2026@Disclosure#Law");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
