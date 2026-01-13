import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { getUsers } from "@/lib/db/queries/users";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const users = await getUsers();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Image
        src="/login-background.png"
        alt=""
        fill
        className="object-cover -z-10 md:hidden"
        priority
      />
      <Image
        src="/login-background-md.png"
        alt=""
        fill
        className="object-cover -z-10 hidden md:block"
        priority
      />
      <Card className="w-full max-w-sm bg-background/90 backdrop-blur">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <h1 className="text-3xl font-extrabold">
              <span className="text-destructive">じ</span>
              ゃん
              <span className="text-primary">スコ</span>
            </h1>
          </div>
          <CardDescription className="text-center">
            雀士とパスワードでログイン
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
