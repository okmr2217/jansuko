import { getSession } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await getSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">アカウント設定</h1>
        <p className="text-muted-foreground">
          アカウント情報の確認と変更
        </p>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
            <CardDescription>
              表示名の変更
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">現在の表示名</p>
              <p className="font-medium">{user?.displayName}</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              フェーズ9で編集機能を実装予定
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>パスワード変更</CardTitle>
            <CardDescription>
              パスワードの更新
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              フェーズ9で実装予定
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
