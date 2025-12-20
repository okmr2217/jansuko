import { createAdminClient } from "@/lib/supabase/server";

export interface DateRange {
  from?: string; // ISO string (YYYY-MM-DD)
  to?: string; // ISO string (YYYY-MM-DD)
}

export interface UserStats {
  userId: string;
  displayName: string;
  gameCount: number;
  sectionCount: number;
  winCount: number; // 1位の回数
  winRate: number; // 勝率 (0-100)
  averageRank: number; // 平均順位
  totalSettlement: number; // 通算精算額
  rankCounts: {
    first: number;
    second: number;
    third: number;
    fourth: number;
  };
}

export interface StatsResult {
  users: UserStats[];
  totalGames: number;
  totalSections: number;
}

/**
 * 期間を指定して全ユーザーの統計を取得する
 */
export async function getStats(dateRange?: DateRange): Promise<StatsResult> {
  const supabase = createAdminClient();

  // 終了したセクションのみを対象とする
  let sectionsQuery = supabase
    .from("sections")
    .select(
      `
      id,
      starting_points,
      return_points,
      rate,
      player_count,
      closed_at,
      section_participants(
        user_id,
        user:users(id, display_name)
      ),
      games(
        id,
        scores(
          user_id,
          points
        )
      )
    `,
    )
    .eq("status", "closed");

  // 期間フィルター
  if (dateRange?.from) {
    sectionsQuery = sectionsQuery.gte("closed_at", dateRange.from);
  }
  if (dateRange?.to) {
    // toの日付の翌日の0時までを含める
    const toDate = new Date(dateRange.to);
    toDate.setDate(toDate.getDate() + 1);
    sectionsQuery = sectionsQuery.lt("closed_at", toDate.toISOString());
  }

  const { data: sections, error } = await sectionsQuery;

  if (error) {
    throw new Error(`統計データの取得に失敗しました: ${error.message}`);
  }

  // ユーザーごとの統計を集計
  const userStatsMap = new Map<
    string,
    {
      displayName: string;
      games: Array<{ rank: number; settlement: number }>;
      sectionIds: Set<string>;
    }
  >();

  let totalGames = 0;
  const sectionIds = new Set<string>();

  for (const section of sections) {
    sectionIds.add(section.id);

    const games = section.games as Array<{
      id: string;
      scores: Array<{ user_id: string; points: number }>;
    }>;

    const participants = section.section_participants as Array<{
      user_id: string;
      user: { id: string; display_name: string } | null;
    }>;

    // 参加者をマップに追加
    for (const participant of participants) {
      if (!participant.user) continue;
      if (!userStatsMap.has(participant.user_id)) {
        userStatsMap.set(participant.user_id, {
          displayName: participant.user.display_name,
          games: [],
          sectionIds: new Set(),
        });
      }
      userStatsMap.get(participant.user_id)!.sectionIds.add(section.id);
    }

    // 各ゲームの処理
    for (const game of games) {
      totalGames++;

      // スコアを点数順にソートして順位を決定
      const sortedScores = [...game.scores].sort((a, b) => b.points - a.points);

      // 各プレイヤーの順位を計算
      const rankMap = new Map<string, number>();
      let currentRank = 1;
      for (let i = 0; i < sortedScores.length; i++) {
        if (i > 0 && sortedScores[i].points === sortedScores[i - 1].points) {
          // 同点の場合は同じ順位
          rankMap.set(
            sortedScores[i].user_id,
            rankMap.get(sortedScores[i - 1].user_id)!,
          );
        } else {
          rankMap.set(sortedScores[i].user_id, currentRank);
        }
        currentRank++;
      }

      // 各プレイヤーのゲーム結果を記録
      for (const score of game.scores) {
        const userData = userStatsMap.get(score.user_id);
        if (!userData) continue;

        const rank = rankMap.get(score.user_id) ?? 0;

        // 精算額の計算
        // 返し点からの増減を計算
        const pointDiff = score.points - section.return_points;
        const settlement = (pointDiff / 1000) * section.rate;

        userData.games.push({ rank, settlement });
      }
    }
  }

  // 統計を計算
  const users: UserStats[] = [];

  for (const [userId, userData] of userStatsMap) {
    const gameCount = userData.games.length;
    const sectionCount = userData.sectionIds.size;

    if (gameCount === 0) {
      continue;
    }

    const rankCounts = {
      first: userData.games.filter((g) => g.rank === 1).length,
      second: userData.games.filter((g) => g.rank === 2).length,
      third: userData.games.filter((g) => g.rank === 3).length,
      fourth: userData.games.filter((g) => g.rank === 4).length,
    };

    const winCount = rankCounts.first;
    const winRate = gameCount > 0 ? (winCount / gameCount) * 100 : 0;

    const totalRank = userData.games.reduce((sum, g) => sum + g.rank, 0);
    const averageRank = gameCount > 0 ? totalRank / gameCount : 0;

    const totalSettlement = userData.games.reduce(
      (sum, g) => sum + g.settlement,
      0,
    );

    users.push({
      userId,
      displayName: userData.displayName,
      gameCount,
      sectionCount,
      winCount,
      winRate,
      averageRank,
      totalSettlement,
      rankCounts,
    });
  }

  // 通算精算額で降順ソート
  users.sort((a, b) => b.totalSettlement - a.totalSettlement);

  return {
    users,
    totalGames,
    totalSections: sectionIds.size,
  };
}

/**
 * 特定ユーザーの統計を取得する
 */
export async function getUserStats(
  userId: string,
  dateRange?: DateRange,
): Promise<UserStats | null> {
  const result = await getStats(dateRange);
  return result.users.find((u) => u.userId === userId) ?? null;
}
