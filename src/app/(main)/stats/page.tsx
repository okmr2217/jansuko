import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">統計</h1>
        <p className="text-muted-foreground">
          雀士の成績統計と分析
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>勝率</CardDescription>
            <CardTitle className="text-3xl">--%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              1位の割合
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>平均順位</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              全ゲームの平均
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>通算収支</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              精算額の合計
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>参加ゲーム数</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              累計ゲーム数
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>詳細統計</CardTitle>
          <CardDescription>
            期間別の統計データ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            フェーズ8で実装予定
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
