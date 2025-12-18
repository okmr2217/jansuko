import { createAdminClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth/password";

export interface CreateUserInput {
  displayName: string;
  password: string;
  isAdmin?: boolean;
}

export interface UpdateUserInput {
  displayName?: string;
  password?: string;
  isAdmin?: boolean;
}

/**
 * 新しいユーザーを作成する
 */
export async function createUser(input: CreateUserInput): Promise<string> {
  const supabase = createAdminClient();

  const passwordHash = await hashPassword(input.password);

  const { data, error } = await supabase
    .from("users")
    .insert({
      display_name: input.displayName,
      password_hash: passwordHash,
      is_admin: input.isAdmin ?? false,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("この表示名は既に使用されています");
    }
    throw new Error(`ユーザーの作成に失敗しました: ${error.message}`);
  }

  return data.id;
}

/**
 * ユーザーを更新する
 */
export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<void> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};

  if (input.displayName !== undefined) {
    updateData.display_name = input.displayName;
  }

  if (input.password !== undefined) {
    updateData.password_hash = await hashPassword(input.password);
  }

  if (input.isAdmin !== undefined) {
    updateData.is_admin = input.isAdmin;
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    if (error.code === "23505") {
      throw new Error("この表示名は既に使用されています");
    }
    throw new Error(`ユーザーの更新に失敗しました: ${error.message}`);
  }
}

/**
 * ユーザーを論理削除する
 */
export async function deleteUser(id: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("users")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`ユーザーの削除に失敗しました: ${error.message}`);
  }
}
