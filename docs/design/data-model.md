# データモデル

## 雀士（users）

管理者フラグは本当に必要か検討する。

|カラム|型|説明|
|---|---|---|
|id|UUID|主キー|
|display_name|VARCHAR(50)|表示名|
|password_hash|VARCHAR(255)|パスワード（ハッシュ化）|
|is_admin|BOOLEAN|管理者フラグ|
|created_at|TIMESTAMP|作成日時|
|updated_at|TIMESTAMP|更新日時|

## セクション（sections）

|カラム|型|説明|
|---|---|---|
|id|UUID|主キー|
|name|VARCHAR(100)|セクション名（任意）|
|starting_points|INTEGER|開始点（例: 35000）|
|return_points|INTEGER|返し点（例: 30000）|
|rate|INTEGER|レート（円/1000点、例: 50）|
|player_count|INTEGER|参加人数（3または4）|
|status|ENUM|ステータス（active/closed）|
|created_by|UUID|作成者（雀士ID）|
|created_at|TIMESTAMP|作成日時|
|closed_at|TIMESTAMP|終了日時（NULLは進行中）|

## セクション参加者（section_participants）

|カラム|型|説明|
|---|---|---|
|id|UUID|主キー|
|section_id|UUID|セクションID（FK）|
|user_id|UUID|雀士ID（FK）|
|created_at|TIMESTAMP|作成日時|

## ゲーム（games）

|カラム|型|説明|
|---|---|---|
|id|UUID|主キー|
|section_id|UUID|セクションID（FK）|
|game_number|INTEGER|ゲーム番号（1, 2, 3...）|
|created_at|TIMESTAMP|作成日時|
|updated_at|TIMESTAMP|更新日時|

## 点数（scores）

|カラム|型|説明|
|---|---|---|
|id|UUID|主キー|
|game_id|UUID|ゲームID（FK）|
|user_id|UUID|雀士ID（FK）|
|points|INTEGER|点数（100点単位）|
|created_at|TIMESTAMP|作成日時|
|updated_at|TIMESTAMP|更新日時|

## ER図

```
users ||--o{ section_participants : "参加"
sections ||--o{ section_participants : "含む"
sections ||--o{ games : "含む"
games ||--o{ scores : "含む"
users ||--o{ scores : "記録"
users ||--o{ sections : "作成"
```
