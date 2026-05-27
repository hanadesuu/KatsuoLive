import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 开始统一 AIMYON 演出标题格式...');

  // 获取所有 AIMYON 的演出
  const allLives = await prisma.live.findMany({
    where: {
      artistId: 'aimyon',
    },
    orderBy: {
      dateStart: 'asc',
    },
  });

  console.log(`找到 ${allLives.length} 场演出`);

  let updatedCount = 0;

  for (const live of allLives) {
    let newTitle = live.title;

    // 统一格式：将所有"第2場"、"第2卷"替换为"vol.2"
    if (live.title.includes('第2場') || live.title.includes('第2卷')) {
      newTitle = live.title
        .replace(/第2場/g, 'vol.2')
        .replace(/第2卷/g, 'vol.2');
    }

    // 确保所有 FAN CLUB TOUR 都包含 vol.2
    if (live.title.includes('FAN CLUB TOUR 2026') && !live.title.includes('vol.2') && !live.title.includes('HY 25th')) {
      // 如果标题是 "AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" 城市" 格式
      const match = live.title.match(/AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" (.+)/);
      if (match) {
        newTitle = `AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 ${match[1]}`;
      }
    }

    // 如果标题有变化，更新数据库
    if (newTitle !== live.title) {
      await prisma.live.update({
        where: { id: live.id },
        data: { title: newTitle },
      });
      console.log(`✅ 更新标题: "${live.title}" -> "${newTitle}"`);
      updatedCount++;
    }
  }

  console.log(`\n✅ 已更新 ${updatedCount} 场演出的标题`);
  console.log('🎉 标题格式统一完成！');
}

main()
  .catch((e) => {
    console.error('❌ 统一标题失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
