import { prisma } from "@/lib/db/prisma";

export interface User {
  id: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * アクティブなユーザー一覧を取得する（論理削除されていないユーザー）
 */
export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      displayName: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
}

/**
 * 特定のユーザーを取得する
 */
export async function getUser(id: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      displayName: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * 表示名でユーザーを検索する（重複チェック用）
 */
export async function getUserByDisplayName(
  displayName: string,
): Promise<User | null> {
  return prisma.user.findFirst({
    where: { displayName, deletedAt: null },
    select: {
      id: true,
      displayName: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * ユーザーのパスワードハッシュを取得する（パスワード検証用）
 */
export async function getUserPasswordHash(id: string): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: { passwordHash: true },
  });

  return user?.passwordHash ?? null;
}
