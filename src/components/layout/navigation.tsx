"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutGrid, Users, BarChart3, HelpCircle } from "lucide-react";

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

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
