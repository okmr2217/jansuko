import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";

export interface CreateSectionInput {
  name: string;
  startingPoints?: number;
  returnPoints?: number;
  rate?: number;
  playerCount: number;
  participantIds: string[];
  createdBy: string;
}

export interface UpdateSectionInput {
  name?: string;
  startingPoints?: number;
  returnPoints?: number;
  rate?: number;
}

/**
 * 新しいセクションを作成する
 */
export async function createSection(
  input: CreateSectionInput,
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    // セクションを作成
    const section = await tx.section.create({
      data: {
        name: input.name,
        startingPoints: input.startingPoints ?? 25000,
        returnPoints: input.returnPoints ?? 30000,
        rate: input.rate ?? 50,
        playerCount: input.playerCount,
        createdBy: input.createdBy,
      },
      select: { id: true },
    });

    // 参加者を追加
    await tx.sectionParticipant.createMany({
      data: input.participantIds.map((userId) => ({
        sectionId: section.id,
        userId,
      })),
    });

    return section.id;
  });
}

/**
 * セクションを更新する
 */
export async function updateSection(
  id: string,
  input: UpdateSectionInput,
): Promise<void> {
  const updateData: Prisma.SectionUpdateInput = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
  }

  if (input.startingPoints !== undefined) {
    updateData.startingPoints = input.startingPoints;
  }

  if (input.returnPoints !== undefined) {
    updateData.returnPoints = input.returnPoints;
  }

  if (input.rate !== undefined) {
    updateData.rate = input.rate;
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  await prisma.section.update({
    where: { id },
    data: updateData,
  });
}

/**
 * セクションを終了する（クローズする）
 */
export async function closeSection(id: string): Promise<void> {
  await prisma.section.update({
    where: { id },
    data: {
      status: "closed",
      closedAt: new Date(),
    },
  });
}

/**
 * セクションを削除する（論理削除）
 */
export async function deleteSection(id: string): Promise<void> {
  await prisma.section.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * セクションを再開する（終了→進行中に戻す）
 */
export async function reopenSection(id: string): Promise<void> {
  await prisma.section.update({
    where: { id },
    data: {
      status: "active",
      closedAt: null,
    },
  });
}
