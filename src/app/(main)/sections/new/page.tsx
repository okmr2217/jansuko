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

export default function NewSectionPage() {
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
            新規セクション作成
          </h1>
          <p className="text-muted-foreground">
            新しい麻雀セクションを作成します
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>セクション情報</CardTitle>
          <CardDescription>
            セクションの設定を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            フェーズ6で実装予定
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
