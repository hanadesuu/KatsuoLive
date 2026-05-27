# KatsuoLive セットアップガイド

このガイドでは、KatsuoLive プロジェクトを初めてセットアップする手順を詳しく説明します。

## 📋 システム要件

### 必須

- **Node.js**: v18.0.0 以上
- **npm**: v9.0.0 以上（または yarn v1.22.0 以上）
- **PostgreSQL**: v14.0 以上

### 推奨

- **OS**: Windows 10/11, macOS 12+, Ubuntu 20.04+
- **エディタ**: VS Code（推奨拡張機能リスト付き）
- **メモリ**: 8GB RAM 以上

## 🔧 ステップ・バイ・ステップ

### ステップ 1: PostgreSQL のインストールと設定

#### Windows の場合

1. [PostgreSQL 公式サイト](https://www.postgresql.org/download/windows/)からインストーラーをダウンロード
2. インストーラーを実行し、デフォルト設定で進める
3. パスワードを設定（覚えておくこと！）
4. ポート 5432 を確認

#### macOS の場合（Homebrew 使用）

```bash
# Homebrew がない場合はインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# PostgreSQL インストール
brew install postgresql@14

# サービス開始
brew services start postgresql@14
```

#### Linux (Ubuntu) の場合

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### ステップ 2: データベースの作成

```bash
# PostgreSQL に接続
# Windows: スタートメニューから "SQL Shell (psql)" を起動
# macOS/Linux: ターミナルで以下を実行
psql -U postgres

# データベース作成（psql プロンプト内で）
CREATE DATABASE katsuolive;

# データベース確認
\l

# 終了
\q
```

### ステップ 3: プロジェクトのセットアップ

```bash
# プロジェクトディレクトリに移動
cd katsuolive

# 依存関係の一括インストール
npm install

# または個別にインストール
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### ステップ 4: 環境変数の設定

#### バックエンド

```bash
cd backend
cp .env.example .env
```

`backend/.env` を編集：

```env
# データベース接続情報
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/katsuolive?schema=public"

# JWT シークレット（本番環境では必ず変更！）
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# サーバーポート
PORT=3001

# 環境
NODE_ENV="development"

# フロントエンド URL（CORS用）
FRONTEND_URL="http://localhost:3000"
```

⚠️ **重要**: `YOUR_PASSWORD` を PostgreSQL で設定したパスワードに置き換えてください。

#### フロントエンド

```bash
cd ../frontend
cp .env.example .env.local
```

`frontend/.env.local` を編集：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### ステップ 5: データベースのマイグレーション

```bash
cd backend

# Prisma クライアントを生成
npm run prisma:generate

# マイグレーションを実行
npm run prisma:migrate

# ✅ 成功すると "Your database is now in sync with your schema." と表示されます
```

### ステップ 6: 初期データの投入

```bash
# まだ backend ディレクトリにいることを確認
npm run prisma:seed
```

以下のデータが作成されます：

- **権限データ**: 各リソースの CRUD 権限
- **ロール**: super_admin, admin, editor, viewer
- **デフォルト管理者**: 
  - Email: admin@katsuolive.com
  - Password: admin123
- **サンプルアーティスト**: あいみょん（テスト用）

### ステップ 7: 開発サーバーの起動

#### 方法 1: 両方同時に起動（推奨）

```bash
# ルートディレクトリで
npm run dev
```

#### 方法 2: 個別に起動

ターミナル1（バックエンド）:
```bash
cd backend
npm run start:dev
```

ターミナル2（フロントエンド）:
```bash
cd frontend
npm run dev
```

### ステップ 8: 動作確認

ブラウザで以下の URL にアクセス：

1. **フロントエンド**: http://localhost:3000
2. **API ドキュメント**: http://localhost:3001/api/docs
3. **管理画面**: http://localhost:3000/admin

### ステップ 9: 管理画面にログイン

1. http://localhost:3000/admin にアクセス
2. 以下の認証情報でログイン：
   ```
   Email: admin@katsuolive.com
   Password: admin123
   ```
3. ログイン成功後、ダッシュボードが表示されます

## 🎯 初回データ入力

### アーティストを追加

1. 管理画面 → 「アーティスト」 → 「新規追加」
2. 必須項目：
   - アーティスト名（日本語）
3. オプション項目：
   - 英語名
   - 中国語名
   - 説明
   - 公式リンク（Website, Twitter, Instagram）

### 公演を追加

1. 管理画面 → 「公演」 → 「新規追加」
2. 必須項目：
   - アーティスト（ドロップダウンから選択）
   - 公演タイトル
   - 開始日時
   - 会場名
   - 都市名
3. オプション項目：
   - 終了日時
   - 公式ページ URL
   - カバー画像 URL
   - ステータス

### 選抽情報を追加

1. 管理画面 → 「選抽」 → 「新規追加」
2. 必須項目：
   - 公演（ドロップダウンから選択）
   - 選抽タイプ（例: 最速先行、FC先行、一般）
   - 受付開始日時
   - 受付終了日時
3. オプション項目：
   - 条件（例: CD購入者対象）
   - ソース URL
   - 備考

## 🔍 トラブルシューティング

### データベース接続エラー

```
Error: P1001: Can't reach database server
```

**解決方法**:
1. PostgreSQL が起動しているか確認
   ```bash
   # Windows: サービスマネージャーで確認
   # macOS: brew services list
   # Linux: sudo systemctl status postgresql
   ```
2. `.env` ファイルの `DATABASE_URL` を確認
3. パスワードが正しいか確認

### ポートが既に使用されている

```
Error: Port 3000 is already in use
```

**解決方法**:
1. 他のプロセスを終了
2. または別のポートを使用：
   ```bash
   # フロントエンド
   PORT=3001 npm run dev
   
   # バックエンド (.env で変更)
   PORT=3002
   ```

### Prisma マイグレーションエラー

```
Error: P1017: Server has closed the connection
```

**解決方法**:
1. データベースが起動しているか確認
2. マイグレーションファイルを削除してやり直し：
   ```bash
   rm -rf prisma/migrations
   npm run prisma:migrate
   ```

### npm install でエラー

```
Error: EACCES: permission denied
```

**解決方法**:
1. Node.js と npm を再インストール
2. nvm（Node Version Manager）の使用を検討
3. Windows の場合は管理者権限で実行

## 🛠️ 便利なコマンド

### Prisma 関連

```bash
cd backend

# データベースを GUI で確認
npm run prisma:studio

# マイグレーションを作成（スキーマ変更後）
npm run prisma:migrate

# Prisma クライアント再生成
npm run prisma:generate

# データベースをリセット（注意: 全データ削除）
npx prisma migrate reset
```

### 開発中

```bash
# バックエンドのログを確認
cd backend
npm run start:dev

# フロントエンドのビルド確認
cd frontend
npm run build

# 型チェック
npm run lint
```

## 📚 次のステップ

セットアップが完了したら：

1. [README.md](./README.md) で全機能を確認
2. API ドキュメント（http://localhost:3001/api/docs）を探索
3. 実際のデータを入力して動作確認
4. カスタマイズやデプロイを検討

## 💡 ヒント

- **Prisma Studio**: データベースの GUI ツール。`npm run prisma:studio` で起動
- **API ドキュメント**: Swagger UI でインタラクティブに API をテスト可能
- **Hot Reload**: コードを変更すると自動的に反映されます
- **エラーログ**: ターミナルのログを常に確認する習慣をつけましょう

## 🆘 サポート

問題が解決しない場合：

1. GitHub Issues を確認
2. 新しい Issue を作成（エラーメッセージとスクリーンショットを添付）
3. README の「お問い合わせ」セクションを参照

Happy Coding! 🎉
