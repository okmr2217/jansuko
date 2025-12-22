# Gitブランチ運用ルール

## ブランチ構成

```
main          ← 本番環境（Vercelに自動デプロイ）
  │
develop       ← 開発の拠点（プレビュー環境）
  │
feature/*     ← 大きな機能開発
```

## 各ブランチの役割

| ブランチ | 用途 | Vercelデプロイ | 直接コミット |
|----------|------|----------------|--------------|
| `main` | 本番環境用。安定版のみ | 本番環境 | ❌ 禁止 |
| `develop` | 開発の統合先 | プレビュー環境 | ⭕ OK（細かい変更） |
| `feature/*` | 個別機能の開発 | プレビュー環境 | - |

## コミットの判断基準

### developに直接コミットしてOK

- typo修正
- スタイル微調整（色、余白など）
- コメント追加・修正
- 1ファイルで完結する小さな修正
- 設定ファイルの微調整

### feature/* ブランチを切るべき

- 新しい画面の追加
- 複数ファイルにまたがる変更
- 動作確認が必要な機能追加
- 壊れる可能性がある変更

## 運用フロー

### 細かい変更

```bash
git checkout develop
# 修正作業
git add .
git commit -m "fix: 〇〇を修正"
git push
```

### 大きな機能開発

```bash
# 1. feature ブランチを作成
git checkout develop
git checkout -b feature/新機能名

# 2. 開発作業
git add .
git commit -m "feat: 〇〇を実装"
git push -u origin feature/新機能名

# 3. 完了したら develop にマージ
git checkout develop
git merge feature/新機能名
git push

# 4. 不要になったブランチを削除
git branch -d feature/新機能名
```

### 本番リリース

```bash
git checkout main
git merge develop
git push
```

## コミットメッセージ規約

```
feat:     新機能
fix:      バグ修正
update:   機能改善・更新
refactor: リファクタリング
style:    スタイル変更（見た目のみ）
docs:     ドキュメント
chore:    設定・ビルド関連
```

例：
```
feat: 点数入力フォームを追加
fix: 合計点の計算ミスを修正
style: ヘッダーの余白を調整
```
