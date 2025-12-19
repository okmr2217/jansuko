import { createClient } from "./supabase.js";

export async function getUsers() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, is_admin, created_at, updated_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`ユーザー一覧の取得に失敗しました: ${error.message}`);
  }

  return data.map((user) => ({
    id: user.id,
    displayName: user.display_name,
    isAdmin: user.is_admin,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }));
}
