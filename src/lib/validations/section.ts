import { z } from "zod";

export const STARTING_POINTS_OPTIONS = [
  { value: 20000, label: "20,000点" },
  { value: 25000, label: "25,000点" },
  { value: 30000, label: "30,000点" },
  { value: 35000, label: "35,000点" },
] as const;

export const RETURN_POINTS_OPTIONS = [
  { value: 20000, label: "20,000点" },
  { value: 25000, label: "25,000点" },
  { value: 30000, label: "30,000点" },
  { value: 35000, label: "35,000点" },
] as const;

export const RATE_OPTIONS = [
  { value: 0, label: "ノーレート" },
  { value: 10, label: "テンイチ (¥10/1,000点)" },
  { value: 20, label: "テンニ (¥20/1,000点)" },
  { value: 30, label: "テンサン (¥30/1,000点)" },
  { value: 50, label: "テンゴ (¥50/1,000点)" },
  { value: 100, label: "テンピン (¥100/1,000点)" },
] as const;

export const createSectionSchema = z.object({
  name: z
    .string()
    .min(1, "セクション名を入力してください")
    .max(100, "セクション名は100文字以内で入力してください"),
  startingPoints: z
    .number()
    .int("開始点は整数で入力してください")
    .min(1000, "開始点は1000点以上で入力してください")
    .max(100000, "開始点は100000点以下で入力してください"),
  returnPoints: z
    .number()
    .int("返し点は整数で入力してください")
    .min(1000, "返し点は1000点以上で入力してください")
    .max(100000, "返し点は100000点以下で入力してください"),
  rate: z
    .number()
    .int("レートは整数で入力してください")
    .min(0, "レートは0以上で入力してください")
    .max(10000, "レートは10000以下で入力してください"),
  playerCount: z
    .number()
    .int()
    .refine((val) => val === 3 || val === 4, {
      message: "参加人数は3人または4人を選択してください",
    }),
  participantIds: z
    .array(z.string().uuid())
    .refine((arr) => arr.length >= 3 && arr.length <= 4, {
      message: "参加者は3人または4人を選択してください",
    }),
});

export const updateSectionSchema = z.object({
  name: z
    .string()
    .min(1, "セクション名を入力してください")
    .max(100, "セクション名は100文字以内で入力してください")
    .optional(),
  startingPoints: z
    .number()
    .int("開始点は整数で入力してください")
    .min(1000, "開始点は1000点以上で入力してください")
    .max(100000, "開始点は100000点以下で入力してください")
    .optional(),
  returnPoints: z
    .number()
    .int("返し点は整数で入力してください")
    .min(1000, "返し点は1000点以上で入力してください")
    .max(100000, "返し点は100000点以下で入力してください")
    .optional(),
  rate: z
    .number()
    .int("レートは整数で入力してください")
    .min(0, "レートは0以上で入力してください")
    .max(10000, "レートは10000以下で入力してください")
    .optional(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
