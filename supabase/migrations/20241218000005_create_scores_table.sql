-- Migration: Create scores table
-- Description: スコア（点数）テーブルの作成

-- scoresテーブル作成
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ユニーク制約（同一ゲーム内で同一ユーザーは1レコードのみ）
ALTER TABLE scores
  ADD CONSTRAINT unique_game_user UNIQUE (game_id, user_id);

-- インデックス（ゲームのスコア取得用）
CREATE INDEX idx_scores_game_id
  ON scores(game_id);

-- インデックス（ユーザーの統計計算用）
CREATE INDEX idx_scores_user_id
  ON scores(user_id);

-- scoresテーブルにトリガーを設定
CREATE TRIGGER trigger_scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメント
COMMENT ON TABLE scores IS 'スコア（点数）テーブル';
COMMENT ON COLUMN scores.id IS 'スコアID（UUID）';
COMMENT ON COLUMN scores.game_id IS 'ゲームID';
COMMENT ON COLUMN scores.user_id IS 'ユーザーID';
COMMENT ON COLUMN scores.points IS '点数（100点単位）';
COMMENT ON COLUMN scores.created_at IS '作成日時';
COMMENT ON COLUMN scores.updated_at IS '更新日時';
