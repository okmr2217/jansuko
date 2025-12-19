"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { login } from "../actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

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
            <h1 className="text-3xl font-extrabold">じゃん<span className="text-primary">スコ</span></h1>
          </div>
          <CardDescription className="text-center">
            表示名とパスワードでログイン
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="表示名を入力"
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="パスワードを入力"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
