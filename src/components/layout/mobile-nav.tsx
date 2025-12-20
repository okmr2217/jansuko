"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutGrid,
  Users,
  BarChart3,
  HelpCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const navItems = [
  {
    title: "セクション",
    href: "/sections",
    icon: LayoutGrid,
  },
  {
    title: "雀士一覧",
    href: "/users",
    icon: Users,
  },
  {
    title: "統計",
    href: "/stats",
    icon: BarChart3,
  },
  {
    title: "ヘルプ",
    href: "/help",
    icon: HelpCircle,
  },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useIsMounted();
  const pathname = usePathname();

  const drawerContent = isOpen ? (
    <>
      <div
        className="fixed inset-0 z-50 bg-background/20 backdrop-blur-sm md:hidden"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-3/4 max-w-sm bg-background p-6 shadow-lg md:hidden">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-semibold">メニュー</span>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">閉じる</span>
          </Button>
        </div>
        <nav className="flex flex-col space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  ) : null;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">メニューを開く</span>
      </Button>

      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
