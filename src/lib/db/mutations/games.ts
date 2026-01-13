import { prisma } from "@/lib/db/prisma";
import { getNextGameNumber } from "@/lib/db/queries/games";

export interface ScoreInput {
  userId: string;
  points: number;
}

export interface CreateGameInput {
  sectionId: string;
  scores: ScoreInput[];
}

export interface UpdateGameInput {
  scores: ScoreInput[];
}

/**
 * 新しいゲームとスコアを作成する
 */
export async function createGame(input: CreateGameInput): Promise<string> {
  // 次のゲーム番号を取得
  const gameNumber = await getNextGameNumber(input.sectionId);

  return prisma.$transaction(async (tx) => {
    // ゲームを作成
    const game = await tx.game.create({
      data: {
        sectionId: input.sectionId,
        gameNumber,
      },
      select: { id: true },
    });

    // スコアを追加
    await tx.score.createMany({
      data: input.scores.map((score) => ({
        gameId: game.id,
        userId: score.userId,
        points: score.points,
      })),
    });

    return game.id;
  });
}

/**
 * ゲームのスコアを更新する
 */
export async function updateGameScores(
  gameId: string,
  input: UpdateGameInput,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 既存のスコアを削除
    await tx.score.deleteMany({
      where: { gameId },
    });

    // 新しいスコアを追加
    await tx.score.createMany({
      data: input.scores.map((score) => ({
        gameId,
        userId: score.userId,
        points: score.points,
      })),
    });
  });
}

/**
 * ゲームを削除する
 */
export async function deleteGame(gameId: string): Promise<void> {
  // scoresはCASCADEで削除される
  await prisma.game.delete({
    where: { id: gameId },
  });
}
