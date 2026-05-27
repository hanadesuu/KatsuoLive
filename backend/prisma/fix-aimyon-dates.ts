import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始修复 AIMYON 演出数据...');

  // 获取所有 AIMYON 的演出
  const lives = await prisma.live.findMany({
    where: {
      artistId: 'aimyon',
    },
    include: {
      artist: true,
    },
  });

  console.log(`找到 ${lives.length} 场演出`);

  let fixedCount = 0;
  let artistFixedCount = 0;

  for (const live of lives) {
    let needsUpdate = false;
    const updateData: any = {};

    // 检查日期是否是1970年（Unix时间戳0附近）
    const dateStart = new Date(live.dateStart);
    if (dateStart.getFullYear() < 2000) {
      console.log(`❌ 发现错误日期: ${live.title} - ${live.dateStart}`);
      
      // 尝试从ID中提取日期
      const dateMatch = live.id.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const [, year, month, day] = dateMatch;
        // 默认时间设为18:30
        const fixedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 18, 30, 0);
        updateData.dateStart = fixedDate;
        updateData.dateEnd = new Date(fixedDate.getTime() + 2.5 * 60 * 60 * 1000);
        needsUpdate = true;
        console.log(`  -> 修复为: ${fixedDate.toISOString()}`);
      }
    }

    // 检查 artist 关联
    if (!live.artist || live.artist.id !== 'aimyon') {
      console.log(`❌ 发现错误的 artist 关联: ${live.title}`);
      updateData.artistId = 'aimyon';
      needsUpdate = true;
      artistFixedCount++;
    }

    if (needsUpdate) {
      await prisma.live.update({
        where: { id: live.id },
        data: updateData,
      });
      fixedCount++;
    }
  }

  console.log(`\n✅ 修复了 ${fixedCount} 场演出的数据`);
  console.log(`✅ 修复了 ${artistFixedCount} 场演出的 artist 关联`);

  // 验证修复结果
  const verifyLives = await prisma.live.findMany({
    where: {
      artistId: 'aimyon',
    },
    include: {
      artist: true,
    },
    take: 5,
  });

  console.log('\n📋 验证前5场演出:');
  for (const live of verifyLives) {
    const date = new Date(live.dateStart);
    console.log(`  - ${live.title}`);
    console.log(`    日期: ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`);
    console.log(`    艺术家: ${live.artist?.nameJp || '未关联'}`);
  }

  console.log('\n🎉 修复完成！');
}

main()
  .catch((e) => {
    console.error('❌ 修复失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
