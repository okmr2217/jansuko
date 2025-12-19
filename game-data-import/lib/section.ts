import { createClient } from "./supabase.js";

export interface CreateSectionInput {
  name: string;
  startingPoints?: number;
  returnPoints?: number;
  rate?: number;
  playerCount: number;
  participantIds: string[];
  createdBy: string;
  createdAt: Date;
}

export async function createSection(input: CreateSectionInput): Promise<string> {
  const supabase = createClient();

  // セクションを作成
  const sectionData = {
    name: input.name,
    starting_points: input.startingPoints ?? 25000,
    return_points: input.returnPoints ?? 30000,
    rate: input.rate ?? 50,
    player_count: input.playerCount,
    created_by: input.createdBy,
    status: "closed",
    created_at: input.createdAt.toISOString(),
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
  const participantsData = input.participantIds.map(
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
