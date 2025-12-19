"use client";

import { GameWithScores } from "@/lib/db/queries/games";
import { SectionParticipant } from "@/lib/db/queries/sections";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ScoreBoardProps {
  games: GameWithScores[];
  participants: SectionParticipant[];
  isActive: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEditGame: (game: GameWithScores) => void;
  onDeleteGame: (gameId: string) => void;
}

export function ScoreBoard({
  games,
  participants,
  isActive,
  canEdit,
  canDelete,
  onEditGame,
  onDeleteGame,
}: ScoreBoardProps) {
  // 参加者順にスコアをソート
  const getScoreForUser = (game: GameWithScores, userId: string): number => {
    const score = game.scores.find((s) => s.userId === userId);
    return score?.points ?? 0;
  };

  const formatPoints = (points: number): string => {
    if (points >= 0) {
      return points.toLocaleString();
    }
    return points.toLocaleString();
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        まだゲームが記録されていません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">#</TableHead>
            {participants.map((participant) => (
              <TableHead key={participant.userId} className="text-center min-w-24">
                {participant.displayName}
              </TableHead>
            ))}
            {isActive && (canEdit || canDelete) && (
              <TableHead className="w-20 text-center">操作</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game) => (
            <TableRow key={game.id}>
              <TableCell className="text-center font-medium">
                {game.gameNumber}
              </TableCell>
              {participants.map((participant) => {
                const points = getScoreForUser(game, participant.userId);
                return (
                  <TableCell
                    key={participant.userId}
                    className={`text-center tabular-nums ${
                      points < 0 ? "text-red-600" : ""
                    }`}
                  >
                    {formatPoints(points)}
                  </TableCell>
                );
              })}
              {isActive && (canEdit || canDelete) && (
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditGame(game)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">編集</span>
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDeleteGame(game.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">削除</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
