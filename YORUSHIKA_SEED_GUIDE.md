# ヨルシカ (Yorushika) 2026 Tour データ追加ガイド

このガイドでは、ヨルシカの2026年ツアーデータをデータベースに追加する方法を説明します。

## 📊 含まれているデータ

### アーティスト情報
- **名前**: ヨルシカ (Yorushika / 夜鹿)
- **検索キーワード**: `ヨルシカ`, `yorushika`, `夜鹿`, `n-buna`, `suis`
- **公式リンク**: ウェブサイト、Twitter、YouTube

### ツアー情報
- **ツアー名**: ヨルシカ JAPAN TOUR 2026
- **期間**: 2026年3月21日 〜 2026年9月16日
- **公演数**: 10公演（全国5都市）

### 公演スケジュール

| 日付 | 曜日 | 都市 | 会場 | 開演時間 |
|------|------|------|------|----------|
| 03.21 | SAT | 宮城 | ゼビオアリーナ仙台 | 18:00 |
| 03.22 | SUN | 宮城 | ゼビオアリーナ仙台 | 16:00 |
| 04.18 | SAT | 大阪 | 大阪城ホール | 18:00 |
| 04.19 | SUN | 大阪 | 大阪城ホール | 16:00 |
| 05.30 | SAT | 愛知 | 名古屋 日本ガイシホール | 18:00 |
| 05.31 | SUN | 愛知 | 名古屋 日本ガイシホール | 16:00 |
| 08.04 | TUE | 福岡 | マリンメッセ福岡A館 | 19:00 |
| 08.05 | WED | 福岡 | マリンメッセ福岡A館 | 19:00 |
| 09.15 | TUE | 千葉 | LaLa arena TOKYO-BAY | 19:00 |
| 09.16 | WED | 千葉 | LaLa arena TOKYO-BAY | 19:00 |

### チケット情報

#### 席種と料金
- **S席**: ¥12,000（税込）**SOLD OUT**
- **A席**: ¥10,500（税込）
- **B席**: ¥9,000（税込）
- **注釈付き指定席**: ¥8,500（税込）

※未就学児入場不可（小学生以上チケット必要）

#### 抽選情報（4ラウンド）

1. **「後書き」会員先行（同行者会員）**
   - 期間: 2026年1月13日 18:00 〜 1月19日 23:59
   - 条件: 応募者・同行者ともにヨルシカ smartphone site「後書き」会員
   - 枚数制限: 1申込み1公演最大2枚まで

2. **「後書き」会員先行（同行者非会員）**
   - 期間: 2026年1月23日 18:00 〜 1月27日 23:59
   - 条件: 応募者がヨルシカ smartphone site「後書き」会員
   - 枚数制限: 1申込み1公演最大2枚まで

3. **オフィシャル先行**
   - 期間: 2026年1月30日 18:00 〜 2月8日 23:59
   - 条件: 無
   - 受付: ローソンチケット
   - 発券: ヨルシカ公式アプリ（チケプラ電子チケット）

4. **インバウンド先行**
   - 期間: 2026年1月30日 18:00 〜 2月8日 23:59
   - 条件: 海外在住で、090/080/070で始まる日本の携帯電話番号をお持ちでないお客様
   - 発券: 紙チケット（当日引換）

## 🚀 データの追加方法

### ステップ 1: バックエンドディレクトリに移動

```bash
cd backend
```

### ステップ 2: データベースにシードを実行

```bash
npm run seed:yorushika
```

このコマンドは以下を実行します：
- ヨルシカのアーティスト情報を作成
- 2026年ツアー情報を作成
- 10公演のライブ情報を作成
- 4つの抽選ラウンド情報を作成
- ライブと抽選の関連付け

### ステップ 3: 確認

シードが成功すると、以下のようなメッセージが表示されます：

