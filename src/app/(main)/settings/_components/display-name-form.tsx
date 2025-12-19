"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDisplayNameAction } from "../actions";

interface DisplayNameFormProps {
  currentDisplayName: string;
}

export function DisplayNameForm({ currentDisplayName }: DisplayNameFormProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData();
    formData.set("displayName", displayName);

    const result = await updateDisplayNameAction(formData);

    if (result.success) {
      toast.success("表示名を更新しました");
    } else {
      toast.error(result.error || "エラーが発生しました");
    }

    setIsPending(false);
  };

  const isChanged = displayName !== currentDisplayName;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">表示名</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="表示名を入力"
          maxLength={50}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending || !isChanged || !displayName}>
        {isPending ? "更新中..." : "表示名を変更"}
      </Button>
    </form>
  );
}
