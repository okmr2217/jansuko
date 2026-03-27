import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 シーディングを開始します...");

  // 既存データがあればスキップ
  const existingUserCount = await prisma.user.count();
  if (existingUserCount > 0) {
    console.log(`  ⏭️  スキップ（既存ユーザー ${existingUserCount} 件）`);
    console.log("✨ シード完了（既存データをスキップ）");
    return;
  }

  // ユーザーを作成
  const passwordHash = await hash("password", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        displayName: "山田太郎",
        passwordHash,
        isAdmin: true,
      },
    }),
    prisma.user.create({
      data: {
        displayName: "佐藤花子",
        passwordHash,
        isAdmin: false,
      },
    }),
    prisma.user.create({
      data: {
        displayName: "鈴木一郎",
        passwordHash,
        isAdmin: false,
      },
    }),
    prisma.user.create({
      data: {
        displayName: "田中美咲",
        passwordHash,
        isAdmin: false,
      },
    }),
  ]);

  console.log(`✓ ${users.length}人のユーザーを作成しました`);

  // 終了済みセクションを作成（統計用）
  const closedSection = await prisma.section.create({
    data: {
      name: "1月新年会",
      startingPoints: 25000,
      returnPoints: 30000,
      rate: 50,
      playerCount: 4,
      status: "closed",
      createdBy: users[0].id,
      closedAt: new Date("2025-01-10"),
      participants: {
        create: users.map((user) => ({
          userId: user.id,
        })),
      },
    },
  });

  // 終了済みセクションにゲームを追加
  const games = await Promise.all([
    prisma.game.create({
      data: {
        sectionId: closedSection.id,
        gameNumber: 1,
        scores: {
          create: [
            { userId: users[0].id, points: 45000 },
            { userId: users[1].id, points: 32000 },
            { userId: users[2].id, points: 15000 },
            { userId: users[3].id, points: 8000 },
          ],
        },
      },
    }),
    prisma.game.create({
      data: {
        sectionId: closedSection.id,
        gameNumber: 2,
        scores: {
          create: [
            { userId: users[0].id, points: 28000 },
            { userId: users[1].id, points: 38000 },
            { userId: users[2].id, points: 22000 },
            { userId: users[3].id, points: 12000 },
          ],
        },
      },
    }),
    prisma.game.create({
      data: {
        sectionId: closedSection.id,
        gameNumber: 3,
        scores: {
          create: [
            { userId: users[0].id, points: 18000 },
            { userId: users[1].id, points: 25000 },
            { userId: users[2].id, points: 42000 },
            { userId: users[3].id, points: 15000 },
          ],
        },
      },
    }),
  ]);

  console.log(
    `✓ 終了済みセクション「${closedSection.name}」に${games.length}ゲームを作成しました`
  );

  // 進行中セクションを作成
  const activeSection = await prisma.section.create({
    data: {
      name: "1月定例会",
      startingPoints: 25000,
      returnPoints: 30000,
      rate: 50,
      playerCount: 4,
      status: "active",
      createdBy: users[0].id,
      participants: {
        create: users.map((user) => ({
          userId: user.id,
        })),
      },
    },
  });

  // 進行中セクションにゲームを追加
  await prisma.game.create({
    data: {
      sectionId: activeSection.id,
      gameNumber: 1,
      scores: {
        create: [
          { userId: users[0].id, points: 35000 },
          { userId: users[1].id, points: 28000 },
          { userId: users[2].id, points: 22000 },
          { userId: users[3].id, points: 15000 },
        ],
      },
    },
  });

  console.log(`✓ 進行中セクション「${activeSection.name}」を作成しました`);

  // 3人麻雀のセクションを作成
  const sanmaSection = await prisma.section.create({
    data: {
      name: "サンマ練習会",
      startingPoints: 35000,
      returnPoints: 40000,
      rate: 100,
      playerCount: 3,
      status: "active",
      createdBy: users[1].id,
      participants: {
        create: [
          { userId: users[0].id },
          { userId: users[1].id },
          { userId: users[2].id },
        ],
      },
    },
  });

  console.log(`✓ 3人麻雀セクション「${sanmaSection.name}」を作成しました`);

  console.log("\n🎉 シーディングが完了しました！");
  console.log("\nログイン情報:");
  console.log("  管理者: 山田太郎 / password");
  console.log("  一般: 佐藤花子, 鈴木一郎, 田中美咲 / password");
}

main()
  .catch((e) => {
    console.error("❌ シーディングエラー:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
