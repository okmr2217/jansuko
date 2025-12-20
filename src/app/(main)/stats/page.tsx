import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/auth/session";
import { getStats, DateRange } from "@/lib/db/queries/stats";
import { PeriodSelector, PeriodType } from "./_components/period-selector";
import { StatsCards } from "./_components/stats-cards";
import { UsersRankingTable } from "./_components/users-ranking-table";

interface StatsPageProps {
  searchParams: Promise<{
    period?: string;
    from?: string;
    to?: string;
  }>;
}

function StatsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function StatsContent({ from, to }: { from?: string; to?: string }) {
  const user = await getSession();

  // 期間をDateRangeに変換
  const dateRange: DateRange | undefined =
    from || to ? { from, to } : undefined;

  const stats = await getStats(dateRange);

  return (
    <>
      <StatsCards stats={stats} currentUserId={user?.id} />

      <Card>
        <CardHeader>
          <CardTitle>雀士ランキング</CardTitle>
          <CardDescription>
            {stats.totalSections}セクション / {stats.totalGames}ゲームの統計
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersRankingTable stats={stats} currentUserId={user?.id} />
        </CardContent>
      </Card>
    </>
  );
}

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const params = await searchParams;
  const period = (params.period as PeriodType) || "all";
  const from = params.from;
  const to = params.to;

  return (
    <div className="space-y-6">
      <PageHeader title="統計" description="雀士の成績統計と分析" />
      <PeriodSelector period={period} from={from} to={to} />
      <Suspense fallback={<StatsLoading />}>
        <StatsContent from={from} to={to} />
      </Suspense>
    </div>
  );
}
