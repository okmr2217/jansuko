import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getSections } from "@/lib/db/queries/sections";
import { SectionsRealtimeWrapper } from "./_components/sections-realtime-wrapper";
import { SectionStatus } from "@/lib/db/queries/sections";
import { PageHeader } from "@/components/common/page-header";

interface SectionsPageProps {
  searchParams: Promise<{
    status?: SectionStatus;
    search?: string;
    sort?: "asc" | "desc";
  }>;
}

export default async function SectionsPage({ searchParams }: SectionsPageProps) {
  const session = await getSession();
  const params = await searchParams;

  const sections = await getSections({
    status: params.status,
    search: params.search,
    sortOrder: params.sort ?? "desc",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="🀄 セクション一覧" description="麻雀セクションの管理と点数記録" />
        <div>
          <Button asChild>
            <Link href="/sections/new">
              <Plus className="mr-2 h-4 w-4" />
              新規セクション
            </Link>
          </Button>
        </div>
      </div>
      <SectionsRealtimeWrapper
        initialSections={sections}
        currentUserId={session?.id}
        filters={{
          status: params.status,
          search: params.search,
          sort: params.sort ?? "desc",
        }}
      />
    </div>
  );
}
