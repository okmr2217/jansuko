import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SectionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">セクション一覧</h1>
          <p className="text-muted-foreground">
            麻雀セクションの管理と点数記録
          </p>
        </div>
        <Button asChild>
          <Link href="/sections/new">
            <Plus className="mr-2 h-4 w-4" />
            新規セクション
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          セクションがまだありません。新しいセクションを作成してください。
        </p>
      </div>
    </div>
  );
}
