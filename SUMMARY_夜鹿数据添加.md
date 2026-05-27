# 夜鹿（ヨルシカ）数据添加总结

## 完成的任务 ✅

### 1. 创建了数据种子文件
**文件**: `backend/prisma/seed-yorushika-2026.ts`

这个文件包含了完整的夜鹿 2026 年巡演数据：
- ✅ 艺人信息（日文、英文、中文名称）
- ✅ 搜索关键词（ヨルシカ、yorushika、夜鹿、n-buna、suis）
- ✅ 官方链接（网站、Twitter、YouTube）
- ✅ 巡演信息（JAPAN TOUR 2026）
- ✅ 10场公演详细信息
- ✅ 4轮抽选信息
- ✅ 票务信息（4种座位类型和价格）

### 2. 更新了 package.json
**文件**: `backend/package.json`

添加了新的命令脚本：
```json
"seed:yorushika": "ts-node prisma/seed-yorushika-2026.ts"
```

现在可以使用 `npm run seed:yorushika` 来导入数据！

### 3. 创建了详细的使用指南
**文件**: `YORUSHIKA_SEED_GUIDE.md` (日语版)

包含：
- 📊 完整的数据概览
- 🚀 详细的使用步骤
- 🔍 多种数据验证方法
- 📝 注意事项和重要信息
- 🛠️ 故障排除指南
- 🎨 数据自定义方法

### 4. 创建了中文快速指南
**文件**: `夜鹿数据添加指南.md` (中文版)

包含：
- ⚡ 快速开始步骤
- 📊 数据概览表格
- 🔍 查看数据的多种方法
- ❓ 常见问题解答
- ✏️ 自定义数据示例
- 👨‍💼 管理员面板使用说明

## 数据详情 📊

### 艺人信息
```
ID: yorushika
日文名: ヨルシカ
英文名: Yorushika
中文名: 夜鹿
搜索关键词: ヨルシカ, yorushika, 夜鹿, n-buna, suis
```

### 巡演信息
```
ID: yorushika-2026-tour
名称: ヨルシカ JAPAN TOUR 2026
描述: ヨルシカ 2026年全国ツアー
开始日期: 2026-03-21
结束日期: 2026-09-16
```

### 公演场次（10场）
1. **宮城** - ゼビオアリーナ仙台
   - 03.21 (六) 18:00
   - 03.22 (日) 16:00

2. **大阪** - 大阪城ホール
   - 04.18 (六) 18:00
   - 04.19 (日) 16:00

3. **愛知** - 名古屋 日本ガイシホール
   - 05.30 (六) 18:00
   - 05.31 (日) 16:00

4. **福岡** - マリンメッセ福岡A館
   - 08.04 (二) 19:00
   - 08.05 (三) 19:00

5. **千葉** - LaLa arena TOKYO-BAY
   - 09.15 (二) 19:00
   - 09.16 (三) 19:00

### 票务信息
**座位类型**:
- S席: ¥12,000（SOLD OUT）
- A席: ¥10,500
- B席: ¥9,000
- 注釈付き指定席: ¥8,500

**注意**: 未就学児入场不可（小学生以上需要票）

### 抽选信息（4轮）
1. **「後書き」会员先行（同行者会员）**
   - 1/13 18:00 ~ 1/19 23:59
   - 需要双方都是会员
   - 每人每场最多2张

2. **「後書き」会员先行（同行者非会员）**
   - 1/23 18:00 ~ 1/27 23:59
   - 仅需申请者为会员
   - 每人每场最多2张

3. **官方先行**
   - 1/30 18:00 ~ 2/8 23:59
   - 无要求
   - 通过 Lawson Ticket 申请
   - 电子票

4. **Inbound 先行**
   - 1/30 18:00 ~ 2/8 23:59
   - 面向海外顾客
   - 纸质票（当日领取）

## 如何使用 🚀

### 快速开始（3步）

```bash
# 1. 进入后端目录
cd backend

# 2. 运行种子脚本
npm run seed:yorushika

# 3. 查看结果
npm run prisma:studio
```

### 在前端查看

