"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  createGame,
  updateGameScores,
  deleteGame,
} from "@/lib/db/mutations/games";
import {
  getSection,
  isUserParticipant,
  isSectionCreator,
} from "@/lib/db/queries/sections";
import { getGamesWithScores, GameWithScores } from "@/lib/db/queries/games";
import {
  createGameSchema,
  updateGameSchema,
  validateTotalPoints,
  type ScoreInput,
} from "@/lib/validations/game";

export interface ActionResult {
  success: boolean;
  error?: string;
  gameId?: string;
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
 * ゲームを作成する
 */
export async function createGameAction(
  sectionId: string,
  scores: ScoreInput[],
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // 参加者チェック
    const isParticipant = await isUserParticipant(sectionId, user.id);
    if (!isParticipant && !user.isAdmin) {
      return { success: false, error: "点数を入力する権限がありません" };
    }

    // セクション情報を取得
    const section = await getSection(sectionId);
    if (!section) {
      return { success: false, error: "セクションが見つかりません" };
    }

    // セクションがアクティブかチェック
    if (section.status !== "active") {
      return {
        success: false,
        error: "終了したセクションには点数を入力できません",
      };
    }

    // バリデーション
    const result = createGameSchema.safeParse({ sectionId, scores });
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    // 点数合計チェック
    const totalError = validateTotalPoints(
      scores,
      section.startingPoints,
      section.playerCount,
    );
    if (totalError) {
      return { success: false, error: totalError };
    }

    // ゲームを作成
    const gameId = await createGame({
      sectionId,
      scores,
    });

    revalidatePath(`/sections/${sectionId}`);
    return { success: true, gameId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * ゲームのスコアを更新する
 */
export async function updateGameAction(
  sectionId: string,
  gameId: string,
  scores: ScoreInput[],
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // 参加者チェック
    const isParticipant = await isUserParticipant(sectionId, user.id);
    if (!isParticipant && !user.isAdmin) {
      return { success: false, error: "点数を修正する権限がありません" };
    }

    // セクション情報を取得
    const section = await getSection(sectionId);
    if (!section) {
      return { success: false, error: "セクションが見つかりません" };
    }

    // セクションがアクティブかチェック
    if (section.status !== "active") {
      return {
        success: false,
        error: "終了したセクションの点数は修正できません",
      };
    }

    // バリデーション
    const result = updateGameSchema.safeParse({ scores });
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    // 点数合計チェック
    const totalError = validateTotalPoints(
      scores,
      section.startingPoints,
      section.playerCount,
    );
    if (totalError) {
      return { success: false, error: totalError };
    }

    // スコアを更新
    await updateGameScores(gameId, { scores });

    revalidatePath(`/sections/${sectionId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * ゲームを削除する
 */
export async function deleteGameAction(
  sectionId: string,
  gameId: string,
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // 作成者チェック
    const isCreator = await isSectionCreator(sectionId, user.id);
    if (!isCreator && !user.isAdmin) {
      return { success: false, error: "ゲームを削除する権限がありません" };
    }

    // セクション情報を取得
    const section = await getSection(sectionId);
    if (!section) {
      return { success: false, error: "セクションが見つかりません" };
    }

    // セクションがアクティブかチェック
    if (section.status !== "active") {
      return {
        success: false,
        error: "終了したセクションのゲームは削除できません",
      };
    }

    // ゲームを削除
    await deleteGame(gameId);

    revalidatePath(`/sections/${sectionId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "エラーが発生しました";
    return { success: false, error: message };
  }
}

/**
 * セクションのゲーム一覧を取得する（リアルタイム更新用）
 */
export async function fetchGamesAction(
  sectionId: string,
): Promise<GameWithScores[]> {
  return getGamesWithScores(sectionId);
}
