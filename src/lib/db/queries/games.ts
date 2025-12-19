import { createAdminClient } from "@/lib/supabase/server";
import { Tables } from "@/lib/supabase/database.types";

export type GameRow = Tables<"games">;
export type ScoreRow = Tables<"scores">;

export interface GameScore {
  id: string;
  gameId: string;
  userId: string;
  displayName: string;
  points: number;
}

export interface GameWithScores {
  id: string;
  gameNumber: number;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
  scores: GameScore[];
}

/**
 * セクションのゲーム一覧をスコア付きで取得する
 */
export async function getGamesWithScores(
  sectionId: string
): Promise<GameWithScores[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("games")
    .select(
      `
      id,
      game_number,
      section_id,
      created_at,
      updated_at,
      scores(
        id,
        game_id,
        user_id,
        points,
        user:users(display_name)
      )
    `
    )
    .eq("section_id", sectionId)
    .order("game_number", { ascending: true });

  if (error) {
    throw new Error(`ゲーム一覧の取得に失敗しました: ${error.message}`);
  }

  return data.map((game) => ({
    id: game.id,
    gameNumber: game.game_number,
    sectionId: game.section_id,
    createdAt: game.created_at,
    updatedAt: game.updated_at,
    scores: (
      game.scores as Array<{
        id: string;
        game_id: string;
        user_id: string;
        points: number;
        user: { display_name: string } | null;
      }>
    ).map((score) => ({
      id: score.id,
      gameId: score.game_id,
      userId: score.user_id,
      displayName: score.user?.display_name ?? "不明",
      points: score.points,
    })),
  }));
}

/**
 * 特定のゲームをスコア付きで取得する
 */
export async function getGameWithScores(
  gameId: string
): Promise<GameWithScores | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("games")
    .select(
      `
      id,
      game_number,
      section_id,
      created_at,
      updated_at,
      scores(
        id,
        game_id,
        user_id,
        points,
        user:users(display_name)
      )
    `
    )
    .eq("id", gameId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`ゲームの取得に失敗しました: ${error.message}`);
  }

  return {
    id: data.id,
    gameNumber: data.game_number,
    sectionId: data.section_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    scores: (
      data.scores as Array<{
        id: string;
        game_id: string;
        user_id: string;
        points: number;
        user: { display_name: string } | null;
      }>
    ).map((score) => ({
      id: score.id,
      gameId: score.game_id,
      userId: score.user_id,
      displayName: score.user?.display_name ?? "不明",
      points: score.points,
    })),
  };
}

/**
 * セクションの次のゲーム番号を取得する
 */
export async function getNextGameNumber(sectionId: string): Promise<number> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("games")
    .select("game_number")
    .eq("section_id", sectionId)
    .order("game_number", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return 1;
    }
    throw new Error(`ゲーム番号の取得に失敗しました: ${error.message}`);
  }

  return data.game_number + 1;
}
