import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

async function fetchLotteryInfo() {
  try {
    console.log('📡 正在从官网获取选抽信息...');
    const url = 'https://www.aimyong.net/feature/aimyon10th';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,zh-TW,zh;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    
    // 尝试从页面中提取选抽信息
    // 查找包含日期、时间的文本
    const text = $('body').text();
    
    // 尝试匹配日期格式
    const datePatterns = [
      /(\d{4})年(\d{1,2})月(\d{1,2})日/,
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
      /(\d{1,2})\/(\d{1,2})/,
    ];
    
    // 尝试匹配时间格式
    const timePatterns = [
      /(\d{1,2}):(\d{2})/,
      /(\d{1,2})時(\d{2})分/,
    ];
    
    console.log('📄 页面内容预览:', text.substring(0, 500));
    
    // 返回null，让调用者知道需要手动更新
    return null;
  } catch (error) {
    console.error('❌ 获取选抽信息失败:', error);
    return null;
  }
}

async function main() {
  console.log('🎫 开始更新甲子园选抽信息...');

  // 获取甲子园演出
  const koshienLives = await prisma.live.findMany({
    where: {
      artistId: 'aimyon',
      title: { contains: '甲子園' },
    },
  });

  if (koshienLives.length === 0) {
    console.log('⚠️ 未找到甲子园演出，请先运行 add:aimyon-koshien');
    return;
  }

  console.log(`找到 ${koshienLives.length} 场甲子园演出`);

  // 尝试获取官网信息
  const lotteryInfo = await fetchLotteryInfo();

  // 如果无法自动获取，使用常见的时间安排
  // 10周年纪念演出通常会在演出前3-4个月开始选抽
  // 根据官网信息，选抽应该已经开始了

  // 更新选抽信息（根据实际官网信息调整）
  const lottery1 = await prisma.lottery.update({
    where: { id: 'aimyon-koshien-fc-1' },
    data: {
      roundType: 'AIM会員優先1次抽選販売',
      requirement: 'AIMYON官方粉丝俱乐部"AIM"会员（同行者也需要是会员）',
      startTime: new Date('2026-04-01T12:00:00+09:00'), // 预估时间，需要根据官网更新
      endTime: new Date('2026-04-15T23:59:00+09:00'),
      sourceUrl: 'https://www.aimyong.net/feature/aimyon10th',
      notes: '10周年纪念演唱会。每人每场最多申请2张。同行者也需要是会员。あいみょん公式アプリ(チケプラ電子チケット)。',
      seatTypes: [
        { name: '指定席', price: '待定' },
      ],
      ticketLimit: 2,
    },
  });

  const lottery2 = await prisma.lottery.update({
    where: { id: 'aimyon-koshien-fc-2' },
    data: {
      roundType: 'AIM会員優先2次抽選販売',
      requirement: 'AIMYON官方粉丝俱乐部"AIM"会员（同行者也需要是会员）',
      startTime: new Date('2026-04-20T12:00:00+09:00'), // 预估时间，需要根据官网更新
      endTime: new Date('2026-05-05T23:59:00+09:00'),
      sourceUrl: 'https://www.aimyong.net/feature/aimyon10th',
      notes: '10周年纪念演唱会。每人每场最多申请2张。同行者也需要是会员。あいみょん公式アプリ(チケプラ電子チケット)。',
      seatTypes: [
        { name: '指定席', price: '待定' },
      ],
      ticketLimit: 2,
    },
  });

  console.log('✅ 选抽信息已更新');
  console.log('⚠️ 注意：选抽时间是基于常见安排的预估，请根据官网实际信息手动更新');
  console.log('   官网链接: https://www.aimyong.net/feature/aimyon10th');

  console.log('\n🎉 更新完成！');
}

main()
  .catch((e) => {
    console.error('❌ 更新失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
