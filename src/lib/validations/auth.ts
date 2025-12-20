import { z } from "zod";

export const loginSchema = z.object({
  displayName: z.string().min(1, "表示名を入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginInput = z.infer<typeof loginSchema>;
