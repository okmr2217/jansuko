import { createAdminClient } from "@/lib/supabase/server";

export interface User {
  id: string;
  displayName: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * アクティブなユーザー一覧を取得する（論理削除されていないユーザー）
 */
export async function getUsers(): Promise<User[]> {
  const supabase = createAdminClient();

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

/**
 * 特定のユーザーを取得する
 */
export async function getUser(id: string): Promise<User | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, is_admin, created_at, updated_at")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`ユーザーの取得に失敗しました: ${error.message}`);
  }

  return {
    id: data.id,
    displayName: data.display_name,
    isAdmin: data.is_admin,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * 表示名でユーザーを検索する（重複チェック用）
 */
export async function getUserByDisplayName(
  displayName: string
): Promise<User | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, is_admin, created_at, updated_at")
    .eq("display_name", displayName)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`ユーザーの検索に失敗しました: ${error.message}`);
  }

  return {
    id: data.id,
    displayName: data.display_name,
    isAdmin: data.is_admin,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * ユーザーのパスワードハッシュを取得する（パスワード検証用）
 */
export async function getUserPasswordHash(id: string): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`パスワードの取得に失敗しました: ${error.message}`);
  }

  return data.password_hash;
}
