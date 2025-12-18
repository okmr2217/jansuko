-- Seed: Initial data
-- Description: 初期データの投入

-- ============================================
-- 管理者ユーザーの作成
-- ============================================
-- パスワード: password (bcrypt hash with cost 10)
-- 本番環境では必ずパスワードを変更してください

INSERT INTO users (display_name, password_hash, is_admin)
VALUES (
  'admin',
  '$2b$10$qBcUAykKGGkUFj0FIs8WquXwM7oXq1q7WsmeFSY.shOKhcOARTpyu',
  TRUE
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 開発用テストユーザー（オプション）
-- ============================================
-- コメントアウトを外すとテストユーザーが追加されます
-- パスワード: password

-- INSERT INTO users (display_name, password_hash, is_admin)
-- VALUES
--   ('田中', '$2b$10$qBcUAykKGGkUFj0FIs8WquXwM7oXq1q7WsmeFSY.shOKhcOARTpyu', FALSE),
--   ('佐藤', '$2b$10$qBcUAykKGGkUFj0FIs8WquXwM7oXq1q7WsmeFSY.shOKhcOARTpyu', FALSE),
--   ('鈴木', '$2b$10$qBcUAykKGGkUFj0FIs8WquXwM7oXq1q7WsmeFSY.shOKhcOARTpyu', FALSE),
--   ('高橋', '$2b$10$qBcUAykKGGkUFj0FIs8WquXwM7oXq1q7WsmeFSY.shOKhcOARTpyu', FALSE)
-- ON CONFLICT DO NOTHING;
