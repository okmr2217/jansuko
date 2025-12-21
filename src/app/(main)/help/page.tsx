import { PageHeader } from "@/components/common/page-header";
import { getHelpContentHtml } from "@/lib/help";

export default async function HelpPage() {
  const helpHtml = await getHelpContentHtml();

  return (
    <div className="space-y-6 scroll-pt-24">
      <PageHeader title="❓ ヘルプ" description="使い方ガイド" />
      <article
        className="prose prose-sm sm:prose-base max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: helpHtml }}
      />
    </div>
  );
}
