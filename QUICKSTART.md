# ⚡ クイックスタートガイド

このガイドに従えば、5分でローカル環境を立ち上げられます！

## 📦 事前準備

以下がインストール済みであることを確認してください：

- ✅ Node.js 18+
- ✅ PostgreSQL 14+
- ✅ npm または yarn

## 🚀 3ステップで起動

### ステップ 1: データベース作成

```bash
# PostgreSQL に接続
psql -U postgres

# データベース作成
CREATE DATABASE katsuolive;
\q
```

### ステップ 2: セットアップスクリプト実行

```bash
# 依存関係インストール
npm install

# 環境変数設定
cd backend
cp .env.example .env
# .env の DATABASE_URL を編集（パスワード設定）

cd ../frontend  
cp .env.example .env.local

# データベースセットアップ
cd ../backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### ステップ 3: サーバー起動

```bash
# ルートディレクトリで
npm run dev
```

## 🎉 完了！

以下の URL にアクセス：

- 🌐 **フロントエンド**: http://localhost:3000
- 🔧 **管理画面**: http://localhost:3000/admin
- 📚 **API ドキュメント**: http://localhost:3001/api/docs

### デフォルト管理者

```
Email: admin@katsuolive.com
Password: admin123
```

## 📝 最初にやること

1. 管理画面にログイン
2. アーティストを追加
3. 公演を追加
4. 選抽情報を追加
5. フロントエンドで確認！

## 🆘 問題が発生した場合

詳細なセットアップガイド: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

Happy Coding! 🎵
