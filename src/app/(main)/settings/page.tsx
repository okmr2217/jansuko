import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { DisplayNameForm } from "./_components/display-name-form";
import { PasswordForm } from "./_components/password-form";

export default async function SettingsPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="アカウント設定"
        description="アカウント情報の確認と変更"
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
            <CardDescription>表示名の変更</CardDescription>
          </CardHeader>
          <CardContent>
            <DisplayNameForm currentDisplayName={user.displayName} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>パスワード変更</CardTitle>
            <CardDescription>パスワードの更新</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
