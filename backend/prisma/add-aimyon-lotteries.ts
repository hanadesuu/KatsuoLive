import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎫 开始为 AIMYON 演出添加选抽信息...');

  // 获取所有 AIMYON 的演出
  const aimyonLives = await prisma.live.findMany({
    where: {
      artistId: 'aimyon',
      status: 'UPCOMING',
    },
    orderBy: {
      dateStart: 'asc',
    },
  });

  console.log(`找到 ${aimyonLives.length} 场演出`);

  if (aimyonLives.length === 0) {
    console.log('⚠️ 没有找到演出，请先运行 seed:aimyon');
    return;
  }

  // 为 FAN CLUB TOUR 2026 的演出创建选抽信息
  const fanClubTourLives = aimyonLives.filter((live) =>
    live.title.includes('FAN CLUB TOUR 2026')
  );

  if (fanClubTourLives.length > 0) {
    console.log(`\n📋 为 ${fanClubTourLives.length} 场 FAN CLUB TOUR 演出添加选抽信息...`);

    // AIM会員優先1次抽選販売
    const fcMemberLottery1 = await prisma.lottery.upsert({
      where: { id: 'aimyon-fc-member-1' },
      update: {
        startTime: new Date('2025-10-18T18:00:00+09:00'),
        endTime: new Date('2025-11-03T23:59:00+09:00'),
        seatTypes: [
          { name: '指定席', price: '¥8,000' },
        ],
      },
      create: {
        id: 'aimyon-fc-member-1',
        roundType: 'AIM会員優先1次抽選販売',
        requirement: 'AIMYON官方粉丝俱乐部"AIM"会员（同行者也需要是会员）',
        startTime: new Date('2025-10-18T18:00:00+09:00'),
        endTime: new Date('2025-11-03T23:59:00+09:00'),
        sourceUrl: 'https://www.aimyong.net/feature/pinky_promise_you_02',
        notes: 'あいみょん公式アプリ(チケプラ電子チケット)。同行者も会員のみ。お1人様1公演につき2枚まで(複数公演申込可)。',
        seatTypes: [
          { name: '指定席', price: '¥8,000' },
        ],
        ticketLimit: 2,
      },
    });

    // AIM会員優先2次抽選販売
    const fcMemberLottery2 = await prisma.lottery.upsert({
      where: { id: 'aimyon-fc-member-2' },
      update: {
        startTime: new Date('2025-11-08T12:00:00+09:00'),
        endTime: new Date('2025-11-24T23:59:00+09:00'),
        seatTypes: [
          { name: '指定席', price: '¥8,000' },
        ],
      },
      create: {
        id: 'aimyon-fc-member-2',
        roundType: 'AIM会員優先2次抽選販売',
        requirement: 'AIMYON官方粉丝俱乐部"AIM"会员（同行者也需要是会员）',
        startTime: new Date('2025-11-08T12:00:00+09:00'),
        endTime: new Date('2025-11-24T23:59:00+09:00'),
        sourceUrl: 'https://www.aimyong.net/feature/pinky_promise_you_02',
        notes: 'あいみょん公式アプリ(チケプラ電子チケット)。同行者も会員のみ。お1人様1公演につき2枚まで(複数公演申込可)。',
        seatTypes: [
          { name: '指定席', price: '¥8,000' },
        ],
        ticketLimit: 2,
      },
    });

    // AIM会員3次先着販売
    const fcMemberLottery3 = await prisma.lottery.upsert({
      where: { id: 'aimyon-fc-member-3' },
      update: {
        startTime: new Date('2025-12-06T12:00:00+09:00'),
        seatTypes: [
          { name: '指定席', price: '¥8,000' },
        ],
      },
      create: {
        id: 'aimyon-fc-member-3',
        roundType: 'AIM会員3次先着販売',
        requirement: 'AIMYON官方粉丝俱乐部"AIM"会员（同行者也需要是会员）',
        startTime: new Date('2025-12-06T12:00:00+09:00'),
        endTime: new Date('2026-03-01T23:59:00+09:00'), // 先着贩卖，结束时间设为第一场演出前一天
        sourceUrl: 'https://www.aimyong.net/feature/pinky_promise_you_02',
        notes: 'あいみょん公式アプリ(チケプラ電子チケット)。同行者も会員のみ。お1人様1公演につき2枚まで(複数公演申込可)。',
        seatTypes: [
          { name: '指定席', price: '¥8,000' },
        ],
        ticketLimit: 2,
      },
    });

    // 为所有 FAN CLUB TOUR 演出关联选抽信息
    for (const live of fanClubTourLives) {
      // 删除现有的选抽关联
      await prisma.liveLottery.deleteMany({
        where: { liveId: live.id },
      });

      // 创建新的选抽关联
      await Promise.all([
        prisma.liveLottery.create({
          data: {
            liveId: live.id,
            lotteryId: fcMemberLottery1.id,
          },
        }),
        prisma.liveLottery.create({
          data: {
            liveId: live.id,
            lotteryId: fcMemberLottery2.id,
          },
        }),
        prisma.liveLottery.create({
          data: {
            liveId: live.id,
            lotteryId: fcMemberLottery3.id,
          },
        }),
      ]);

      console.log(`✅ 已为演出 "${live.title}" 添加选抽信息`);
    }

    console.log(`\n✅ 已为 ${fanClubTourLives.length} 场演出添加选抽信息`);
  }

  // 为其他演出（如HY 25th Anniversary）创建选抽信息
  const otherLives = aimyonLives.filter(
    (live) => !live.title.includes('FAN CLUB TOUR 2026')
  );

  if (otherLives.length > 0) {
    console.log(`\n📋 为 ${otherLives.length} 场其他演出添加选抽信息...`);

    for (const live of otherLives) {
      // 删除现有的选抽关联
      await prisma.liveLottery.deleteMany({
        where: { liveId: live.id },
      });

      // 为特殊演出创建单独的选抽信息
      const specialLottery = await prisma.lottery.upsert({
        where: { id: `aimyon-special-${live.id}` },
        update: {},
        create: {
          id: `aimyon-special-${live.id}`,
          roundType: '一般发售',
          requirement: '无',
          startTime: new Date('2026-01-15T10:00:00+09:00'),
          endTime: new Date('2026-02-20T23:59:00+09:00'),
          sourceUrl: live.officialPageUrl || 'https://www.aimyong.net/',
          notes: '每人最多申请2张。',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 2,
        },
      });

      await prisma.liveLottery.create({
        data: {
          liveId: live.id,
          lotteryId: specialLottery.id,
        },
      });

      console.log(`✅ 已为演出 "${live.title}" 添加选抽信息`);
    }
  }

  console.log('\n🎉 所有选抽信息添加完成！');
}

main()
  .catch((e) => {
    console.error('❌ 添加选抽信息失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