```bash
# 启动服务
npm run dev

# 访问以下地址：
# http://localhost:3000 - 首页搜索
# http://localhost:3000/artists/yorushika - 艺人页面
# http://localhost:3000/calendar - 日历页面
# http://localhost:3000/admin - 管理页面
```

## 技术细节 🔧

### 使用的技术
- **TypeScript**: 类型安全的代码
- **Prisma ORM**: 数据库操作
- **bcrypt**: 密码哈希（管理员账号）
- **Upsert**: 防止重复数据

### 数据库表
涉及的表：
- `artists` - 艺人信息
- `tours` - 巡演信息
- `lives` - 公演场次
- `lotteries` - 抽选信息
- `live_lotteries` - 公演和抽选的关联表
- `users` - 用户（管理员）
- `roles` - 角色
- `permissions` - 权限

### 关键特性
✨ **搜索功能**: 支持多个关键词搜索（ヨルシカ、yorushika、夜鹿等）
✨ **多语言支持**: 日文、英文、中文名称
✨ **完整关联**: 艺人、巡演、公演、抽选完全关联
✨ **幂等性**: 可以重复运行不会出错
✨ **时区处理**: 使用日本时区（+09:00）

## 测试结果 ✅

### Lint 检查
```
✅ No linter errors found
```

### 包含的数据量
- 1 个艺人
- 1 个巡演
- 10 场公演
- 4 轮抽选
- 40 个公演-抽选关联（10场 × 4轮）

## 文件清单 📁

创建/修改的文件：
1. ✅ `backend/prisma/seed-yorushika-2026.ts` - 数据种子文件
2. ✅ `backend/package.json` - 添加了 seed:yorushika 命令
3. ✅ `YORUSHIKA_SEED_GUIDE.md` - 日语版详细指南
4. ✅ `夜鹿数据添加指南.md` - 中文版快速指南
5. ✅ `SUMMARY_夜鹿数据添加.md` - 本总结文档

## 后续步骤 🎯

### 立即可以做的
1. 运行 `npm run seed:yorushika` 导入数据
2. 在前端搜索 "ヨルシカ" 查看结果
3. 访问艺人页面查看10场公演
4. 在管理面板编辑数据

### 可选操作
1. 自定义票价或抽选信息
2. 添加更多搜索关键词
3. 修改公演时间或场地
4. 添加封面图片（coverImage 字段）
5. 关联文档（使用 Document 功能）

### 扩展建议
1. 为公演添加封面图片
2. 创建公演相关文档（使用 Block Editor）
3. 添加更多抽选轮次
4. 设置公演状态变更（UPCOMING -> ONGOING -> FINISHED）

## 验证清单 ☑️

在使用前，请确认：
- ☑️ PostgreSQL 正在运行
- ☑️ `.env` 文件配置正确
- ☑️ `npm install` 已完成
- ☑️ `npm run prisma:generate` 已运行
- ☑️ 数据库已迁移 (`npm run prisma:migrate`)

## 支持和文档 📚

如果遇到问题，请参考：
- [QUICKSTART.md](./QUICKSTART.md) - 快速启动指南
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 详细设置指南
- [SEARCH_FEATURE_GUIDE.md](./SEARCH_FEATURE_GUIDE.md) - 搜索功能指南
- [YORUSHIKA_SEED_GUIDE.md](./YORUSHIKA_SEED_GUIDE.md) - 夜鹿数据详细指南
- [夜鹿数据添加指南.md](./夜鹿数据添加指南.md) - 中文快速指南

## 常见命令速查 📋

```bash
# 导入夜鹿数据
npm run seed:yorushika

# 查看数据库
npm run prisma:studio

# 启动开发服务器
npm run dev

# 重置数据库（危险！）
npx prisma migrate reset

# 查看所有种子命令
npm run seed:zutomayo    # 导入 ZUTOMAYO 数据
npm run seed:yorushika   # 导入 夜鹿 数据
npm run prisma:seed      # 导入基础数据
```

---

**创建时间**: 2026-02-03  
**状态**: ✅ 完成  
**版本**: 1.0.0

祝使用愉快！🎵🌙✨
