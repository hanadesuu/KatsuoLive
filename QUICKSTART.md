# KatsuoLive 快速启动

完整本地环境配置请看 [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)。

## 前置环境

- Node.js 18+
- npm
- PostgreSQL 14+

## 1. 安装依赖

```powershell
npm install
```

## 2. 创建数据库

默认开发数据库配置：

```text
host: localhost
port: 5432
user: postgres
password: katsuolive
database: katsuolive
```

创建数据库：

```powershell
createdb -U postgres -h localhost -p 5432 katsuolive
```

Windows 如果 `createdb` 不在 PATH 中：

```powershell
& "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres -h localhost -p 5432 katsuolive
```

## 3. 配置环境变量

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

确认后端数据库连接：

```env
DATABASE_URL="postgresql://postgres:katsuolive@localhost:5432/katsuolive?schema=public"
```

## 4. 初始化数据库

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

导入演出数据：

```powershell
npm run seed:zutomayo
npm run seed:yorushika
```

也可以按需导入：

```powershell
npm run seed:aimyon
npm run seed:yoasobi
npm run seed:ado
```

## 5. 启动服务

回到项目根目录：

```powershell
cd ..
npm run dev
```

访问地址：

- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin
- Backend API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

默认管理员：

```text
Email: admin@katsuolive.com
Password: admin123
```
