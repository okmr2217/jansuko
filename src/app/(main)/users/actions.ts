"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createUser, updateUser, deleteUser } from "@/lib/db/mutations/users";
import { getUserByDisplayName } from "@/lib/db/queries/users";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * 管理者権限をチェックする
 */
async function requireAdmin(): Promise<void> {
  const user = await getSession();
  if (!user) {
    throw new Error("ログインが必要です");
  }
  if (!user.isAdmin) {
    throw new Error("管理者権限が必要です");
  }
}

/**
 * 雀士を作成する
 */
export async function createUserAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const rawData = {
      displayName: formData.get("displayName") as string,
      password: formData.get("password") as string,
    };

    const result = createUserSchema.safeParse(rawData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const { displayName, password } = result.data;

    // 表示名の重複チェック
    const existingUser = await getUserByDisplayName(displayName);
    if (existingUser) {
      return { success: false, error: "この表示名は既に使用されています" };
    }

    await createUser({
      displayName,
      password,
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * 雀士を更新する
 */
export async function updateUserAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const rawData = {
      displayName: formData.get("displayName") as string,
      password: formData.get("password") as string,
    };

    const result = updateUserSchema.safeParse(rawData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const { displayName, password } = result.data;

    // 表示名の重複チェック（自分以外）
    const existingUser = await getUserByDisplayName(displayName);
    if (existingUser && existingUser.id !== id) {
      return { success: false, error: "この表示名は既に使用されています" };
    }

    const updateData: { displayName?: string; password?: string } = {
      displayName,
    };

    // パスワードが入力されている場合のみ更新
    if (password && password.length > 0) {
      if (password.length < 4) {
        return {
          success: false,
          error: "パスワードは4文字以上で入力してください",
        };
      }
      updateData.password = password;
    }

    await updateUser(id, updateData);

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * 雀士を削除する（論理削除）
 */
export async function deleteUserAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    // 自分自身は削除できない
    const currentUser = await getSession();
    if (currentUser?.id === id) {
      return { success: false, error: "自分自身を削除することはできません" };
    }

    await deleteUser(id);

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}
