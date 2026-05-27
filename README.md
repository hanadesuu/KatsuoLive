# KatsuoLive - JPOP Live & Lottery Information Platform

> 本地开发环境配置请先看 [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)。该指南包含 PostgreSQL 安装、数据库初始化、Prisma migration、seed 数据导入和启动命令。

JPOP 演出と選抽情報を管理・公開するための統合プラットフォーム

## 📋 プロジェクト概要

このプラットフォームは、JPOP アーティストの公演情報と選抽（チケット抽選）情報を一元管理し、ファンに分かりやすく提供することを目的としています。

### 主な特徴

- ✅ **完全コード管理** - すべてのデータとロジックをコードで定義
- 👥 **多管理員協作** - RBAC権限システムで複数の管理者が安全に協力
- 📝 **Block エディタ** - 柔軟なドキュメント編集機能
- 🔍 **構造化データ** - アーティスト、公演、選抽情報を体系的に管理
- 📅 **カレンダー表示** - 公演スケジュールを視覚的に確認
- 🔔 **選抽タイムライン** - 各公演の選抽受付期間を自動表示
- 📊 **監査ログ** - すべての変更を記録・追跡

## 🏗️ 技術スタック

### バックエンド
- **フレームワーク**: NestJS + TypeScript
- **ORM**: Prisma
- **データベース**: PostgreSQL
- **認証**: JWT + Passport
- **API ドキュメント**: Swagger

### フロントエンド
- **フレームワーク**: Next.js 14 + TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **エディタ**: EditorJS
- **HTTP クライアント**: Axios

## 📦 プロジェクト構造

```
katsuolive/
├── backend/                  # バックエンド (NestJS + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma    # データベーススキーマ
│   │   └── seed.ts          # 初期データ
│   └── src/
│       ├── artists/         # アーティスト管理
│       ├── lives/           # 公演管理
│       ├── lotteries/       # 選抽管理
│       ├── documents/       # ドキュメント管理
│       ├── users/           # ユーザー管理
│       ├── roles/           # 権限管理
│       ├── auth/            # 認証
│       └── audit/           # 監査ログ
├── frontend/                # フロントエンド (Next.js)
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # ホームページ
│       │   ├── calendar/             # カレンダーページ
│       │   ├── lives/[id]/           # 公演詳細
│       │   └── admin/                # 管理画面
│       ├── components/               # 共通コンポーネント
│       └── lib/                      # ユーティリティ
└── README.md
```

## 🚀 セットアップ

### 前提条件

- Node.js 18+
- PostgreSQL 14+
- npm または yarn

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd katsuolive
```

### 2. 依存関係のインストール

```bash
# ルートで一括インストール（推奨）
npm install

# または個別にインストール
cd backend && npm install
cd ../frontend && npm install
```

### 3. データベースのセットアップ

```bash
# PostgreSQL データベースを作成
createdb katsuolive

# backend/.env ファイルを作成
cd backend
cp .env.example .env
```

`.env` ファイルを編集してデータベース接続情報を設定：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/katsuolive?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
```

### 4. データベースマイグレーションと初期データ投入

```bash
cd backend

# Prisma クライアント生成
npm run prisma:generate

# マイグレーション実行
npm run prisma:migrate

# 初期データ投入（デフォルト管理者など）
npm run prisma:seed
```

### 5. フロントエンドの設定

```bash
cd frontend
cp .env.example .env.local
```

`.env.local` を編集：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 6. 開発サーバーの起動

```bash
# ルートディレクトリから両方同時に起動（推奨）
npm run dev

# または個別に起動
cd backend && npm run start:dev
cd frontend && npm run dev
```

### 7. アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンド API**: http://localhost:3001
- **API ドキュメント**: http://localhost:3001/api/docs
- **管理画面**: http://localhost:3000/admin

### デフォルト管理者アカウント

```
Email: admin@katsuolive.com
Password: admin123
```

## 🎯 主要機能

### 1. 公開ページ

#### ホームページ (`/`)
- 今後の公演一覧表示
- アーティスト別フィルタリング

#### カレンダーページ (`/calendar`)
- 月別の公演スケジュール表示
- カレンダー形式で視覚的に確認

#### 公演詳細ページ (`/lives/[id]`)
- 公演の詳細情報
- 選抽スケジュールのタイムライン表示
- 関連ドキュメントへのリンク

