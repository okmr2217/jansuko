"use server";

import { revalidatePath } from "next/cache";
import { getSession, createSession } from "@/lib/auth/session";
import { updateUser } from "@/lib/db/mutations/users";
import {
  getUserByDisplayName,
  getUserPasswordHash,
} from "@/lib/db/queries/users";
import { verifyPassword } from "@/lib/auth/password";
import { z } from "zod";

export interface ActionResult {
  success: boolean;
  error?: string;
}

const updateDisplayNameSchema = z.object({
  displayName: z
    .string()
    .min(1, "表示名を入力してください")
    .max(50, "表示名は50文字以内で入力してください"),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
  newPassword: z
    .string()
    .min(4, "新しいパスワードは4文字以上で入力してください")
    .max(100, "新しいパスワードは100文字以内で入力してください"),
  confirmPassword: z.string().min(1, "パスワード（確認）を入力してください"),
});

/**
 * 表示名を更新する
 */
export async function updateDisplayNameAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getSession();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    const rawData = {
      displayName: formData.get("displayName") as string,
    };

    const result = updateDisplayNameSchema.safeParse(rawData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const { displayName } = result.data;

    // 表示名が変更されていない場合
    if (displayName === user.displayName) {
      return { success: true };
    }

    // 表示名の重複チェック
    const existingUser = await getUserByDisplayName(displayName);
    if (existingUser && existingUser.id !== user.id) {
      return { success: false, error: "この表示名は既に使用されています" };
    }

    await updateUser(user.id, { displayName });

    // セッションの表示名を更新
    await createSession({
      id: user.id,
      displayName,
      isAdmin: user.isAdmin,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * パスワードを更新する
 */
export async function updatePasswordAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getSession();
    if (!user) {
      return { success: false, error: "ログインが必要です" };
    }

    const rawData = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const result = updatePasswordSchema.safeParse(rawData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const { currentPassword, newPassword, confirmPassword } = result.data;

    // パスワード確認のチェック
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "新しいパスワードと確認用パスワードが一致しません",
      };
    }

    // 現在のパスワードを検証
    const passwordHash = await getUserPasswordHash(user.id);
    if (!passwordHash) {
      return { success: false, error: "ユーザー情報の取得に失敗しました" };
    }

    const isValid = await verifyPassword(currentPassword, passwordHash);
    if (!isValid) {
      return { success: false, error: "現在のパスワードが正しくありません" };
    }

    await updateUser(user.id, { password: newPassword });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}
