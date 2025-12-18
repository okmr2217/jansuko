# データアクセス設計

Next.js App RouterのServer ComponentsとServer Actionsを活用し、従来のREST APIを最小限に抑えた設計とする。

## 設計方針

|操作種別|実装方式|理由|
|---|---|---|
|データ取得（読み取り）|Server Components|サーバー側で直接DBアクセス、クライアントへのJS送信量削減|
|データ変更（作成・更新・削除）|Server Actions|フォーム送信やボタン操作からサーバー処理を直接呼び出し|
|認証|Supabase Auth + Middleware|セッション管理とルート保護|

## ディレクトリ構成

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # ログインページ
│   └── actions.ts            # 認証関連のServer Actions
├── (main)/
│   ├── layout.tsx            # 認証済みユーザー用レイアウト
│   ├── sections/
│   │   ├── page.tsx          # セクション一覧（Server Component）
│   │   ├── new/
│   │   │   └── page.tsx      # セクション作成ページ
│   │   ├── [id]/
│   │   │   ├── page.tsx      # セクション詳細（Server Component）
│   │   │   └── actions.ts    # セクション関連のServer Actions
│   │   └── actions.ts        # セクション作成のServer Actions
│   ├── users/
│   │   ├── page.tsx          # 雀士一覧（Server Component）
│   │   └── actions.ts        # 雀士管理のServer Actions
│   ├── stats/
│   │   └── page.tsx          # 統計ページ（Server Component）
│   └── settings/
│       ├── page.tsx          # アカウント設定
│       └── actions.ts        # 設定変更のServer Actions
└── lib/
    ├── db/
    │   ├── queries/          # データ取得用クエリ関数
    │   │   ├── sections.ts
    │   │   ├── games.ts
    │   │   ├── users.ts
    │   │   └── stats.ts
    │   └── mutations/        # データ変更用関数（Server Actionsから呼び出し）
    │       ├── sections.ts
    │       ├── games.ts
    │       └── users.ts
    ├── auth/
    │   └── session.ts        # セッション管理ユーティリティ
    └── supabase/
        ├── client.ts         # クライアント用Supabaseインスタンス
        └── server.ts         # サーバー用Supabaseインスタンス
```

## Server Components（データ取得）

Server Componentsで直接データベースにアクセスし、データを取得する。

|ページ|ファイル|取得データ|
|---|---|---|
|セクション一覧|`app/(main)/sections/page.tsx`|セクション一覧（フィルタ・検索・ソート対応）|
|セクション詳細|`app/(main)/sections/[id]/page.tsx`|セクション情報、ゲーム一覧、点数、集計結果|
|雀士一覧|`app/(main)/users/page.tsx`|雀士一覧|
|統計|`app/(main)/stats/page.tsx`|期間指定の統計データ|
|アカウント設定|`app/(main)/settings/page.tsx`|現在のユーザー情報|

## Server Actions（データ変更）

`'use server'`ディレクティブを使用し、フォームやボタンからサーバー処理を実行する。

### 認証（`app/(auth)/actions.ts`）

|Action|説明|引数|
|---|---|---|
|`login`|ログイン処理|`FormData { display_name, password }`|
|`logout`|ログアウト処理|なし|

### セクション管理（`app/(main)/sections/actions.ts`）

|Action|説明|引数|
|---|---|---|
|`createSection`|セクション作成|`FormData { name?, starting_points, return_points, rate, player_count, participant_ids[] }`|

### セクション詳細（`app/(main)/sections/[id]/actions.ts`）

|Action|説明|引数|
|---|---|---|
|`updateSection`|セクション更新|`FormData { section_id, name?, starting_points, return_points, rate }`|
|`closeSection`|セクション終了|`FormData { section_id }`|
|`addGame`|ゲーム（点数）追加|`FormData { section_id, scores: { user_id, points }[] }`|
|`updateGame`|点数修正|`FormData { game_id, scores: { user_id, points }[] }`|
|`deleteGame`|点数削除|`FormData { game_id }`|

### 雀士管理（`app/(main)/users/actions.ts`）

|Action|説明|引数|権限|
|---|---|---|---|
|`createUser`|雀士作成|`FormData { display_name, password }`|管理者のみ|
|`updateUser`|雀士更新|`FormData { user_id, display_name }`|管理者のみ|
|`deleteUser`|雀士削除|`FormData { user_id }`|管理者のみ|

### アカウント設定（`app/(main)/settings/actions.ts`）

|Action|説明|引数|
|---|---|---|
|`updateDisplayName`|表示名変更|`FormData { display_name }`|
|`updatePassword`|パスワード変更|`FormData { current_password, new_password }`|

## クエリ関数（`lib/db/queries/`）

Server Componentsから呼び出すデータ取得関数。Supabaseクライアントを使用してデータベースにアクセスする。

```typescript
// lib/db/queries/sections.ts の例
export async function getSections(options: {
  status?: 'active' | 'closed';
  search?: string;
  sortBy?: 'created_at' | 'name';
  sortOrder?: 'asc' | 'desc';
}) { ... }

export async function getSectionWithGames(sectionId: string) { ... }

// lib/db/queries/stats.ts の例
export async function getStats(options: {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}) { ... }
```

## 認証・認可

### Middleware（`middleware.ts`）

- 未認証ユーザーを`/login`にリダイレクト
- 認証済みユーザーが`/login`にアクセスした場合は`/sections`にリダイレクト

### 権限チェック

Server Actions内で権限チェックを実施する。

```typescript
// 例: セクション参加者のみ点数入力可能
export async function addGame(formData: FormData) {
  'use server';

  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const sectionId = formData.get('section_id');
  const isParticipant = await checkParticipant(sectionId, session.user.id);
  if (!isParticipant) throw new Error('Forbidden');

  // 処理続行...
}
```

## データ再検証

Server Actions実行後、`revalidatePath`を使用してキャッシュを無効化し、最新データを表示する。

```typescript
import { revalidatePath } from 'next/cache';

export async function addGame(formData: FormData) {
  'use server';
  // ... 処理 ...

  revalidatePath(`/sections/${sectionId}`);
}
```

## エラーハンドリング

Server Actionsのエラーは`useFormState`フックを使用してクライアントに返却する。

```typescript
// actions.ts
export async function createSection(prevState: any, formData: FormData) {
  'use server';

  try {
    // バリデーション
    const validation = validateSection(formData);
    if (!validation.success) {
      return { error: validation.error.message };
    }

    // 作成処理
    await insertSection(validation.data);

    revalidatePath('/sections');
    redirect('/sections');
  } catch (error) {
    return { error: '作成に失敗しました' };
  }
}
```

## クライアントコンポーネントの使用

以下の場合にのみClient Componentを使用する。

|用途|理由|
|---|---|
|フォーム（`useFormState`, `useFormStatus`）|Server Actionsの状態管理|
|モーダル・ダイアログ|UI状態管理|
|フィルター・検索（即時反映）|インタラクティブなUI|
|トースト通知|クライアントサイドの通知表示|
