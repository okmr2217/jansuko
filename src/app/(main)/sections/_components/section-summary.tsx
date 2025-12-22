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
import { calculateSummary } from "../[id]/_components/summary-panel";

interface SectionSummary {
  games: GameWithScores[];
  participants: SectionParticipant[];
  returnPoints: number;
  rate: number;
}

export function SectionSummary({
  games,
  participants,
  returnPoints,
  rate,
}: SectionSummary) {
  const summaries = calculateSummary(games, participants, returnPoints, rate);

  const getRankBadgeVariant = (
    rank: number
  ): "default" | "secondary" | "outline" => {
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
      <div className="text-center py-2 text-muted-foreground">
        ゲームが記録されると集計が表示されます
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {summaries.map((summary) => (
            <TableHead key={summary.userId}>{summary.displayName}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          {summaries.map((summary) => (
            <TableCell key={summary.userId} className="tabular-nums">
              {summary.totalPoints.toLocaleString()}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          {summaries.map((summary) => (
            <TableCell key={summary.userId}>
              <Badge variant={getRankBadgeVariant(summary.rank)}>
                {summary.rank}位
              </Badge>
            </TableCell>
          ))}
        </TableRow>
      </TableBody>
    </Table>
  );
}
