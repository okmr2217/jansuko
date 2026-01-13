import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { Prisma } from "@/generated/prisma/client";

export interface CreateUserInput {
  displayName: string;
  password: string;
  isAdmin?: boolean;
}

export interface UpdateUserInput {
  displayName?: string;
  password?: string;
  isAdmin?: boolean;
}

/**
 * 新しいユーザーを作成する
 */
export async function createUser(input: CreateUserInput): Promise<string> {
  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        displayName: input.displayName,
        passwordHash,
        isAdmin: input.isAdmin ?? false,
      },
      select: { id: true },
    });

    return user.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("この表示名は既に使用されています");
      }
    }
    throw new Error("ユーザーの作成に失敗しました");
  }
}

/**
 * ユーザーを更新する
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<void> {
  const updateData: Prisma.UserUpdateInput = {};

  if (input.displayName !== undefined) {
    updateData.displayName = input.displayName;
  }

  if (input.password !== undefined) {
    updateData.passwordHash = await hashPassword(input.password);
  }

  if (input.isAdmin !== undefined) {
    updateData.isAdmin = input.isAdmin;
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  try {
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("この表示名は既に使用されています");
      }
    }
    throw new Error("ユーザーの更新に失敗しました");
  }
}

/**
 * ユーザーを論理削除する
 */
export async function deleteUser(id: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
