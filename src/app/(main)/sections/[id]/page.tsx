import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getSection } from "@/lib/db/queries/sections";
import { getGamesWithScores } from "@/lib/db/queries/games";
import { SectionDetailClient } from "./_components/section-detail-client";

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // セッションを取得
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  // セクションを取得
  const section = await getSection(id);
  if (!section) {
    notFound();
  }

  // ゲーム一覧を取得
  const games = await getGamesWithScores(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sections">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">戻る</span>
          </Link>
        </Button>
      </div>

      <SectionDetailClient
        section={section}
        initialGames={games}
        user={user}
      />
    </div>
  );
}
