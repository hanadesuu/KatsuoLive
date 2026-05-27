import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 开始清理 AIMYON 重复的演出数据...');

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

  // 找出重复的演出（基于日期和城市）
  const liveMap = new Map<string, any[]>();

  for (const live of allLives) {
    const key = `${live.dateStart.toISOString().split('T')[0]}-${live.city}`;
    if (!liveMap.has(key)) {
      liveMap.set(key, []);
    }
    liveMap.get(key)!.push(live);
  }

  // 删除重复的旧数据
  let deletedCount = 0;
  
  // 先删除所有旧格式的演出（包含"第2場"、"vol.2"、"第2卷"的）
  const oldFormatLives = allLives.filter((live) => 
    live.title.includes('第2場') || live.title.includes('vol.2') || live.title.includes('第2卷')
  );

  for (const live of oldFormatLives) {
    console.log(`🗑️ 删除旧格式演出: ${live.title} (${live.id})`);
    await prisma.liveLottery.deleteMany({
      where: { liveId: live.id },
    });
    await prisma.live.delete({
      where: { id: live.id },
    });
    deletedCount++;
  }

  // 然后处理同一天同一城市的重复
  for (const [key, lives] of liveMap.entries()) {
    if (lives.length > 1) {
      // 保留ID更规范的（新格式）
      lives.sort((a, b) => {
        // 优先保留标题更简洁的
        const aIsSimple = a.title.split(' ').length <= 6;
        const bIsSimple = b.title.split(' ').length <= 6;
        
        if (aIsSimple && !bIsSimple) return -1;
        if (!aIsSimple && bIsSimple) return 1;
        
        return a.id.localeCompare(b.id);
      });

      // 删除除了第一个（最新的）之外的所有
      const toDelete = lives.slice(1);
      for (const live of toDelete) {
        // 跳过已经删除的
        if (oldFormatLives.find(l => l.id === live.id)) continue;
        
        console.log(`🗑️ 删除重复演出: ${live.title} (${live.id})`);
        await prisma.liveLottery.deleteMany({
          where: { liveId: live.id },
        });
        await prisma.live.delete({
          where: { id: live.id },
        });
        deletedCount++;
      }
    }
  }

  console.log(`\n✅ 已删除 ${deletedCount} 场重复演出`);
  console.log('🎉 清理完成！');
}

main()
  .catch((e) => {
    console.error('❌ 清理失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
