import { createAdminClient } from "@/lib/supabase/server";
import { Tables, Enums } from "@/lib/supabase/database.types";

export type SectionStatus = Enums<"section_status">;
export type SectionRow = Tables<"sections">;
export type SectionParticipantRow = Tables<"section_participants">;

export interface SectionParticipant {
  id: string;
  userId: string;
  displayName: string;
}

export interface SectionListItem {
  id: string;
  name: string;
  startingPoints: number;
  returnPoints: number;
  rate: number;
  playerCount: number;
  status: SectionStatus;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  closedAt: string | null;
  participants: SectionParticipant[];
  gameCount: number;
}

export interface GetSectionsOptions {
  status?: SectionStatus;
  search?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * セクション一覧を取得する
 */
export async function getSections(
  options: GetSectionsOptions = {},
): Promise<SectionListItem[]> {
  const supabase = createAdminClient();
  const { status, search, sortOrder = "desc" } = options;

  // セクション基本情報を取得
  let query = supabase
    .from("sections")
    .select(
      `
      id,
      name,
      starting_points,
      return_points,
      rate,
      player_count,
      status,
      created_by,
      created_at,
      closed_at,
      creator:users!sections_created_by_fkey(display_name),
      section_participants(
        id,
        user_id,
        user:users(display_name)
      ),
      games(count)
    `,
    )
    .order("created_at", { ascending: sortOrder === "asc" });

  // 論理削除されていないセクションのみ取得
  query = query.is("deleted_at", null);

  // ステータスフィルター
  if (status) {
    query = query.eq("status", status);
  }

  // 検索フィルター（セクション名）
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`セクション一覧の取得に失敗しました: ${error.message}`);
  }

  return data.map((section) => ({
    id: section.id,
    name: section.name,
    startingPoints: section.starting_points,
    returnPoints: section.return_points,
    rate: section.rate,
    playerCount: section.player_count,
    status: section.status,
    createdBy: section.created_by,
    createdByName:
      (section.creator as { display_name: string } | null)?.display_name ??
      null,
    createdAt: section.created_at,
    closedAt: section.closed_at,
    participants: (
      section.section_participants as Array<{
        id: string;
        user_id: string;
        user: { display_name: string } | null;
      }>
    ).map((p) => ({
      id: p.id,
      userId: p.user_id,
      displayName: p.user?.display_name ?? "不明",
    })),
    gameCount: (section.games as Array<{ count: number }>)[0]?.count ?? 0,
  }));
}

/**
 * 特定のセクションを取得する
 */
export async function getSection(id: string): Promise<SectionListItem | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("sections")
    .select(
      `
      id,
      name,
      starting_points,
      return_points,
      rate,
      player_count,
      status,
      created_by,
      created_at,
      closed_at,
      creator:users!sections_created_by_fkey(display_name),
      section_participants(
        id,
        user_id,
        user:users(display_name)
      ),
      games(count)
    `,
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`セクションの取得に失敗しました: ${error.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    startingPoints: data.starting_points,
    returnPoints: data.return_points,
    rate: data.rate,
    playerCount: data.player_count,
    status: data.status,
    createdBy: data.created_by,
    createdByName:
      (data.creator as { display_name: string } | null)?.display_name ?? null,
    createdAt: data.created_at,
    closedAt: data.closed_at,
    participants: (
      data.section_participants as Array<{
        id: string;
        user_id: string;
        user: { display_name: string } | null;
      }>
    ).map((p) => ({
      id: p.id,
      userId: p.user_id,
      displayName: p.user?.display_name ?? "不明",
    })),
    gameCount: (data.games as Array<{ count: number }>)[0]?.count ?? 0,
  };
}

/**
 * ユーザーがセクションの参加者かどうかを確認する
 */
export async function isUserParticipant(
  sectionId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("section_participants")
    .select("id")
    .eq("section_id", sectionId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return false;
    }
    throw new Error(`参加者の確認に失敗しました: ${error.message}`);
  }

  return !!data;
}

/**
 * ユーザーがセクションの作成者かどうかを確認する
 */
export async function isSectionCreator(
  sectionId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("sections")
    .select("created_by")
    .eq("id", sectionId)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return false;
    }
    throw new Error(`作成者の確認に失敗しました: ${error.message}`);
  }

  return data.created_by === userId;
}
