import { prisma } from "@/lib/db/prisma";
import { SectionStatus } from "@/generated/prisma/client";
import { GameWithScores } from "./games";

export type { SectionStatus };

export interface SectionParticipant {
  id: string;
  userId: string;
  displayName: string;
}

export interface SectionListItem {
  id: string;
  name: string;
  startingPoints: number;
  returnPoints: number;
  rate: number;
  playerCount: number;
  status: SectionStatus;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: Date;
  closedAt: Date | null;
  participants: SectionParticipant[];
  gameCount?: number;
  games?: GameWithScores[];
}

export interface GetSectionsOptions {
  status?: SectionStatus;
  search?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * セクション一覧を取得する
 */
export async function getSections(
  options: GetSectionsOptions = {},
): Promise<SectionListItem[]> {
  const { status, search, sortOrder = "desc" } = options;

  const sections = await prisma.section.findMany({
    where: {
      deletedAt: null,
      ...(status && { status }),
      ...(search && { name: { contains: search, mode: "insensitive" } }),
    },
    orderBy: { createdAt: sortOrder },
    include: {
      creator: {
        select: { displayName: true },
      },
      participants: {
        include: {
          user: {
            select: { displayName: true },
          },
        },
      },
      games: {
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
      },
    },
  });

  return sections.map((section) => ({
    id: section.id,
    name: section.name,
    startingPoints: section.startingPoints,
    returnPoints: section.returnPoints,
    rate: section.rate,
    playerCount: section.playerCount,
    status: section.status,
    createdBy: section.createdBy,
    createdByName: section.creator?.displayName ?? null,
    createdAt: section.createdAt,
    closedAt: section.closedAt,
    participants: section.participants.map((p) => ({
      id: p.id,
      userId: p.userId,
      displayName: p.user?.displayName ?? "不明",
    })),
    games: section.games.map((game) => ({
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
    })),
  }));
}

/**
 * 特定のセクションを取得する
 */
export async function getSection(id: string): Promise<SectionListItem | null> {
  const section = await prisma.section.findFirst({
    where: { id, deletedAt: null },
    include: {
      creator: {
        select: { displayName: true },
      },
      participants: {
        include: {
          user: {
            select: { displayName: true },
          },
        },
      },
      _count: {
        select: { games: true },
      },
    },
  });

  if (!section) {
    return null;
  }

  return {
    id: section.id,
    name: section.name,
    startingPoints: section.startingPoints,
    returnPoints: section.returnPoints,
    rate: section.rate,
    playerCount: section.playerCount,
    status: section.status,
    createdBy: section.createdBy,
    createdByName: section.creator?.displayName ?? null,
    createdAt: section.createdAt,
    closedAt: section.closedAt,
    participants: section.participants.map((p) => ({
      id: p.id,
      userId: p.userId,
      displayName: p.user?.displayName ?? "不明",
    })),
    gameCount: section._count.games,
  };
}

/**
 * ユーザーがセクションの参加者かどうかを確認する
 */
export async function isUserParticipant(
  sectionId: string,
  userId: string,
): Promise<boolean> {
  const participant = await prisma.sectionParticipant.findUnique({
    where: {
      sectionId_userId: { sectionId, userId },
    },
    select: { id: true },
  });

  return !!participant;
}

/**
 * ユーザーがセクションの作成者かどうかを確認する
 */
export async function isSectionCreator(
  sectionId: string,
  userId: string,
): Promise<boolean> {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, deletedAt: null },
    select: { createdBy: true },
  });

  return section?.createdBy === userId;
}
