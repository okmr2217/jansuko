"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState | null> {
  const rawData = {
    displayName: formData.get("displayName") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(rawData);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { error: firstError.message };
  }

  const { displayName, password } = result.data;

  const supabase = createAdminClient();

  // ユーザーを表示名で検索（削除されていないユーザーのみ）
  const { data: user, error } = await supabase
    .from("users")
    .select("id, display_name, password_hash, is_admin")
    .eq("display_name", displayName)
    .is("deleted_at", null)
    .single();

  if (error || !user) {
    return { error: "表示名またはパスワードが正しくありません" };
  }

  // パスワードを検証
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return { error: "表示名またはパスワードが正しくありません" };
  }

  // セッションを作成
  await createSession({
    id: user.id,
    displayName: user.display_name,
    isAdmin: user.is_admin,
  });

  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
