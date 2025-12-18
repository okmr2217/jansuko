import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle>ページが見つかりません</CardTitle>
          <CardDescription>
            お探しのページは存在しないか、移動された可能性があります。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/sections">セクション一覧へ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
