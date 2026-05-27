import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 开始修复巡演日期...');

  // 获取所有巡演
  const tours = await prisma.tour.findMany({
    include: {
      lives: {
        select: {
          dateStart: true,
          dateEnd: true,
        },
        orderBy: {
          dateStart: 'asc',
        },
      },
    },
  });

  console.log(`找到 ${tours.length} 个巡演`);

  let fixedCount = 0;

  for (const tour of tours) {
    // 检查日期是否是1970年或无效
    const hasInvalidDate = 
      (tour.startDate && new Date(tour.startDate).getFullYear() < 2000) ||
      (tour.endDate && new Date(tour.endDate).getFullYear() < 2000);

    if (hasInvalidDate || !tour.startDate || !tour.endDate) {
      // 从关联的演出中计算日期
      if (tour.lives && tour.lives.length > 0) {
        const dates = tour.lives
          .map(live => live.dateStart)
          .filter(date => date != null);
        
        if (dates.length > 0) {
          const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
          
          const endDates = tour.lives
            .map(live => live.dateEnd || live.dateStart)
            .filter(date => date != null);
          
          const endDate = endDates.length > 0 
            ? new Date(Math.max(...endDates.map(d => d.getTime())))
            : startDate;

          await prisma.tour.update({
            where: { id: tour.id },
            data: {
              startDate,
              endDate,
            },
          });

          console.log(`✅ 修复巡演: ${tour.name}`);
          console.log(`   开始日期: ${startDate.toISOString().split('T')[0]}`);
          console.log(`   结束日期: ${endDate.toISOString().split('T')[0]}`);
          fixedCount++;
        } else {
          console.log(`⚠️ 巡演 "${tour.name}" 没有有效的演出日期`);
        }
      } else {
        console.log(`⚠️ 巡演 "${tour.name}" 没有关联的演出`);
      }
    }
  }

  console.log(`\n✅ 修复了 ${fixedCount} 个巡演的日期`);
  console.log('🎉 修复完成！');
}

main()
  .catch((e) => {
    console.error('❌ 修复失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
