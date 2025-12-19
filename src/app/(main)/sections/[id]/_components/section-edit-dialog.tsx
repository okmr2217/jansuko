"use client";

import { useState, useEffect } from "react";
import { SectionListItem } from "@/lib/db/queries/sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STARTING_POINTS_OPTIONS,
  RETURN_POINTS_OPTIONS,
  RATE_OPTIONS,
} from "@/lib/validations/section";

interface SectionEditDialogProps {
  section: SectionListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function SectionEditDialog({
  section,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: SectionEditDialogProps) {
  const [name, setName] = useState(section.name);
  const [startingPoints, setStartingPoints] = useState(String(section.startingPoints));
  const [returnPoints, setReturnPoints] = useState(String(section.returnPoints));
  const [rate, setRate] = useState(String(section.rate));
  const [error, setError] = useState<string | null>(null);

  // ダイアログが開いたときに値をリセット
  useEffect(() => {
    if (open) {
      setName(section.name);
      setStartingPoints(String(section.startingPoints));
      setReturnPoints(String(section.returnPoints));
      setRate(String(section.rate));
      setError(null);
    }
  }, [open, section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("セクション名を入力してください");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("startingPoints", startingPoints);
    formData.set("returnPoints", returnPoints);
    formData.set("rate", rate);

    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>セクションを編集</DialogTitle>
          <DialogDescription>
            セクションの設定を変更します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">セクション名</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 2024年12月 定例会"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startingPoints">開始点</Label>
            <Select
              value={startingPoints}
              onValueChange={setStartingPoints}
              disabled={isSubmitting}
            >
              <SelectTrigger id="startingPoints">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STARTING_POINTS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnPoints">返し点</Label>
            <p className="text-sm text-muted-foreground">
              順位点計算の基準となる点数
            </p>
            <Select
              value={returnPoints}
              onValueChange={setReturnPoints}
              disabled={isSubmitting}
            >
              <SelectTrigger id="returnPoints">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RETURN_POINTS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">レート</Label>
            <Select value={rate} onValueChange={setRate} disabled={isSubmitting}>
              <SelectTrigger id="rate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-md p-3">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
