-- sectionsテーブルにdeleted_atカラムを追加（論理削除用）
ALTER TABLE sections
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 論理削除されていないセクションのみを取得するためのインデックス
CREATE INDEX idx_sections_deleted_at ON sections (deleted_at) WHERE deleted_at IS NULL;
