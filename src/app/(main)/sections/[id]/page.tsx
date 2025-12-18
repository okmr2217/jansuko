import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sections">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">戻る</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            セクション詳細
          </h1>
          <p className="text-muted-foreground">ID: {id}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>スコアボード</CardTitle>
          <CardDescription>
            ゲームごとの点数を記録・表示します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            フェーズ7で実装予定
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
