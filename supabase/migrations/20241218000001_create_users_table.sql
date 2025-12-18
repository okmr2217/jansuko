-- Migration: Create users table
-- Description: 雀士（ユーザー）テーブルの作成

-- usersテーブル作成
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- display_nameのユニーク制約（削除されていないユーザーのみ）
CREATE UNIQUE INDEX idx_users_display_name_unique
  ON users (display_name)
  WHERE deleted_at IS NULL;

-- updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- usersテーブルにトリガーを設定
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメント
COMMENT ON TABLE users IS '雀士（ユーザー）テーブル';
COMMENT ON COLUMN users.id IS 'ユーザーID（UUID）';
COMMENT ON COLUMN users.display_name IS '表示名';
COMMENT ON COLUMN users.password_hash IS 'パスワードハッシュ（bcrypt）';
COMMENT ON COLUMN users.is_admin IS '管理者フラグ';
COMMENT ON COLUMN users.created_at IS '作成日時';
COMMENT ON COLUMN users.updated_at IS '更新日時';
COMMENT ON COLUMN users.deleted_at IS '削除日時（論理削除用、NULLは未削除）';
