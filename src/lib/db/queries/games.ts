import { prisma } from "@/lib/db/prisma";

export interface GameScore {
  id: string;
  gameId: string;
  userId: string;
  displayName: string;
  points: number;
}

export interface GameWithScores {
  id: string;
  gameNumber: number;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
  scores: GameScore[];
}

/**
 * セクションのゲーム一覧をスコア付きで取得する
 */
export async function getGamesWithScores(
  sectionId: string,
): Promise<GameWithScores[]> {
  const games = await prisma.game.findMany({
    where: { sectionId },
    orderBy: { gameNumber: "asc" },
    include: {
      scores: {
        include: {
          user: {
            select: { displayName: true },
          },
        },
      },
    },
  });

  return games.map((game) => ({
    id: game.id,
    gameNumber: game.gameNumber,
    sectionId: game.sectionId,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
    scores: game.scores.map((score) => ({
      id: score.id,
      gameId: score.gameId,
      userId: score.userId,
      displayName: score.user?.displayName ?? "不明",
      points: score.points,
    })),
  }));
}

/**
 * 特定のゲームをスコア付きで取得する
 */
export async function getGameWithScores(
  gameId: string,
): Promise<GameWithScores | null> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      scores: {
        include: {
          user: {
            select: { displayName: true },
          },
        },
      },
    },
  });

  if (!game) {
    return null;
  }

  return {
    id: game.id,
    gameNumber: game.gameNumber,
    sectionId: game.sectionId,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
    scores: game.scores.map((score) => ({
      id: score.id,
      gameId: score.gameId,
      userId: score.userId,
      displayName: score.user?.displayName ?? "不明",
      points: score.points,
    })),
  };
}

/**
 * セクションの次のゲーム番号を取得する
 */
export async function getNextGameNumber(sectionId: string): Promise<number> {
  const lastGame = await prisma.game.findFirst({
    where: { sectionId },
    orderBy: { gameNumber: "desc" },
    select: { gameNumber: true },
  });

  return (lastGame?.gameNumber ?? 0) + 1;
}
