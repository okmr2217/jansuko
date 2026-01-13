"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Lock, Unlock, Pencil, Trash2 } from "lucide-react";
import { SectionListItem } from "@/lib/db/queries/sections";
import { GameWithScores } from "@/lib/db/queries/games";
import { SessionUser } from "@/lib/auth/session";
import { ScoreInput } from "@/lib/validations/game";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBoard } from "./score-board";
import { SummaryPanel } from "./summary-panel";
import { ScoreInputForm } from "./score-input-form";
import { SectionEditDialog } from "./section-edit-dialog";
import { DeleteGameDialog } from "./delete-game-dialog";
import { CloseSectionDialog } from "./close-section-dialog";
import { ReopenSectionDialog } from "./reopen-section-dialog";
import { DeleteSectionDialog } from "./delete-section-dialog";
import {
  createGameAction,
  updateGameAction,
  deleteGameAction,
  fetchGamesAction,
} from "../actions";
import {
  updateSectionAction,
  closeSectionAction,
  reopenSectionAction,
  deleteSectionAction,
} from "../../actions";

interface SectionDetailClientProps {
  section: SectionListItem;
  initialGames: GameWithScores[];
  user: SessionUser;
}

export function SectionDetailClient({
  section,
  initialGames,
  user,
}: SectionDetailClientProps) {
  const router = useRouter();
  const [games, setGames] = useState<GameWithScores[]>(initialGames);
  const [currentSection, setCurrentSection] =
    useState<SectionListItem>(section);

  // モーダル状態
  const [isScoreFormOpen, setIsScoreFormOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
  const [isDeleteSectionDialogOpen, setIsDeleteSectionDialogOpen] =
    useState(false);

  // 編集中・削除中のゲーム
  const [editingGame, setEditingGame] = useState<GameWithScores | null>(null);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const [deletingGameNumber, setDeletingGameNumber] = useState<number>(0);

  // ローディング状態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [isDeletingSection, setIsDeletingSection] = useState(false);

  // 権限チェック
  const isParticipant = currentSection.participants.some(
    (p) => p.userId === user.id
  );
  const isCreator = currentSection.createdBy === user.id;
  const canEdit = isParticipant || user.isAdmin;
  const canDelete = isCreator || user.isAdmin;
  const isActive = currentSection.status === "active";

  // ゲームデータを再取得
  const refreshGames = useCallback(async () => {
    try {
      const newGames = await fetchGamesAction(section.id);
      setGames(newGames);
    } catch {
      console.error("ゲームの取得に失敗しました");
    }
  }, [section.id]);

  // 点数入力ダイアログを開く（新規）
  const handleAddGame = () => {
    setEditingGame(null);
    setIsScoreFormOpen(true);
  };

  // 点数編集ダイアログを開く
  const handleEditGame = (game: GameWithScores) => {
    setEditingGame(game);
    setIsScoreFormOpen(true);
  };

  // 削除ダイアログを開く
  const handleDeleteGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (game) {
      setDeletingGameId(gameId);
      setDeletingGameNumber(game.gameNumber);
      setIsDeleteDialogOpen(true);
    }
  };

  // 点数を送信
  const handleScoreSubmit = async (scores: ScoreInput[]) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingGame) {
        result = await updateGameAction(section.id, editingGame.id, scores);
      } else {
        result = await createGameAction(section.id, scores);
      }

      if (result.success) {
        toast.success(
          editingGame ? "点数を更新しました" : "点数を追加しました"
        );
        setIsScoreFormOpen(false);
        setEditingGame(null);
        await refreshGames();
      } else {
        toast.error(result.error || "エラーが発生しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ゲームを削除
  const handleDeleteConfirm = async () => {
    if (!deletingGameId) return;

    setIsDeleting(true);
    try {
      const result = await deleteGameAction(section.id, deletingGameId);

      if (result.success) {
        toast.success("ゲームを削除しました");
        setIsDeleteDialogOpen(false);
        setDeletingGameId(null);
        await refreshGames();
      } else {
        toast.error(result.error || "削除に失敗しました");
      }
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setIsDeleting(false);
    }
  };

  // セクションを編集
  const handleSectionEdit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateSectionAction(section.id, formData);

      if (result.success) {
        toast.success("セクションを更新しました");
        setIsEditDialogOpen(false);
        // セクション情報を更新
        setCurrentSection((prev) => ({
          ...prev,
          name: formData.get("name") as string,
          startingPoints: Number(formData.get("startingPoints")),
          returnPoints: Number(formData.get("returnPoints")),
          rate: Number(formData.get("rate")),
        }));
      } else {
        toast.error(result.error || "更新に失敗しました");
      }
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // セクションを終了
  const handleCloseSection = async () => {
    setIsClosing(true);
    try {
      const result = await closeSectionAction(section.id);

      if (result.success) {
        toast.success("セクションを終了しました");
        setIsCloseDialogOpen(false);
        setCurrentSection((prev) => ({
          ...prev,
          status: "closed" as const,
          closedAt: new Date(),
        }));
        router.refresh();
      } else {
        toast.error(result.error || "終了に失敗しました");
      }
    } catch {
      toast.error("終了に失敗しました");
    } finally {
      setIsClosing(false);
    }
  };

  // セクションを再開
  const handleReopenSection = async () => {
    setIsReopening(true);
    try {
      const result = await reopenSectionAction(section.id);

      if (result.success) {
        toast.success("セクションを再開しました");
        setIsReopenDialogOpen(false);
        setCurrentSection((prev) => ({
          ...prev,
          status: "active" as const,
          closedAt: null,
        }));
        router.refresh();
      } else {
        toast.error(result.error || "再開に失敗しました");
      }
    } catch {
      toast.error("再開に失敗しました");
    } finally {
      setIsReopening(false);
    }
  };

  // セクションを削除
  const handleDeleteSection = async () => {
    setIsDeletingSection(true);
    try {
      const result = await deleteSectionAction(section.id);

      if (result.success) {
        toast.success("セクションを削除しました");
        router.push("/sections");
      } else {
        toast.error(result.error || "削除に失敗しました");
      }
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setIsDeletingSection(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {currentSection.name}
          </h1>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "進行中" : "終了"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isActive && canEdit && (
            <Button onClick={handleAddGame}>
              <Plus className="h-4 w-4 mr-2" />
              点数を入力
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">編集</span>
            </Button>
          )}
          {isActive && canDelete && (
            <Button
              variant="outline"
              onClick={() => setIsCloseDialogOpen(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              終了
            </Button>
          )}
          {!isActive && canDelete && (
            <Button
              variant="outline"
              onClick={() => setIsReopenDialogOpen(true)}
            >
              <Unlock className="h-4 w-4 mr-2" />
              再開
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setIsDeleteSectionDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">削除</span>
            </Button>
          )}
        </div>
      </div>

      {/* セクション情報 */}
      <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-y-3 md:grid-cols-6">
          <div className="col-span-3">
            <div className="text-sm text-muted-foreground">参加者</div>
            <p className="font-medium">
              {currentSection.participants.map((p) => p.displayName).join(", ")}
            </p>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">開始点</div>
            <p className="font-medium">
              {currentSection.startingPoints.toLocaleString()}点
            </p>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">返し点</div>
            <p className="font-medium">
              {currentSection.returnPoints.toLocaleString()}点
            </p>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">レート</div>
            <p className="font-medium">
              {currentSection.rate === 0
                ? "ノーレート"
                : `¥${currentSection.rate}/1,000点`}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">スコアボード</h2>
          <p className="text-muted-foreground">
            ゲームごとの点数を記録・表示します
          </p>
        </div>
        <div className="mt-4">
          <ScoreBoard
            games={games}
            participants={currentSection.participants}
            isActive={isActive}
            canEdit={canEdit}
            canDelete={canDelete}
            onEditGame={handleEditGame}
            onDeleteGame={handleDeleteGame}
          />
        </div>
      </div>

      <div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">累計</h2>
          <p className="text-muted-foreground">
            合計点・順位・精算額を表示します
          </p>
        </div>
        <div className="mt-4">
          <SummaryPanel
            games={games}
            participants={currentSection.participants}
            startingPoints={currentSection.startingPoints}
            returnPoints={currentSection.returnPoints}
            rate={currentSection.rate}
          />
        </div>
      </div>

      {/* ダイアログ */}
      <ScoreInputForm
        participants={currentSection.participants}
        startingPoints={currentSection.startingPoints}
        playerCount={currentSection.playerCount}
        open={isScoreFormOpen}
        onOpenChange={setIsScoreFormOpen}
        onSubmit={handleScoreSubmit}
        editingGame={editingGame}
        isSubmitting={isSubmitting}
      />

      <SectionEditDialog
        section={currentSection}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleSectionEdit}
        isSubmitting={isSubmitting}
      />

      <DeleteGameDialog
        gameNumber={deletingGameNumber}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <CloseSectionDialog
        sectionName={currentSection.name}
        open={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        onConfirm={handleCloseSection}
        isClosing={isClosing}
      />

      <ReopenSectionDialog
        sectionName={currentSection.name}
        open={isReopenDialogOpen}
        onOpenChange={setIsReopenDialogOpen}
        onConfirm={handleReopenSection}
        isReopening={isReopening}
      />

      <DeleteSectionDialog
        sectionName={currentSection.name}
        gameCount={games.length}
        open={isDeleteSectionDialogOpen}
        onOpenChange={setIsDeleteSectionDialogOpen}
        onConfirm={handleDeleteSection}
        isDeleting={isDeletingSection}
      />
    </div>
  );
}
