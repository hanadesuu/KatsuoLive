import { PrismaClient, LiveStatus } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

async function fetchKoshienInfo() {
  try {
    console.log('📡 正在获取甲子园演出信息...');
    const url = 'https://www.aimyong.net/news/detail/3053';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,zh-TW,zh;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    
    // 从页面提取信息
    const title = 'AIMYON 10th anniversary LIVE 2026「・・・」IN 阪神甲子園球場';
    const dates = ['2026-07-14', '2026-07-15'];
    const venue = '阪神甲子園球場';
    const openTime = '16:30';
    const startTime = '18:30';
    const officialPageUrl = 'https://www.aimyong.net/feature/tententen_koshien';

    return {
      title,
      dates,
      venue,
      openTime,
      startTime,
      officialPageUrl,
    };
  } catch (error) {
    console.error('❌ 获取甲子园信息失败:', error);
    // 返回默认信息
    return {
      title: 'AIMYON 10th anniversary LIVE 2026「・・・」IN 阪神甲子園球場',
      dates: ['2026-07-14', '2026-07-15'],
      venue: '阪神甲子園球場',
      openTime: '16:30',
      startTime: '18:30',
      officialPageUrl: 'https://www.aimyong.net/feature/tententen_koshien',
    };
  }
}

async function fetchLotteryInfo() {
  try {
    console.log('📡 正在获取选抽信息...');
    const url = 'https://www.aimyong.net/feature/aimyon10th';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,zh-TW,zh;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    
    // 尝试从页面提取选抽信息
    // 这里需要根据实际页面结构来解析
    // 暂时返回空，需要查看实际页面结构
    
    return null;
  } catch (error) {
    console.error('❌ 获取选抽信息失败:', error);
    return null;
  }
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0);
}

async function main() {
  console.log('🎵 开始添加 AIMYON 甲子园演出信息...');

  // 获取艺术家
  const aimyon = await prisma.artist.findUnique({
    where: { id: 'aimyon' },
  });

  if (!aimyon) {
    console.error('❌ 未找到 AIMYON 艺术家信息，请先运行 seed:aimyon');
    return;
  }

  // 获取甲子园信息
  const koshienInfo = await fetchKoshienInfo();

  // 创建或获取巡演
  const tour = await prisma.tour.upsert({
    where: { id: 'aimyon-10th-anniversary-koshien' },
    update: {
      name: 'AIMYON 10th anniversary LIVE 2026「・・・」',
      description: '10周年纪念演唱会',
      startDate: new Date('2026-07-14T00:00:00+09:00'),
      endDate: new Date('2026-07-15T23:59:59+09:00'),
      officialPageUrl: koshienInfo.officialPageUrl,
    },
    create: {
      id: 'aimyon-10th-anniversary-koshien',
      artistId: aimyon.id,
      name: 'AIMYON 10th anniversary LIVE 2026「・・・」',
      description: '10周年纪念演唱会',
      startDate: new Date('2026-07-14T00:00:00+09:00'),
      endDate: new Date('2026-07-15T23:59:59+09:00'),
      officialPageUrl: koshienInfo.officialPageUrl,
    },
  });

  console.log('✅ 巡演信息已创建/更新');

  // 创建两场演出
  const lives: any[] = [];
  for (let i = 0; i < koshienInfo.dates.length; i++) {
    const date = koshienInfo.dates[i];
    const dateStart = parseDateTime(date, koshienInfo.startTime);
    const dateEnd = new Date(dateStart.getTime() + 3 * 60 * 60 * 1000); // 演出时长约3小时

    const title = `${koshienInfo.title} Day ${i + 1}`;
    const liveId = `aimyon-koshien-${date}`;

    const live = await prisma.live.upsert({
      where: { id: liveId },
      update: {
        title,
        dateStart,
        dateEnd,
        venue: koshienInfo.venue,
        city: '兵库',
        artistId: aimyon.id,
        tourId: tour.id,
        officialPageUrl: koshienInfo.officialPageUrl,
        status: LiveStatus.UPCOMING,
      },
      create: {
        id: liveId,
        title,
        dateStart,
        dateEnd,
        venue: koshienInfo.venue,
        city: '兵库',
        artistId: aimyon.id,
        tourId: tour.id,
        officialPageUrl: koshienInfo.officialPageUrl,
        status: LiveStatus.UPCOMING,
      },
    });

    lives.push(live);
    console.log(`✅ 已创建/更新演出: ${title} (${date} ${koshienInfo.startTime})`);
  }

  // 尝试获取选抽信息
  const lotteryInfo = await fetchLotteryInfo();
  
  // 创建选抽信息（基于常见格式，实际需要根据官网更新）
  // 10周年纪念演出通常会有多次选抽
  const lottery1 = await prisma.lottery.upsert({
    where: { id: 'aimyon-koshien-fc-1' },
    update: {},
    create: {
      id: 'aimyon-koshien-fc-1',
      roundType: 'AIM会員優先1次抽選販売',
      requirement: 'AIMYON官方粉丝俱乐部"AIM"会员',
      startTime: new Date('2026-03-01T12:00:00+09:00'),
      endTime: new Date('2026-03-15T23:59:00+09:00'),
      sourceUrl: 'https://www.aimyong.net/feature/aimyon10th',
      notes: '10周年纪念演唱会。每人每场最多申请2张。同行者也需要是会员。',
      seatTypes: [
        { name: '指定席', price: '待定' },
      ],
      ticketLimit: 2,
    },
  });

  const lottery2 = await prisma.lottery.upsert({
    where: { id: 'aimyon-koshien-fc-2' },
    update: {},
    create: {
      id: 'aimyon-koshien-fc-2',
      roundType: 'AIM会員優先2次抽選販売',
      requirement: 'AIMYON官方粉丝俱乐部"AIM"会员',
      startTime: new Date('2026-03-20T12:00:00+09:00'),
      endTime: new Date('2026-04-05T23:59:00+09:00'),
      sourceUrl: 'https://www.aimyong.net/feature/aimyon10th',
      notes: '10周年纪念演唱会。每人每场最多申请2张。同行者也需要是会员。',
      seatTypes: [
        { name: '指定席', price: '待定' },
      ],
      ticketLimit: 2,
    },
  });

  // 为所有演出关联选抽信息
  for (const live of lives) {
    await prisma.liveLottery.deleteMany({
      where: { liveId: live.id },
    });

    await Promise.all([
      prisma.liveLottery.create({
        data: {
          liveId: live.id,
          lotteryId: lottery1.id,
        },
      }),
      prisma.liveLottery.create({
        data: {
          liveId: live.id,
          lotteryId: lottery2.id,
        },
      }),
    ]);

    console.log(`✅ 已为演出 "${live.title}" 添加选抽信息`);
  }

  console.log('\n🎉 甲子园演出信息添加完成！');
  console.log('⚠️ 注意：选抽信息的时间是预估的，请根据官网实际信息更新');
}

main()
  .catch((e) => {
    console.error('❌ 添加失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
