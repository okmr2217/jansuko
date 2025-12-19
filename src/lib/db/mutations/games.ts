import { createAdminClient } from "@/lib/supabase/server";
import { TablesInsert } from "@/lib/supabase/database.types";
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
  const supabase = createAdminClient();

  // 次のゲーム番号を取得
  const gameNumber = await getNextGameNumber(input.sectionId);

  // ゲームを作成
  const gameData: TablesInsert<"games"> = {
    section_id: input.sectionId,
    game_number: gameNumber,
  };

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert(gameData)
    .select("id")
    .single();

  if (gameError) {
    throw new Error(`ゲームの作成に失敗しました: ${gameError.message}`);
  }

  // スコアを追加
  const scoresData: TablesInsert<"scores">[] = input.scores.map((score) => ({
    game_id: game.id,
    user_id: score.userId,
    points: score.points,
  }));

  const { error: scoresError } = await supabase.from("scores").insert(scoresData);

  if (scoresError) {
    // ゲームを削除してロールバック
    await supabase.from("games").delete().eq("id", game.id);
    throw new Error(`スコアの追加に失敗しました: ${scoresError.message}`);
  }

  return game.id;
}

/**
 * ゲームのスコアを更新する
 */
export async function updateGameScores(
  gameId: string,
  input: UpdateGameInput
): Promise<void> {
  const supabase = createAdminClient();

  // 既存のスコアを削除
  const { error: deleteError } = await supabase
    .from("scores")
    .delete()
    .eq("game_id", gameId);

  if (deleteError) {
    throw new Error(`スコアの削除に失敗しました: ${deleteError.message}`);
  }

  // 新しいスコアを追加
  const scoresData: TablesInsert<"scores">[] = input.scores.map((score) => ({
    game_id: gameId,
    user_id: score.userId,
    points: score.points,
  }));

  const { error: insertError } = await supabase.from("scores").insert(scoresData);

  if (insertError) {
    throw new Error(`スコアの追加に失敗しました: ${insertError.message}`);
  }

  // ゲームの更新日時を更新
  const { error: updateError } = await supabase
    .from("games")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", gameId);

  if (updateError) {
    throw new Error(`ゲームの更新に失敗しました: ${updateError.message}`);
  }
}

/**
 * ゲームを削除する
 */
export async function deleteGame(gameId: string): Promise<void> {
  const supabase = createAdminClient();

  // scoresはCASCADEで削除される
  const { error } = await supabase.from("games").delete().eq("id", gameId);

  if (error) {
    throw new Error(`ゲームの削除に失敗しました: ${error.message}`);
  }
}
