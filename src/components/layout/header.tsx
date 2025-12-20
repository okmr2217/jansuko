"use client";

import Link from "next/link";
import { Navigation } from "./navigation";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import type { SessionUser } from "@/lib/auth/session";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  user: SessionUser;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {process.env.NODE_ENV === "development" && (
        <div className="bg-secondary py-1 text-secondary-foreground text-xs text-center tracking-wide">
          開発環境
        </div>
      )}
      <div className="text-center bg-primary text-sm"></div>
      <div className="container max-w-3xl flex h-14 items-center mx-auto px-4">
        <div className="mr-8 flex">
          <Link href="/sections" className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold">
              じゃん<span className="text-primary">スコ</span>
            </h1>
          </Link>
        </div>
        <div className="hidden md:flex md:flex-1">
          <Navigation />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-3">
          <ThemeToggle />
          <UserMenu user={user} />
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
