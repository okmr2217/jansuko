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

interface CloseSectionDialogProps {
  sectionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isClosing: boolean;
}

export function CloseSectionDialog({
  sectionName,
  open,
  onOpenChange,
  onConfirm,
  isClosing,
}: CloseSectionDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>セクションを終了</DialogTitle>
          <DialogDescription>
            「{sectionName}
            」を終了しますか？終了後は点数の入力・修正・削除ができなくなります。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isClosing}
          >
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={isClosing}>
            {isClosing ? "処理中..." : "終了する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
