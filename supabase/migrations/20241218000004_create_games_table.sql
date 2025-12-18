-- Migration: Create games table
-- Description: ゲーム（1半荘）テーブルの作成

-- gamesテーブル作成
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ユニーク制約（同一セクション内のゲーム番号は一意）
ALTER TABLE games
  ADD CONSTRAINT unique_section_game_number UNIQUE (section_id, game_number);

-- gamesテーブルにトリガーを設定
CREATE TRIGGER trigger_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメント
COMMENT ON TABLE games IS 'ゲーム（1半荘）テーブル';
COMMENT ON COLUMN games.id IS 'ゲームID（UUID）';
COMMENT ON COLUMN games.section_id IS 'セクションID';
COMMENT ON COLUMN games.game_number IS 'ゲーム番号（セクション内での連番）';
COMMENT ON COLUMN games.created_at IS '作成日時';
COMMENT ON COLUMN games.updated_at IS '更新日時';
