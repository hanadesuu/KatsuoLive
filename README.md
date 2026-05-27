# KatsuoLive

KatsuoLive 是一个用于整理、管理和查看 JPOP 艺人演出与抽选信息的平台。项目包含前台展示页面、管理后台、NestJS API、PostgreSQL 数据库和 Prisma 数据模型。

日文旧版 README 已保留在 [README.ja.md](./README.ja.md)。

## 功能概览

- 艺人信息管理：支持艺人名称、简介、搜索关键词、官方链接和封面图。
- 巡演与演出管理：支持巡演批次、场次、日期、城市、会场和状态。
- 抽选信息管理：支持抽选批次、申请条件、时间范围、座席类型、票数限制和结果公布时间。
- 日历视图：按月查看演出安排。
- 管理后台：提供艺人、巡演、演出、抽选、文档和审计日志管理。
- 权限系统：基于角色的后台权限控制。
- API 文档：后端提供 Swagger 文档。

## 技术栈

后端：

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- JWT / Passport
- Swagger

前端：

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Zustand
- EditorJS
- Axios

## 项目结构

```text
katsuolive/
├─ backend/                 # NestJS 后端
│  ├─ prisma/               # Prisma schema、migrations、seed 脚本
│  └─ src/                  # API 模块
├─ frontend/                # Next.js 前端
│  ├─ public/               # 静态资源
│  └─ src/                  # 页面、组件和工具代码
├─ pic/                     # 原始图片素材
├─ DEVELOPMENT_SETUP.md     # 完整本地开发环境配置指南
├─ QUICKSTART.md            # 快速启动指南
└─ README.ja.md             # 日文旧版 README
```

## 快速开始

完整本地环境配置请先阅读 [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)。

最短流程：

```powershell
npm install
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

创建本地 PostgreSQL 数据库：

```powershell
createdb -U postgres -h localhost -p 5432 katsuolive
```

初始化数据库：

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run seed:zutomayo
npm run seed:yorushika
cd ..
```

启动开发服务：

```powershell
npm run dev
```

访问地址：

- 前端：http://localhost:3000
- 管理后台：http://localhost:3000/admin
- 后端 API：http://localhost:3001
- Swagger：http://localhost:3001/api/docs

默认管理员：

```text
Email: admin@katsuolive.com
Password: admin123
```

## 本地数据库

项目使用本地 PostgreSQL。推荐开发配置：

```text
host: localhost
port: 5432
user: postgres
password: katsuolive
database: katsuolive
```

`backend/.env.example` 中已经提供了对应示例：

```env
DATABASE_URL="postgresql://postgres:katsuolive@localhost:5432/katsuolive?schema=public"
```

注意：真实的 `backend/.env` 和 `frontend/.env.local` 不应提交到 Git。

## Seed 数据

基础 seed：

```powershell
cd backend
npm run prisma:seed
```

演出数据：

```powershell
npm run seed:zutomayo
npm run seed:yorushika
npm run seed:aimyon
npm run seed:yoasobi
npm run seed:ado
```

常用数据：

- `seed:zutomayo`：真夜中 / ZUTOMAYO 演出与抽选信息
- `seed:yorushika`：夜鹿 / Yorushika 2026 巡演信息

## 常用命令

根目录：

```powershell
npm run dev
npm run build
```

后端：

```powershell
cd backend
npm run start:dev
npm run build
npm run prisma:migrate
npm run prisma:studio
```

前端：

```powershell
cd frontend
npm run dev
npm run build
```

## API 路由概览

```text
POST   /auth/login
POST   /auth/register

GET    /artists
GET    /artists/:id
POST   /artists
PATCH  /artists/:id
DELETE /artists/:id

GET    /tours
GET    /tours/:id
POST   /tours
PUT    /tours/:id
DELETE /tours/:id

GET    /lives
GET    /lives/upcoming
GET    /lives/calendar/:year/:month
GET    /lives/:id
POST   /lives
PATCH  /lives/:id
DELETE /lives/:id

GET    /lotteries
GET    /lotteries/active
GET    /lotteries/timeline
GET    /lotteries/:id
POST   /lotteries
PATCH  /lotteries/:id
DELETE /lotteries/:id

GET    /documents
GET    /documents/:id
GET    /documents/slug/:slug
POST   /documents
PATCH  /documents/:id
DELETE /documents/:id

GET    /audit
GET    /audit/:resource/:resourceId
```

## 部署提示

生产环境需要单独配置：

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL`

不要在公开仓库中提交真实环境变量或数据库备份。
