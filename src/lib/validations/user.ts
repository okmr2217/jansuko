import { z } from "zod";

export const createUserSchema = z.object({
  displayName: z
    .string()
    .min(1, "表示名を入力してください")
    .max(50, "表示名は50文字以内で入力してください"),
  password: z
    .string()
    .min(4, "パスワードは4文字以上で入力してください")
    .max(100, "パスワードは100文字以内で入力してください"),
});

export const updateUserSchema = z.object({
  displayName: z
    .string()
    .min(1, "表示名を入力してください")
    .max(50, "表示名は50文字以内で入力してください"),
  password: z
    .string()
    .max(100, "パスワードは100文字以内で入力してください")
    .optional()
    .or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
