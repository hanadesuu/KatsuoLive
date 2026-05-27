# AIMYON 数据爬取指南 🎵

本指南说明如何使用爬虫脚本从 AIMYON 官网爬取演出数据并录入数据库。

## 📋 功能说明

- ✅ 自动从 AIMYON 官网爬取演出信息
- ✅ 解析演出日期、标题、地点等信息
- ✅ 自动创建艺术家信息
- ✅ 自动创建巡演和演出数据
- ✅ 支持中文和日文地名识别

## 🚀 使用方法

### 1. 运行爬虫脚本

```bash
cd backend
npm run seed:aimyon
```

### 2. 查看导入结果

脚本会自动：
- 创建/更新 AIMYON 艺术家信息
- 爬取官网演出数据
- 创建巡演和演出记录
- 显示导入进度和结果

## 📊 导入的数据

脚本会导入以下信息：

### 艺术家信息
- **日文名**: あいみょん
- **英文名**: Aimyon
- **中文名**: 爱缪
- **搜索关键词**: aimyon, あいみょん, 爱谬, 爱缪
- **官方链接**: 官网、Twitter、Instagram

### 演出数据
- 演出标题
- 演出日期
- 演出地点（城市）
- 演出场地
- 巡演信息
- 官方页面链接

## 🔍 如何查看数据

### 方法1: 使用 Prisma Studio

```bash
cd backend
npm run prisma:studio
```

在浏览器打开 `http://localhost:5555`，可以查看和编辑数据库中的数据。

### 方法2: 在前端查看

```bash
# 在项目根目录
npm run dev
```

1. 打开 `http://localhost:3000`
2. 在搜索框输入 `aimyon` 或 `あいみょん` 或 `爱缪`
3. 点击搜索结果进入艺人页面
4. 查看所有演出信息

### 方法3: 使用 API

```bash
# 搜索艺人
curl http://localhost:3001/artists?search=aimyon

# 获取公演列表
curl http://localhost:3001/lives?artistId=aimyon
```

## 🔄 重新运行脚本

脚本使用了 `upsert` 方法，可以安全地多次运行：
- 如果数据已存在，会自动更新
- 如果数据不存在，会创建新记录

```bash
cd backend
npm run seed:aimyon
```

## ⚙️ 自定义配置

如果需要修改爬取的 URL 或其他配置，可以编辑文件：

**文件位置**: `backend/prisma/seed-aimyon.ts`

### 修改爬取 URL

找到以下代码并修改 URL：

```typescript
const url = 'https://www.aimyong.net/news/3/?page=1&range=future_event_end_time&sort=asc&lang=zh-tw';
```

### 添加更多城市映射

在 `extractCityFromTitle` 函数中添加城市映射：

```typescript
const cityMap: { [key: string]: string } = {
  '東京': '东京',
  '大阪': '大阪',
  // 添加更多城市...
};
```

## 🐛 常见问题

### Q: 爬取失败怎么办？

A: 脚本包含备用的示例数据。如果爬取失败，会自动使用示例数据。检查：
1. 网络连接是否正常
2. 目标网站是否可以访问
3. 查看控制台错误信息

### Q: 如何更新数据？

A: 直接重新运行脚本即可，数据会自动更新：

```bash
cd backend
npm run seed:aimyon
```

### Q: 搜索不到爱缪？

A: 确认：
1. 数据已成功导入（检查终端输出）
2. 后端服务正在运行
3. 使用正确的搜索关键词：`aimyon`、`あいみょん`、`爱缪`、`爱谬`

## 📝 数据文件位置

- **爬虫脚本**: `backend/prisma/seed-aimyon.ts`
- **数据库配置**: `backend/prisma/schema.prisma`
- **环境配置**: `backend/.env`

## 🎉 完成！

数据已成功导入数据库，可以在前端或 API 中查看和使用这些数据了！

---

Happy Coding! 🎵
