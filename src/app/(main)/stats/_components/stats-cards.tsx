import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsResult } from "@/lib/db/queries/stats";

interface StatsCardsProps {
  stats: StatsResult;
  currentUserId?: string;
}

export function StatsCards({ stats, currentUserId }: StatsCardsProps) {
  // ログインユーザーの統計を取得
  const currentUserStats = currentUserId
    ? stats.users.find((u) => u.userId === currentUserId)
    : null;

  const formatPercent = (value: number): string => {
    return value.toFixed(1) + "%";
  };

  const formatRank = (value: number): string => {
    return value.toFixed(2);
  };

  const formatCurrency = (amount: number): string => {
    const prefix = amount > 0 ? "+" : "";
    return prefix + Math.round(amount).toLocaleString() + "円";
  };

  if (!currentUserStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>勝率</CardDescription>
            <CardTitle className="text-3xl">--%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">1位の割合</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>平均順位</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">全ゲームの平均</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>通算収支</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">精算額の合計</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>参加ゲーム数</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">累計ゲーム数</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>勝率</CardDescription>
          <CardTitle className="text-3xl">
            {formatPercent(currentUserStats.winRate)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            1位: {currentUserStats.winCount}回 / {currentUserStats.gameCount}ゲーム
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>平均順位</CardDescription>
          <CardTitle className="text-3xl">
            {formatRank(currentUserStats.averageRank)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            1位:{currentUserStats.rankCounts.first} 2位:{currentUserStats.rankCounts.second} 3位:{currentUserStats.rankCounts.third} 4位:{currentUserStats.rankCounts.fourth}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>通算収支</CardDescription>
          <CardTitle
            className={`text-3xl ${
              currentUserStats.totalSettlement < 0
                ? "text-red-600"
                : currentUserStats.totalSettlement > 0
                ? "text-green-600"
                : ""
            }`}
          >
            {formatCurrency(currentUserStats.totalSettlement)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">精算額の合計</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>参加ゲーム数</CardDescription>
          <CardTitle className="text-3xl">
            {currentUserStats.gameCount}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {currentUserStats.sectionCount}セクション参加
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
