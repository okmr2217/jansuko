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
import { Badge } from "@/components/ui/badge";

interface SummaryPanelProps {
  games: GameWithScores[];
  participants: SectionParticipant[];
  startingPoints: number;
  returnPoints: number;
  rate: number;
}

interface PlayerSummary {
  userId: string;
  displayName: string;
  totalPoints: number;
  pointDiff: number; // 返し点からの増減
  settlement: number; // 精算額
  rank: number;
}

export function SummaryPanel({
  games,
  participants,
  startingPoints,
  returnPoints,
  rate,
}: SummaryPanelProps) {
  // 各プレイヤーの集計を計算
  const calculateSummary = (): PlayerSummary[] => {
    const summaries: PlayerSummary[] = participants.map((participant) => {
      // 全ゲームの点数合計
      const totalPoints = games.reduce((sum, game) => {
        const score = game.scores.find((s) => s.userId === participant.userId);
        return sum + (score?.points ?? 0);
      }, 0);

      // 返し点からの増減（ゲーム数 × 返し点 との差分）
      const expectedPoints = games.length * returnPoints;
      const pointDiff = totalPoints - expectedPoints;

      // 精算額の計算（1000点単位でレート換算）
      const settlement = (pointDiff / 1000) * rate;

      return {
        userId: participant.userId,
        displayName: participant.displayName,
        totalPoints,
        pointDiff,
        settlement,
        rank: 0, // 後で計算
      };
    });

    // 順位を計算（totalPointsで降順ソート）
    const sortedByPoints = [...summaries].sort(
      (a, b) => b.totalPoints - a.totalPoints
    );

    sortedByPoints.forEach((summary, index) => {
      // 同点の場合は同じ順位
      if (index > 0 && summary.totalPoints === sortedByPoints[index - 1].totalPoints) {
        summary.rank = sortedByPoints[index - 1].rank;
      } else {
        summary.rank = index + 1;
      }
    });

    // 元の順序（参加者順）で返す
    return summaries.map((s) => ({
      ...s,
      rank: sortedByPoints.find((sp) => sp.userId === s.userId)?.rank ?? 0,
    }));
  };

  const summaries = calculateSummary();

  const formatPoints = (points: number): string => {
    const prefix = points > 0 ? "+" : "";
    return prefix + points.toLocaleString();
  };

  const formatCurrency = (amount: number): string => {
    const prefix = amount > 0 ? "+" : "";
    return prefix + amount.toLocaleString() + "円";
  };

  const getRankBadgeVariant = (rank: number): "default" | "secondary" | "outline" => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      default:
        return "outline";
    }
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ゲームが記録されると集計が表示されます
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
        <div>
          <span className="font-medium">ゲーム数:</span> {games.length}
        </div>
        <div>
          <span className="font-medium">開始点:</span> {startingPoints.toLocaleString()}点
        </div>
        <div>
          <span className="font-medium">返し点:</span> {returnPoints.toLocaleString()}点
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">順位</TableHead>
              <TableHead>名前</TableHead>
              <TableHead className="text-right">合計点</TableHead>
              <TableHead className="text-right">増減</TableHead>
              {rate > 0 && <TableHead className="text-right">精算額</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaries
              .sort((a, b) => a.rank - b.rank)
              .map((summary) => (
                <TableRow key={summary.userId}>
                  <TableCell>
                    <Badge variant={getRankBadgeVariant(summary.rank)}>
                      {summary.rank}位
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {summary.displayName}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {summary.totalPoints.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${
                      summary.pointDiff < 0 ? "text-red-600" : summary.pointDiff > 0 ? "text-green-600" : ""
                    }`}
                  >
                    {formatPoints(summary.pointDiff)}
                  </TableCell>
                  {rate > 0 && (
                    <TableCell
                      className={`text-right tabular-nums font-medium ${
                        summary.settlement < 0 ? "text-red-600" : summary.settlement > 0 ? "text-green-600" : ""
                      }`}
                    >
                      {formatCurrency(summary.settlement)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