```
🎵 Adding YORUSHIKA 2026 Tour data...
✅ Permissions created
✅ Roles created
✅ Admin user created
✅ YORUSHIKA artist created
✅ Tour created
✅ All 10 live performances created
✅ FC member advance (companion must be member) created
✅ FC member advance (companion can be non-member) created
✅ Official advance created
✅ Inbound advance created

🎉 Complete YORUSHIKA 2026 Tour seed completed!
📊 Summary:
   - 10 live concerts
   - 4 lottery rounds
   - All Japan venues covered
```

## 🔍 データの確認方法

### 方法1: Prisma Studio を使用

```bash
npm run prisma:studio
```

ブラウザで `http://localhost:5555` にアクセスして、以下を確認：
- `Artist` テーブルで "ヨルシカ" を検索
- `Tour` テーブルで "ヨルシカ JAPAN TOUR 2026" を確認
- `Live` テーブルで10公演を確認
- `Lottery` テーブルで4つの抽選情報を確認

### 方法2: フロントエンドで確認

1. バックエンドとフロントエンドを起動：
```bash
# ルートディレクトリで
npm run dev
```

2. ブラウザで `http://localhost:3000` にアクセス

3. 検索バーで以下のキーワードを試す：
   - `ヨルシカ`
   - `yorushika`
   - `夜鹿`
   - `n-buna`
   - `suis`

4. ヨルシカのアーティストページに移動して、10公演がカレンダーに表示されることを確認

### 方法3: API で確認

```bash
# アーティスト情報を取得
curl http://localhost:3001/artists?search=ヨルシカ

# 特定のアーティストの公演を取得
curl http://localhost:3001/lives?artistId=yorushika

# ツアー情報を取得
curl http://localhost:3001/tours
```

## 📝 注意事項

### 重要なポイント

1. **S席はSOLD OUT**: S席は完売扱いとなっています
2. **電子チケット**: ほとんどの先行でヨルシカ公式アプリの電子チケットを使用
3. **インバウンド先行**: 海外のお客様向けに紙チケット（当日引換）を提供
4. **FC会員**: 「後書き」会員は2回の先行申込みチャンスがあります

### トラブルシューティング

#### シード実行でエラーが出る場合

1. **既にデータが存在する場合**
   ```bash
   # データベースをリセット（注意：全データが削除されます）
   npx prisma migrate reset
   npm run seed:yorushika
   ```

2. **依存関係のエラー**
   ```bash
   npm install
   npm run prisma:generate
   npm run seed:yorushika
   ```

3. **データベース接続エラー**
   - `.env` ファイルの `DATABASE_URL` が正しいか確認
   - PostgreSQL が起動しているか確認

## 🎨 データのカスタマイズ

### 席種や料金を変更したい場合

`backend/prisma/seed-yorushika-2026.ts` ファイルの `seatTypes` セクションを編集：

```typescript
seatTypes: [
  { name: 'S席', price: '¥12,000', status: 'SOLD OUT' },
  { name: 'A席', price: '¥10,500' },
  { name: 'B席', price: '¥9,000' },
  { name: '注釈付き指定席', price: '¥8,500' },
],
```

### 検索キーワードを追加したい場合

`backend/prisma/seed-yorushika-2026.ts` ファイルの `searchKeywords` セクションを編集：

```typescript
searchKeywords: ['ヨルシカ', 'yorushika', '夜鹿', 'n-buna', 'suis'],
```

変更後、再度シードを実行：
```bash
npm run seed:yorushika
```

## 🌟 次のステップ

1. **管理画面でデータを確認**: `http://localhost:3000/admin`
2. **カレンダーで公演を確認**: `http://localhost:3000/calendar`
3. **アーティストページを確認**: `http://localhost:3000/artists/yorushika`
4. **抽選情報を編集**: 管理画面から追加の抽選情報を追加可能

## 📚 関連ドキュメント

- [QUICKSTART.md](./QUICKSTART.md) - プロジェクトのクイックスタートガイド
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 詳細なセットアップガイド
- [SEARCH_FEATURE_GUIDE.md](./SEARCH_FEATURE_GUIDE.md) - 検索機能の使い方

---

Happy Coding! 🎵🌙
