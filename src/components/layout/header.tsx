"use client";

import Link from "next/link";
import Image from "next/image";
import { Navigation } from "./navigation";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import type { SessionUser } from "@/lib/auth/session";

interface HeaderProps {
  user: SessionUser;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl flex h-14 items-center mx-auto px-4">
        <div className="mr-4 flex">
          <Link href="/sections" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="じゃんスコ"
              width={96}
              height={32}
              priority
            />
          </Link>
        </div>
        <div className="hidden md:flex md:flex-1">
          <Navigation />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserMenu user={user} />
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