### 2. 管理画面 (`/admin`)

#### ダッシュボード
- システム全体の統計情報
- クイックアクション

#### アーティスト管理
- CRUD 操作
- 複数言語名対応（日本語・英語・中国語）
- 公式リンク管理

#### 公演管理
- CRUD 操作
- アーティストとの関連付け
- ステータス管理（予定・進行中・終了・キャンセル）

#### 選抽管理
- CRUD 操作
- 公演との関連付け
- 受付期間の設定
- 選抽タイプ・条件の設定

#### ドキュメント管理
- Block エディタによる柔軟な編集
- 公演との関連付け
- 下書き・公開・アーカイブのステータス管理

#### 監査ログ
- すべての変更履歴を表示
- ユーザー・アクション・リソースでフィルタリング

### 3. 権限システム

#### 4つのロール

- **super_admin**: 全権限
- **admin**: 作成・編集・削除権限
- **editor**: 編集権限のみ
- **viewer**: 閲覧のみ

#### 権限管理
- リソース別（artist, live, lottery, document）
- アクション別（create, read, update, delete）
- ロールベースでの制御

## 🔧 開発

### データベーススキーマの変更

```bash
cd backend

# スキーマファイル編集後
npm run prisma:migrate

# Prisma Studio でデータ確認
npm run prisma:studio
```

### API エンドポイント

主要なエンドポイント：

```
POST   /auth/login              # ログイン
POST   /auth/register           # ユーザー登録

GET    /artists                 # アーティスト一覧
GET    /artists/:id             # アーティスト詳細
POST   /artists                 # アーティスト作成
PATCH  /artists/:id             # アーティスト更新
DELETE /artists/:id             # アーティスト削除

GET    /lives                   # 公演一覧
GET    /lives/upcoming          # 今後の公演
GET    /lives/calendar/:y/:m    # カレンダー表示
GET    /lives/:id               # 公演詳細
POST   /lives                   # 公演作成
PATCH  /lives/:id               # 公演更新
DELETE /lives/:id               # 公演削除

GET    /lotteries               # 選抽一覧
GET    /lotteries/active        # 現在受付中の選抽
GET    /lotteries/timeline      # タイムライン表示
POST   /lotteries               # 選抽作成
PATCH  /lotteries/:id           # 選抽更新
DELETE /lotteries/:id           # 選抽削除

GET    /documents               # ドキュメント一覧
GET    /documents/slug/:slug    # スラッグでドキュメント取得
POST   /documents               # ドキュメント作成
PATCH  /documents/:id           # ドキュメント更新
DELETE /documents/:id           # ドキュメント削除

GET    /audit                   # 監査ログ一覧
GET    /audit/:resource/:id     # リソース別ログ
```

## 📝 使用方法

### 1. アーティストを追加

管理画面にログイン → アーティスト → 新規追加

### 2. 公演を追加

管理画面 → 公演 → 新規追加 → アーティストを選択

### 3. 選抽情報を追加

管理画面 → 選抽 → 新規追加 → 公演を選択

### 4. ドキュメントを作成

管理画面 → ドキュメント → 新規追加 → Block エディタで編集

## 🚢 デプロイ

### バックエンド

```bash
cd backend
npm run build
npm run start:prod
```

### フロントエンド

```bash
cd frontend
npm run build
npm run start
```

### 推奨デプロイ先

- **バックエンド**: Railway, Render, Heroku
- **フロントエンド**: Vercel, Netlify
- **データベース**: Railway, Supabase, AWS RDS

### 環境変数の設定

本番環境では以下を必ず変更してください：

- `JWT_SECRET`: 強力なランダム文字列に変更
- `DATABASE_URL`: 本番データベースの接続文字列
- `FRONTEND_URL`: 本番フロントエンドの URL

## 🔮 今後の拡張

- [ ] ユーザー登録・ログイン機能
- [ ] アーティスト・公演のフォロー機能
- [ ] 選抽開始・終了のメール通知
- [ ] プッシュ通知機能
- [ ] モバイルアプリ (React Native)
- [ ] AI による情報自動取得・更新
- [ ] 多言語対応（英語・中国語）
- [ ] ソーシャルシェア機能

## 🤝 コントリビューション

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 ライセンス

MIT License

## 📧 お問い合わせ

プロジェクトに関する質問は Issue を作成してください。

---

Made with ❤️ for JPOP fans
