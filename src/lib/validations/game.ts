import { z } from "zod";

export const scoreInputSchema = z.object({
  userId: z.string().uuid("ユーザーIDが不正です"),
  points: z
    .number()
    .int("点数は整数で入力してください")
    .refine((val) => val % 100 === 0, {
      message: "点数は100点単位で入力してください",
    }),
});

export const createGameSchema = z.object({
  sectionId: z.string().uuid("セクションIDが不正です"),
  scores: z
    .array(scoreInputSchema)
    .min(3, "スコアは3人以上必要です")
    .max(4, "スコアは4人以下です"),
});

export const updateGameSchema = z.object({
  scores: z
    .array(scoreInputSchema)
    .min(3, "スコアは3人以上必要です")
    .max(4, "スコアは4人以下です"),
});

export type ScoreInput = z.infer<typeof scoreInputSchema>;
export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;

/**
 * 点数合計が正しいかチェックする
 * @param scores スコア配列
 * @param startingPoints 開始点
 * @param playerCount 参加人数
 * @returns エラーメッセージ（正常ならnull）
 */
export function validateTotalPoints(
  scores: ScoreInput[],
  startingPoints: number,
  playerCount: number,
): string | null {
  if (scores.length !== playerCount) {
    return `参加者${playerCount}人分のスコアが必要です`;
  }

  const total = scores.reduce((sum, score) => sum + score.points, 0);
  const expectedTotal = startingPoints * playerCount;

  if (total !== expectedTotal) {
    return `点数の合計が${expectedTotal.toLocaleString()}点になる必要があります（現在: ${total.toLocaleString()}点）`;
  }

  return null;
}
