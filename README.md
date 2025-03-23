# Migrale - フランス移住サポートアプリ

フランス移住を計画する日本人のためのビザ申請・タスク管理サポートアプリケーション

## 技術スタック

- フロントエンド: Next.js, React, TailwindCSS
- バックエンド: Next.js API Routes
- データベース: PostgreSQL (Supabase)
- 認証: NextAuth.js
- 状態管理: React Query
- スタイリング: TailwindCSS

## 開発環境のセットアップ

### 必要条件

- Node.js 18.x 以上
- PostgreSQL 14.x 以上
- pnpm 8.x 以上（推奨）

### インストール手順

1. リポジトリのクローン:

   ```bash
   git clone https://github.com/your-username/migrale.git
   cd migrale
   ```

2. 依存関係のインストール:

   ```bash
   pnpm install
   ```

3. 環境変数の設定:

   ```bash
   cp .env.example .env
   ```

   `.env`ファイルを編集し、必要な環境変数を設定してください。

4. 環境変数の生成:

   ```bash
   # NextAuthのシークレットキーを生成
   openssl rand -base64 32

   # セッションのシークレットキーを生成
   openssl rand -base64 32
   ```

   生成されたキーを`.env`ファイルの対応する変数に設定してください。

5. データベースのセットアップ:

   ```bash
   pnpm db:push
   ```

6. 開発サーバーの起動:
   ```bash
   pnpm dev
   ```

アプリケーションは http://localhost:3000 で利用できます。

## 環境変数の設定

`.env`ファイルには以下の環境変数を設定する必要があります：

### 必須の環境変数

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase のサービスロールキー
- `NEXTAUTH_URL`: アプリケーションの URL
- `NEXTAUTH_SECRET`: NextAuth のシークレットキー
- `DATABASE_URL`: PostgreSQL の接続文字列
- `SESSION_SECRET`: セッションのシークレットキー
- `NODE_ENV`: 実行環境（development/production/test）

### オプションの環境変数

- `SMTP_*`: メール送信の設定
- `APP_*`: アプリケーション固有の設定
- `ALLOWED_ORIGINS`: CORS 設定
- `LOG_LEVEL`: ログレベルの設定

詳細は`.env.example`ファイルを参照してください。

## 本番環境へのデプロイ

1. 環境変数の設定:

   - 本番環境用の値を設定
   - より強力なシークレットキーを使用

2. ビルド:

   ```bash
   pnpm build
   ```

3. 起動:
   ```bash
   pnpm start
   ```

## ライセンス

MIT License
