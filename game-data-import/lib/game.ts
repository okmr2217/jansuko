import { createClient } from "./supabase.js";

export interface ScoreInput {
  userId: string;
  points: number;
}

export interface CreateGameInput {
  sectionId: string;
  gameNumber: number;
  scores: ScoreInput[];
}

/**
 * 新しいゲームとスコアを作成する
 */
export async function createGame(input: CreateGameInput): Promise<string> {
  const supabase = createClient();

  // ゲームを作成
  const gameData = {
    section_id: input.sectionId,
    game_number: input.gameNumber,
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
  const scoresData = input.scores.map((score) => ({
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
