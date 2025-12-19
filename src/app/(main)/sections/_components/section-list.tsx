"use client";

import Link from "next/link";
import { SectionListItem } from "@/lib/db/queries/sections";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Hash } from "lucide-react";

interface SectionListProps {
  sections: SectionListItem[];
  currentUserId?: string;
}

export function SectionList({ sections, currentUserId }: SectionListProps) {
  if (sections.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          セクションがまだありません。新しいセクションを作成してください。
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((section) => (
        <Link key={section.id} href={`/sections/${section.id}`}>
          <Card className="h-full transition-colors hover:bg-accent/50 gap-4">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{section.name}</CardTitle>
                <Badge
                  variant={section.status === "active" ? "default" : "secondary"}
                >
                  {section.status === "active" ? "進行中" : "終了"}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(section.createdAt).toLocaleDateString("ja-JP")}
                {section.createdByName && (
                  <span className="ml-2">作成者: {section.createdByName}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {section.participants.map((p) => p.displayName).join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  <span>{section.gameCount}ゲーム</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>開始点: {section.startingPoints.toLocaleString()}</span>
                <span>返し: {section.returnPoints.toLocaleString()}</span>
                <span>レート: {section.rate}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
