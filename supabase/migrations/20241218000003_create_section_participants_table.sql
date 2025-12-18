-- Migration: Create section_participants table
-- Description: セクション参加者テーブルの作成

-- section_participantsテーブル作成
CREATE TABLE section_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ユニーク制約（同一セクションに同一ユーザーは1回のみ参加可能）
ALTER TABLE section_participants
  ADD CONSTRAINT unique_section_user UNIQUE (section_id, user_id);

-- インデックス（セクション参加者取得用）
CREATE INDEX idx_section_participants_section_id
  ON section_participants(section_id);

-- インデックス（ユーザーの参加セクション取得用）
CREATE INDEX idx_section_participants_user_id
  ON section_participants(user_id);

-- コメント
COMMENT ON TABLE section_participants IS 'セクション参加者テーブル';
COMMENT ON COLUMN section_participants.id IS '参加記録ID（UUID）';
COMMENT ON COLUMN section_participants.section_id IS 'セクションID';
COMMENT ON COLUMN section_participants.user_id IS 'ユーザーID';
COMMENT ON COLUMN section_participants.created_at IS '参加日時';
