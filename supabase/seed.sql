-- Seed: Initial data
-- Description: 初期データの投入

-- ============================================
-- 管理者ユーザーの作成
-- ============================================
-- パスワード: admin123 (bcrypt hash with cost 10)
-- 本番環境では必ずパスワードを変更してください

INSERT INTO users (display_name, password_hash, is_admin)
VALUES (
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  TRUE
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 開発用テストユーザー（オプション）
-- ============================================
-- コメントアウトを外すとテストユーザーが追加されます
-- パスワード: password123

-- INSERT INTO users (display_name, password_hash, is_admin)
-- VALUES
--   ('田中', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', FALSE),
--   ('佐藤', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', FALSE),
--   ('鈴木', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', FALSE),
--   ('高橋', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', FALSE)
-- ON CONFLICT DO NOTHING;
