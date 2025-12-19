import { getHelpContentHtml } from "@/lib/help";

export default async function HelpPage() {
  const helpHtml = await getHelpContentHtml();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ヘルプ</h1>
        <p className="text-muted-foreground">
          じゃんスコの使い方ガイドです。
        </p>
      </div>
      <article
        className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-table:text-sm prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-table:border prose-th:border prose-td:border"
        dangerouslySetInnerHTML={{ __html: helpHtml }}
      />
    </div>
  );
}
