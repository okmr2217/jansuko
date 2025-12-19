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

interface DeleteSectionDialogProps {
  sectionName: string;
  gameCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteSectionDialog({
  sectionName,
  gameCount,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteSectionDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>セクションを削除</DialogTitle>
          <DialogDescription>
            「{sectionName}」を削除しますか？
            {gameCount > 0 && (
              <>
                <br />
                <span className="text-red-600 font-medium">
                  このセクションには{gameCount}件のゲームが記録されています。
                </span>
              </>
            )}
            <br />
            この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "削除中..." : "削除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
