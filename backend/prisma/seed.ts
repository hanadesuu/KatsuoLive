import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 创建权限
  const permissions = await Promise.all([
    // Artist permissions
    prisma.permission.upsert({
      where: { resource_action: { resource: 'artist', action: 'create' } },
      update: {},
      create: { resource: 'artist', action: 'create' },
    }),
    prisma.permission.upsert({
      where: { resource_action: { resource: 'artist', action: 'read' } },
      update: {},
      create: { resource: 'artist', action: 'read' },
    }),
    prisma.permission.upsert({
      where: { resource_action: { resource: 'artist', action: 'update' } },
      update: {},
      create: { resource: 'artist', action: 'update' },
    }),
    prisma.permission.upsert({
      where: { resource_action: { resource: 'artist', action: 'delete' } },
      update: {},
      create: { resource: 'artist', action: 'delete' },
    }),
    // Live permissions
    prisma.permission.upsert({
      where: { resource_action: { resource: 'live', action: 'create' } },
      update: {},
      create: { resource: 'live', action: 'create' },
    }),
    prisma.permission.upsert({
      where: { resource_action: { resource: 'live', action: 'read' } },
      update: {},
      create: { resource: 'live', action: 'read' },
    }),
    prisma.permission.upsert({
      where: { resource_action: { resource: 'live', action: 'update' } },
      update: {},
      create: { resource: 'live', action: 'update' },
    }),
    prisma.permission.upsert({
      where: { resource_action: { resource: 'live', action: 'delete' } },
      update: {},
      create: { resource: 'live', action: 'delete' },
    }),
  ]);

  console.log('✅ Permissions created');

  // 创建角色
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Super administrator with all permissions',
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with create, read, update, delete permissions',
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'editor' },
    update: {},
    create: {
      name: 'editor',
      description: 'Editor with read and update permissions',
      permissions: {
        connect: permissions
          .filter((p) => p.action === 'read' || p.action === 'update')
          .map((p) => ({ id: p.id })),
      },
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      description: 'Viewer with read-only permissions',
      permissions: {
        connect: permissions
          .filter((p) => p.action === 'read')
          .map((p) => ({ id: p.id })),
      },
    },
  });

  console.log('✅ Roles created');

  // 创建默认管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@katsuolive.com' },
    update: {},
    create: {
      email: 'admin@katsuolive.com',
      username: 'admin',
      password: hashedPassword,
      roleId: superAdminRole.id,
    },
  });

  console.log('✅ Default admin user created');
  console.log('   Email: admin@katsuolive.com');
  console.log('   Password: admin123');

  // 创建示例歌手
  const artist = await prisma.artist.upsert({
    where: { id: 'sample-artist' },
    update: {},
    create: {
      id: 'sample-artist',
      nameJp: 'あいみょん',
      nameEn: 'Aimyon',
      nameCn: '爱缪',
      description: 'Popular Japanese singer-songwriter',
      officialLinks: {
        website: 'https://www.aimyon.jp/',
        twitter: 'https://twitter.com/aimyong_official',
        instagram: 'https://www.instagram.com/aimyong_official/',
      },
    },
  });

  console.log('✅ Sample artist created');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
