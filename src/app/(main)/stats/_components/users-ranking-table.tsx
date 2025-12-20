import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatsResult } from "@/lib/db/queries/stats";

interface UsersRankingTableProps {
  stats: StatsResult;
  currentUserId?: string;
}

export function UsersRankingTable({ stats, currentUserId }: UsersRankingTableProps) {
  const formatPercent = (value: number): string => {
    return value.toFixed(1) + "%";
  };

  const formatRank = (value: number): string => {
    return value.toFixed(2);
  };

  const formatCurrency = (amount: number): string => {
    const prefix = amount > 0 ? "+" : "";
    return prefix + Math.round(amount).toLocaleString();
  };

  const getRankBadgeVariant = (
    index: number
  ): "default" | "secondary" | "outline" => {
    switch (index) {
      case 0:
        return "default";
      case 1:
        return "secondary";
      default:
        return "outline";
    }
  };

  if (stats.users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        統計データがありません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">順位</TableHead>
            <TableHead>名前</TableHead>
            <TableHead className="text-right">ゲーム数</TableHead>
            <TableHead className="text-right">勝率</TableHead>
            <TableHead className="text-right">平均順位</TableHead>
            <TableHead className="text-right">通算収支</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.users.map((user, index) => (
            <TableRow
              key={user.userId}
              className={user.userId === currentUserId ? "bg-muted/50" : ""}
            >
              <TableCell>
                <Badge variant={getRankBadgeVariant(index)}>{index + 1}位</Badge>
              </TableCell>
              <TableCell className="font-medium">
                {user.displayName}
                {user.userId === currentUserId && (
                  <span className="ml-2 text-xs text-muted-foreground">(自分)</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {user.gameCount}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPercent(user.winRate)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatRank(user.averageRank)}
              </TableCell>
              <TableCell
                className={`text-right tabular-nums font-medium ${
                  user.totalSettlement < 0
                    ? "text-red-600"
                    : user.totalSettlement > 0
                    ? "text-green-600"
                    : ""
                }`}
              >
                {formatCurrency(user.totalSettlement)}円
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
