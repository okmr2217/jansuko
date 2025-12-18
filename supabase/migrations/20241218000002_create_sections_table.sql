-- Migration: Create sections table
-- Description: セクション（対局グループ）テーブルの作成

-- セクションステータス用のENUM型
CREATE TYPE section_status AS ENUM ('active', 'closed');

-- sectionsテーブル作成
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  starting_points INTEGER NOT NULL DEFAULT 25000,
  return_points INTEGER NOT NULL DEFAULT 30000,
  rate INTEGER NOT NULL DEFAULT 50,
  player_count INTEGER NOT NULL DEFAULT 4 CHECK (player_count IN (3, 4)),
  status section_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ DEFAULT NULL
);

-- sectionsテーブルにupdated_atトリガーは不要（closed_atで管理）

-- コメント
COMMENT ON TABLE sections IS 'セクション（対局グループ）テーブル';
COMMENT ON COLUMN sections.id IS 'セクションID（UUID）';
COMMENT ON COLUMN sections.name IS 'セクション名';
COMMENT ON COLUMN sections.starting_points IS '開始点（デフォルト25000点）';
COMMENT ON COLUMN sections.return_points IS '返し点（デフォルト30000点）';
COMMENT ON COLUMN sections.rate IS 'レート（デフォルト50）';
COMMENT ON COLUMN sections.player_count IS '参加人数（3人または4人）';
COMMENT ON COLUMN sections.status IS 'ステータス（active: 進行中, closed: 終了）';
COMMENT ON COLUMN sections.created_by IS '作成者のユーザーID';
COMMENT ON COLUMN sections.created_at IS '作成日時';
COMMENT ON COLUMN sections.closed_at IS '終了日時';
