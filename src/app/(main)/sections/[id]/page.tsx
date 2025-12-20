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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/sections" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            一覧に戻る
          </Link>
        </Button>
      </div>

      <SectionDetailClient section={section} initialGames={games} user={user} />
    </div>
  );
}
