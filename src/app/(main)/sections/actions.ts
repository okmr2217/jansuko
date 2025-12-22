"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  createSection,
  updateSection,
  closeSection,
  deleteSection,
  reopenSection,
} from "@/lib/db/mutations/sections";
import { isSectionCreator } from "@/lib/db/queries/sections";
import {
  createSectionSchema,
  updateSectionSchema,
} from "@/lib/validations/section";

export interface ActionResult {
  success: boolean;
  error?: string;
  sectionId?: string;
}

/**
 * ログイン中のユーザーを取得する
 */
async function requireAuth() {
  const user = await getSession();
  if (!user) {
    throw new Error("ログインが必要です");
  }
  return user;
}

/**
 * セクションを作成する
 */
export async function createSectionAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const participantIds = formData.getAll("participantIds") as string[];

    const rawData = {
      name: formData.get("name") as string,
      startingPoints: Number(formData.get("startingPoints")),
      returnPoints: Number(formData.get("returnPoints")),
      rate: Number(formData.get("rate")),
      playerCount: Number(formData.get("playerCount")),
      participantIds,
    };

    const result = createSectionSchema.safeParse(rawData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const data = result.data;

    // 参加人数と参加者数の一致チェック
    if (data.participantIds.length !== data.playerCount) {
      return {
        success: false,
        error: `参加者を${data.playerCount}人選択してください`,
      };
    }

    const sectionId = await createSection({
      name: data.name,
      startingPoints: data.startingPoints,
      returnPoints: data.returnPoints,
      rate: data.rate,
      playerCount: data.playerCount,
      participantIds: data.participantIds,
      createdBy: user.id,
    });

    revalidatePath("/sections");
    return { success: true, sectionId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * セクションを更新する
 */
export async function updateSectionAction(
  sectionId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // 作成者チェック
    const isCreator = await isSectionCreator(sectionId, user.id);
    if (!isCreator && !user.isAdmin) {
      return { success: false, error: "編集権限がありません" };
    }

    const rawData = {
      name: formData.get("name") as string,
      startingPoints: Number(formData.get("startingPoints")),
      returnPoints: Number(formData.get("returnPoints")),
      rate: Number(formData.get("rate")),
    };

    const result = updateSectionSchema.safeParse(rawData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    await updateSection(sectionId, result.data);

    revalidatePath(`/sections/${sectionId}`);
    revalidatePath("/sections");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * セクションを終了する
 */
export async function closeSectionAction(
  sectionId: string
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // 作成者チェック
    const isCreator = await isSectionCreator(sectionId, user.id);
    if (!isCreator && !user.isAdmin) {
      return { success: false, error: "終了する権限がありません" };
    }

    await closeSection(sectionId);

    revalidatePath(`/sections/${sectionId}`);
    revalidatePath("/sections");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * セクションを削除する
 */
export async function deleteSectionAction(
  sectionId: string
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // 作成者チェック
    const isCreator = await isSectionCreator(sectionId, user.id);
    if (!isCreator && !user.isAdmin) {
      return { success: false, error: "削除する権限がありません" };
    }

    await deleteSection(sectionId);

    revalidatePath("/sections");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * セクションを再開する（終了→進行中に戻す）
 */
export async function reopenSectionAction(
  sectionId: string
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // 作成者チェック
    const isCreator = await isSectionCreator(sectionId, user.id);
    if (!isCreator && !user.isAdmin) {
      return { success: false, error: "再開する権限がありません" };
    }

    await reopenSection(sectionId);

    revalidatePath(`/sections/${sectionId}`);
    revalidatePath("/sections");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}
