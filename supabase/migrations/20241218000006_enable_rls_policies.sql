-- Migration: Enable RLS and create policies
-- Description: 行レベルセキュリティの有効化とポリシー設定

-- ============================================
-- RLSを有効化
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 認証済みユーザー確認用の関数
-- ============================================

-- 現在のセッションユーザーIDを取得する関数
-- Supabaseの auth.uid() を使用してJWTから現在のユーザーIDを取得
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 現在のユーザーが管理者かどうかを確認する関数
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO user_is_admin
  FROM users
  WHERE id = public.current_user_id()
    AND deleted_at IS NULL;
  RETURN COALESCE(user_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 現在のユーザーがセクションの参加者かどうかを確認する関数
CREATE OR REPLACE FUNCTION public.is_section_participant(section_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM section_participants
    WHERE section_id = section_uuid
      AND user_id = public.current_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 現在のユーザーがセクションの作成者かどうかを確認する関数
CREATE OR REPLACE FUNCTION public.is_section_creator(section_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sections
    WHERE id = section_uuid
      AND created_by = public.current_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- usersテーブルのポリシー
-- ============================================

-- SELECT: 認証済みユーザーは全員閲覧可能（削除されていないユーザーのみ）
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (public.current_user_id() IS NOT NULL AND deleted_at IS NULL);

-- INSERT: 管理者のみ
CREATE POLICY users_insert_policy ON users
  FOR INSERT
  WITH CHECK (public.is_admin());

-- UPDATE: 管理者のみ（または自分自身のパスワード変更など）
CREATE POLICY users_update_policy ON users
  FOR UPDATE
  USING (public.is_admin() OR id = public.current_user_id())
  WITH CHECK (public.is_admin() OR id = public.current_user_id());

-- DELETE: 管理者のみ（論理削除のためUPDATEで行う）
CREATE POLICY users_delete_policy ON users
  FOR DELETE
  USING (FALSE); -- 物理削除は禁止

-- ============================================
-- sectionsテーブルのポリシー
-- ============================================

-- SELECT: 認証済みユーザーは全員閲覧可能
CREATE POLICY sections_select_policy ON sections
  FOR SELECT
  USING (public.current_user_id() IS NOT NULL);

-- INSERT: 認証済みユーザーは作成可能
CREATE POLICY sections_insert_policy ON sections
  FOR INSERT
  WITH CHECK (public.current_user_id() IS NOT NULL);

-- UPDATE: 作成者または管理者
CREATE POLICY sections_update_policy ON sections
  FOR UPDATE
  USING (public.is_section_creator(id) OR public.is_admin())
  WITH CHECK (public.is_section_creator(id) OR public.is_admin());

-- DELETE: 作成者または管理者
CREATE POLICY sections_delete_policy ON sections
  FOR DELETE
  USING (public.is_section_creator(id) OR public.is_admin());

-- ============================================
-- section_participantsテーブルのポリシー
-- ============================================

-- SELECT: 認証済みユーザーは全員閲覧可能
CREATE POLICY section_participants_select_policy ON section_participants
  FOR SELECT
  USING (public.current_user_id() IS NOT NULL);

-- INSERT: セクション作成者または管理者
CREATE POLICY section_participants_insert_policy ON section_participants
  FOR INSERT
  WITH CHECK (public.is_section_creator(section_id) OR public.is_admin());

-- DELETE: セクション作成者または管理者
CREATE POLICY section_participants_delete_policy ON section_participants
  FOR DELETE
  USING (public.is_section_creator(section_id) OR public.is_admin());

-- ============================================
-- gamesテーブルのポリシー
-- ============================================

-- SELECT: 認証済みユーザーは全員閲覧可能
CREATE POLICY games_select_policy ON games
  FOR SELECT
  USING (public.current_user_id() IS NOT NULL);

-- INSERT: セクション参加者
CREATE POLICY games_insert_policy ON games
  FOR INSERT
  WITH CHECK (public.is_section_participant(section_id) OR public.is_admin());

-- UPDATE: セクション参加者または管理者
CREATE POLICY games_update_policy ON games
  FOR UPDATE
  USING (public.is_section_participant(section_id) OR public.is_admin())
  WITH CHECK (public.is_section_participant(section_id) OR public.is_admin());

-- DELETE: セクション作成者または管理者
CREATE POLICY games_delete_policy ON games
  FOR DELETE
  USING (public.is_section_creator(section_id) OR public.is_admin());

-- ============================================
-- scoresテーブルのポリシー
-- ============================================

-- SELECT: 認証済みユーザーは全員閲覧可能
CREATE POLICY scores_select_policy ON scores
  FOR SELECT
  USING (public.current_user_id() IS NOT NULL);

-- INSERT: ゲームが属するセクションの参加者
CREATE POLICY scores_insert_policy ON scores
  FOR INSERT
  WITH CHECK (
    public.is_section_participant(
      (SELECT section_id FROM games WHERE id = game_id)
    ) OR public.is_admin()
  );

-- UPDATE: ゲームが属するセクションの参加者または管理者
CREATE POLICY scores_update_policy ON scores
  FOR UPDATE
  USING (
    public.is_section_participant(
      (SELECT section_id FROM games WHERE id = game_id)
    ) OR public.is_admin()
  )
  WITH CHECK (
    public.is_section_participant(
      (SELECT section_id FROM games WHERE id = game_id)
    ) OR public.is_admin()
  );

-- DELETE: ゲームが属するセクションの作成者または管理者
CREATE POLICY scores_delete_policy ON scores
  FOR DELETE
  USING (
    public.is_section_creator(
      (SELECT section_id FROM games WHERE id = game_id)
    ) OR public.is_admin()
  );
