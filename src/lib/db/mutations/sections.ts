import { createAdminClient } from "@/lib/supabase/server";
import { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

export interface CreateSectionInput {
  name: string;
  startingPoints?: number;
  returnPoints?: number;
  rate?: number;
  playerCount: number;
  participantIds: string[];
  createdBy: string;
}

export interface UpdateSectionInput {
  name?: string;
  startingPoints?: number;
  returnPoints?: number;
  rate?: number;
}

/**
 * 新しいセクションを作成する
 */
export async function createSection(input: CreateSectionInput): Promise<string> {
  const supabase = createAdminClient();

  // セクションを作成
  const sectionData: TablesInsert<"sections"> = {
    name: input.name,
    starting_points: input.startingPoints ?? 25000,
    return_points: input.returnPoints ?? 30000,
    rate: input.rate ?? 50,
    player_count: input.playerCount,
    created_by: input.createdBy,
  };

  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .insert(sectionData)
    .select("id")
    .single();

  if (sectionError) {
    throw new Error(`セクションの作成に失敗しました: ${sectionError.message}`);
  }

  // 参加者を追加
  const participantsData: TablesInsert<"section_participants">[] = input.participantIds.map(
    (userId) => ({
      section_id: section.id,
      user_id: userId,
    })
  );

  const { error: participantsError } = await supabase
    .from("section_participants")
    .insert(participantsData);

  if (participantsError) {
    // セクションを削除してロールバック
    await supabase.from("sections").delete().eq("id", section.id);
    throw new Error(`参加者の追加に失敗しました: ${participantsError.message}`);
  }

  return section.id;
}

/**
 * セクションを更新する
 */
export async function updateSection(
  id: string,
  input: UpdateSectionInput
): Promise<void> {
  const supabase = createAdminClient();

  const updateData: TablesUpdate<"sections"> = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
  }

  if (input.startingPoints !== undefined) {
    updateData.starting_points = input.startingPoints;
  }

  if (input.returnPoints !== undefined) {
    updateData.return_points = input.returnPoints;
  }

  if (input.rate !== undefined) {
    updateData.rate = input.rate;
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("sections")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(`セクションの更新に失敗しました: ${error.message}`);
  }
}

/**
 * セクションを終了する（クローズする）
 */
export async function closeSection(id: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("sections")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "active");

  if (error) {
    throw new Error(`セクションの終了に失敗しました: ${error.message}`);
  }
}

/**
 * セクションを削除する
 */
export async function deleteSection(id: string): Promise<void> {
  const supabase = createAdminClient();

  // 関連するgames, section_participantsはCASCADEで削除される
  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`セクションの削除に失敗しました: ${error.message}`);
  }
}
