import { getSession } from "@/lib/auth/session";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function UsersPage() {
  const user = await getSession();
  const isAdmin = user?.isAdmin ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">雀士一覧</h1>
          <p className="text-muted-foreground">
            登録されている雀士の管理
          </p>
        </div>
        {isAdmin && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            雀士を追加
          </Button>
        )}
      </div>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          フェーズ5で実装予定
        </p>
      </div>
    </div>
  );
}
