"use client";

import { useState, useEffect } from "react";
import { SectionParticipant } from "@/lib/db/queries/sections";
import { GameWithScores } from "@/lib/db/queries/games";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScoreInput } from "@/lib/validations/game";

interface ScoreInputFormProps {
  participants: SectionParticipant[];
  startingPoints: number;
  playerCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (scores: ScoreInput[]) => Promise<void>;
  editingGame?: GameWithScores | null;
  isSubmitting: boolean;
}

export function ScoreInputForm({
  participants,
  startingPoints,
  playerCount,
  open,
  onOpenChange,
  onSubmit,
  editingGame,
  isSubmitting,
}: ScoreInputFormProps) {
  // 各参加者の点数を管理
  const [scores, setScores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // フォームを初期化
  useEffect(() => {
    if (open) {
      if (editingGame) {
        // 編集モード: 既存のスコアをセット
        const initialScores: Record<string, string> = {};
        editingGame.scores.forEach((score) => {
          initialScores[score.userId] = String(score.points);
        });
        setScores(initialScores);
      } else {
        // 新規作成モード: 空にリセット
        const initialScores: Record<string, string> = {};
        participants.forEach((p) => {
          initialScores[p.userId] = "";
        });
        setScores(initialScores);
      }
      setError(null);
    }
  }, [open, editingGame, participants]);

  // 点数を更新
  const handleScoreChange = (userId: string, value: string) => {
    // 数字、マイナス記号のみ許可
    if (value !== "" && !/^-?\d*$/.test(value)) {
      return;
    }
    setScores((prev) => ({ ...prev, [userId]: value }));
    setError(null);
  };

  // 合計点を計算
  const calculateTotal = (): number => {
    return Object.values(scores).reduce((sum, value) => {
      const num = parseInt(value, 10);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  // 期待される合計点
  const expectedTotal = startingPoints * playerCount;

  // 現在の合計点
  const currentTotal = calculateTotal();

  // 差分
  const difference = expectedTotal - currentTotal;

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    const scoreInputs: ScoreInput[] = [];
    for (const participant of participants) {
      const value = scores[participant.userId];
      if (value === "" || value === undefined) {
        setError(`${participant.displayName}の点数を入力してください`);
        return;
      }

      const points = parseInt(value, 10);
      if (isNaN(points)) {
        setError(`${participant.displayName}の点数が不正です`);
        return;
      }

      if (points % 100 !== 0) {
        setError(`${participant.displayName}の点数は100点単位で入力してください`);
        return;
      }

      scoreInputs.push({
        userId: participant.userId,
        points,
      });
    }

    // 合計点チェック
    const total = scoreInputs.reduce((sum, s) => sum + s.points, 0);
    if (total !== expectedTotal) {
      setError(
        `点数の合計が${expectedTotal.toLocaleString()}点になる必要があります（現在: ${total.toLocaleString()}点、差分: ${(expectedTotal - total).toLocaleString()}点）`
      );
      return;
    }

    await onSubmit(scoreInputs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingGame ? `ゲーム ${editingGame.gameNumber} を編集` : "点数を入力"}
          </DialogTitle>
          <DialogDescription>
            各プレイヤーの点数を入力してください（100点単位）
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.userId} className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor={`score-${participant.userId}`} className="text-right">
                  {participant.displayName}
                </Label>
                <Input
                  id={`score-${participant.userId}`}
                  type="text"
                  inputMode="numeric"
                  placeholder="25000"
                  value={scores[participant.userId] ?? ""}
                  onChange={(e) => handleScoreChange(participant.userId, e.target.value)}
                  className="col-span-2 tabular-nums"
                  disabled={isSubmitting}
                />
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">合計:</span>
              <span className={`tabular-nums font-medium ${currentTotal !== expectedTotal ? "text-red-600" : ""}`}>
                {currentTotal.toLocaleString()}点
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">期待値:</span>
              <span className="tabular-nums">{expectedTotal.toLocaleString()}点</span>
            </div>
            {difference !== 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">差分:</span>
                <span className={`tabular-nums font-medium ${difference !== 0 ? "text-red-600" : ""}`}>
                  {difference > 0 ? "+" : ""}{difference.toLocaleString()}点
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-md p-3">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : editingGame ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
