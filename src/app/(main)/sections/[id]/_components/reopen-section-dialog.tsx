"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReopenSectionDialogProps {
  sectionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isReopening: boolean;
}

export function ReopenSectionDialog({
  sectionName,
  open,
  onOpenChange,
  onConfirm,
  isReopening,
}: ReopenSectionDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>セクションを再開</DialogTitle>
          <DialogDescription>
            「{sectionName}
            」を進行中に戻しますか？再開後は点数の入力・修正・削除が可能になります。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isReopening}
          >
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={isReopening}>
            {isReopening ? "処理中..." : "再開する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
