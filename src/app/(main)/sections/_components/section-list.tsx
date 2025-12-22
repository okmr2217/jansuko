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
import { Calendar, Gamepad2 } from "lucide-react";
import { ParticipantList } from "./participant-list";
import { SectionSummary } from "./section-summary";

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
          <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 gap-2">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl font-bold leading-tight transition-colors">
                  {section.name}
                </CardTitle>
                <Badge
                  variant={
                    section.status === "active" ? "default" : "secondary"
                  }
                >
                  {section.status === "active" ? "進行中" : "終了"}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(section.createdAt).toLocaleDateString("ja-JP")}
                </span>
                {section.createdByName && (
                  <>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{section.createdByName}</span>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* <ParticipantList participants={section.participants} /> */}
              <SectionSummary
                games={section.games!}
                participants={section.participants}
                returnPoints={section.returnPoints}
                rate={section.rate}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Gamepad2 className="h-4 w-4 text-primary" />
                  <span>{section.games ? section.games.length : 0}ゲーム</span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>開始: {section.startingPoints.toLocaleString()}点</span>
                  <span>返し: {section.returnPoints.toLocaleString()}</span>
                  <span>R: {section.rate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
