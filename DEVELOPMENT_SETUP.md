# KatsuoLive 本地开发环境配置

这份文档用于从零配置 KatsuoLive 的本地开发环境。项目使用本地 PostgreSQL 数据库，数据库内容不会随 Git 仓库一起提交，需要开发者在本机创建数据库、执行 Prisma migration，并按需导入 seed 数据。

## 环境要求

- Node.js 18 或更高版本
- npm
- PostgreSQL 14 或更高版本
- Git

推荐本地开发配置：

- PostgreSQL host: `localhost`
- PostgreSQL port: `5432`
- PostgreSQL user: `postgres`
- PostgreSQL password: `katsuolive`
- Database name: `katsuolive`

## 1. 克隆项目

```powershell
git clone https://github.com/hanadesuu/KatsuoLive.git
cd KatsuoLive
```

如果你的本地目录名不是 `KatsuoLive`，进入实际项目目录即可。

## 2. 安装依赖

项目使用 npm workspaces，直接在根目录安装：

```powershell
npm install
```

## 3. 安装并配置 PostgreSQL

### Windows

可以使用 winget 安装 PostgreSQL 16：

```powershell
winget install --id PostgreSQL.PostgreSQL.16 --source winget
```

安装时建议设置 postgres 用户密码为：

```text
katsuolive
```

如果已经安装过 PostgreSQL，但密码不同，可以改 `.env` 里的 `DATABASE_URL`，让它匹配你本机的密码。

### macOS

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Linux

使用系统包管理器安装 PostgreSQL，例如 Ubuntu：

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 4. 创建数据库

确保 PostgreSQL 服务已经启动，然后创建数据库：

```powershell
createdb -U postgres -h localhost -p 5432 katsuolive
```

如果 `createdb` 不在 PATH 中，Windows 默认位置通常是：

```powershell
& "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres -h localhost -p 5432 katsuolive
```

如果数据库已经存在，可以跳过这一步。

## 5. 配置环境变量

后端：

```powershell
Copy-Item backend\.env.example backend\.env
```

确认 `backend\.env` 中的数据库连接如下：

```env
DATABASE_URL="postgresql://postgres:katsuolive@localhost:5432/katsuolive?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

前端：

```powershell
Copy-Item frontend\.env.example frontend\.env.local
```

确认 `frontend\.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

注意：`.env` 和 `.env.local` 是本地文件，不要提交到 Git。

## 6. 初始化数据库结构

在后端目录执行 Prisma generate 和 migration：

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
```

这会根据 `backend/prisma/schema.prisma` 和 `backend/prisma/migrations/` 在本地 PostgreSQL 中创建表结构。

## 7. 导入初始数据

基础 seed 会创建权限、角色、默认管理员和一条示例 artist：

```powershell
npm run prisma:seed
```

默认管理员账号：

```text
Email: admin@katsuolive.com
Password: admin123
```

如果需要导入项目内置的演出数据，可以继续执行：

```powershell
npm run seed:zutomayo
npm run seed:yorushika
npm run seed:aimyon
npm run seed:yoasobi
npm run seed:ado
```

常用的两份数据：

- `npm run seed:zutomayo`: 真夜中 / ZUTOMAYO 演出和抽选数据
- `npm run seed:yorushika`: 夜鹿 / Yorushika 2026 巡演数据

## 8. 启动开发服务

回到项目根目录：

```powershell
cd ..
npm run dev
```

服务地址：

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger API Docs: http://localhost:3001/api/docs
- Admin: http://localhost:3000/admin

## 常见问题

### 连接不上数据库

确认 PostgreSQL 服务正在运行：

```powershell
Get-Service -Name postgresql*
```

确认 5432 端口正在监听：

```powershell
Get-NetTCPConnection -LocalPort 5432
```

确认 `backend\.env` 的 `DATABASE_URL` 和你本机 PostgreSQL 密码一致。

### 数据库是空的

迁移只创建表结构，不会自动导入演出数据。需要执行 seed：

```powershell
cd backend
npm run prisma:seed
npm run seed:zutomayo
npm run seed:yorushika
```

### 前端能打开但没有数据

确认后端在 `http://localhost:3001` 运行，并确认前端环境变量：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

修改 `frontend\.env.local` 后需要重启前端服务。

### `npm run start:dev` 在 Windows 上启动失败

可以先构建后端，再直接启动编译后的入口：

```powershell
cd backend
npm run build
node dist/src/main.js
```

如果你的构建输出是 `dist/main.js`，则使用：

```powershell
node dist/main.js
```
