import { StatsResult } from "@/lib/db/queries/stats";

interface StatsCardsProps {
  stats: StatsResult;
  currentUserId?: string;
}

function StatsCard({
  description,
  title,
  content,
}: {
  description: string;
  title: React.ReactNode;
  content: string;
}) {
  return (
    <div>
      <div className="text-sm text-muted-foreground mb-1">{description}</div>
      <div className="text-3xl font-bold mb-2">{title}</div>
      <div className="text-xs text-muted-foreground">{content}</div>
    </div>
  );
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
      <div className="grid gap-y-8 grid-cols-2 md:grid-cols-4">
        <StatsCard description="勝率" title="--%" content="1位の割合" />
        <StatsCard description="平均順位" title="--" content="全ゲームの平均" />
        <StatsCard description="通算収支" title="--" content="精算額の合計" />
        <StatsCard
          description="参加ゲーム数"
          title="--"
          content="累計ゲーム数"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-y-8 grid-cols-2 md:grid-cols-4">
      <StatsCard
        description="勝率"
        title={formatPercent(currentUserStats.winRate)}
        content={`1位: ${currentUserStats.winCount}回 / ${currentUserStats.gameCount}ゲーム`}
      />
      <StatsCard
        description="平均順位"
        title={formatRank(currentUserStats.averageRank)}
        content={`1位:${currentUserStats.rankCounts.first} 2位:${currentUserStats.rankCounts.second} 3位:${currentUserStats.rankCounts.third} 4位:${currentUserStats.rankCounts.fourth}`}
      />
      <StatsCard
        description="通算収支"
        title={
          <span
            className={
              currentUserStats.totalSettlement < 0
                ? "text-red-600"
                : currentUserStats.totalSettlement > 0
                ? "text-green-600"
                : ""
            }
          >
            {formatCurrency(currentUserStats.totalSettlement)}
          </span>
        }
        content="精算額の合計"
      />
      <StatsCard
        description="参加ゲーム数"
        title={currentUserStats.gameCount}
        content={`${currentUserStats.sectionCount}セクション参加`}
      />
    </div>
  );
}
