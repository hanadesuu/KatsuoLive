import { PrismaClient, LiveStatus } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface LiveEvent {
  type: 'EVENT' | 'TOUR' | 'ARCHIVE';
  date: string;
  title: string;
  location?: string;
  url?: string;
}

async function fetchAimyonData(url: string): Promise<LiveEvent[]> {
  try {
    console.log(`📡 正在获取网页数据: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    const events: LiveEvent[] = [];
    const seenTitles = new Set<string>();

    // 方法1: 查找所有包含日期格式的文本节点
    $('*').each((index, element) => {
      const $el = $(element);
      const text = $el.text().trim();

      // 跳过太长的文本（可能是整个页面）
      if (text.length > 500) return;

      // 匹配格式: "EVENT 2026.02.23 MON ..." 或 "TOUR 2026.03.02 MON ..."
      const match = text.match(/^(EVENT|TOUR|ARCHIVE)\s+(\d{4}\.\d{2}\.\d{2})\s+[A-Z]{3}\s+(.+)$/);
      
      if (match) {
        const [, type, dateStr, title] = match;
        const dateParts = dateStr.split('.');
        const date = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
        const cleanTitle = title.trim();

        // 避免重复
        const key = `${date}-${cleanTitle}`;
        if (seenTitles.has(key)) return;
        seenTitles.add(key);

        // 提取地点信息
        let location: string | undefined;
        const locationPatterns = [
          /東京|东京/,
          /大阪/,
          /福岡|福冈/,
          /広島|广岛/,
          /北海道/,
          /宮城|宫城/,
          /愛知|爱知/,
        ];

        for (const pattern of locationPatterns) {
          const match = cleanTitle.match(pattern);
          if (match) {
            location = match[0];
            break;
          }
        }

        events.push({
          type: type as 'EVENT' | 'TOUR' | 'ARCHIVE',
          date,
          title: cleanTitle,
          location,
        });
      }
    });

    // 方法2: 如果没找到，尝试查找链接或列表项
    if (events.length === 0) {
      $('a, li, div, span').each((index, element) => {
        const $el = $(element);
        const text = $el.text().trim();

        if (text.length > 500 || text.length < 10) return;

        // 匹配包含日期和类型的文本
        const dateMatch = text.match(/(\d{4}\.\d{2}\.\d{2})/);
        const typeMatch = text.match(/(EVENT|TOUR|ARCHIVE)/);

        if (dateMatch && typeMatch) {
          const type = typeMatch[1] as 'EVENT' | 'TOUR' | 'ARCHIVE';
          const dateStr = dateMatch[1];
          const dateParts = dateStr.split('.');
          const date = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
          
          // 提取标题（移除类型和日期部分）
          const title = text
            .replace(/^(EVENT|TOUR|ARCHIVE)\s+/, '')
            .replace(/\d{4}\.\d{2}\.\d{2}\s+[A-Z]{3}\s+/, '')
            .trim();

          if (title && title.length > 5) {
            const key = `${date}-${title}`;
            if (seenTitles.has(key)) return;
            seenTitles.add(key);

            events.push({
              type,
              date,
              title,
            });
          }
        }
      });
    }

    console.log(`✅ 找到 ${events.length} 个演出信息`);
    return events;
  } catch (error) {
    console.error('❌ 获取网页数据失败:', error);
    if (axios.isAxiosError(error)) {
      console.error('响应状态:', error.response?.status);
      console.error('响应数据:', error.response?.data?.substring(0, 500));
    }
    throw error;
  }
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 19, 0, 0); // 默认晚上7点
}

function extractCityFromTitle(title: string): string {
  const cityMap: { [key: string]: string } = {
    '東京': '东京',
    '东京': '东京',
    '大阪': '大阪',
    '福岡': '福冈',
    '福冈': '福冈',
    '広島': '广岛',
    '广岛': '广岛',
    '北海道': '北海道',
    '宮城': '宫城',
    '宫城': '宫城',
    '愛知': '爱知',
    '爱知': '爱知',
    '神奈川': '神奈川',
    '埼玉': '埼玉',
    '千葉': '千叶',
  };

  // 按长度排序，优先匹配长地名
  const sortedCities = Object.entries(cityMap).sort((a, b) => b[0].length - a[0].length);

  for (const [key, value] of sortedCities) {
    if (title.includes(key)) {
      return value;
    }
  }

  return '未知';
}

function extractVenueFromTitle(title: string): string {
  // 尝试从标题中提取场地信息
  // 如果标题中没有明确的场地信息，使用默认值
  const venueMatch = title.match(/[A-Za-z\s]+(?:ホール|Hall|Dome|Arena|Stadium|Theater|劇場|会場)/);
  if (venueMatch) {
    return venueMatch[0].trim();
  }

  return '待定';
}

async function main() {
  console.log('🎵 开始爬取 AIMYON 数据...');

  // 创建权限和角色（如果需要）
  const permissions = await Promise.all([
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
      where: { resource_action: { resource: 'live', action: 'create' } },
      update: {},
      create: { resource: 'live', action: 'create' },
    }),
    prisma.permission.upsert({
      where: { resource_action: { resource: 'live', action: 'read' } },
      update: {},
      create: { resource: 'live', action: 'read' },
    }),
  ]);

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

  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@katsuolive.com' },
    update: {},
    create: {
      email: 'admin@katsuolive.com',
      username: 'admin',
      password: hashedPassword,
      roleId: superAdminRole.id,
    },
  });

  // 创建或更新 AIMYON 艺术家
  const aimyon = await prisma.artist.upsert({
    where: { id: 'aimyon' },
    update: {
      nameJp: 'あいみょん',
      nameEn: 'Aimyon',
      nameCn: '爱缪',
      searchKeywords: ['aimyon', 'あいみょん', '爱谬', '爱缪'],
      descriptionJp: 'あいみょん（Aimyon）は、日本のシンガーソングライター。1995年3月6日、兵庫県神戸市生まれ。2015年にシングル「生きていたんだよな」でデビュー。独特の声質と心に響く歌詞で多くの人々に愛されている。代表曲に「マリーゴールド」「ハルノヒ」「裸の心」などがある。',
      descriptionEn: 'Aimyon is a Japanese singer-songwriter born on March 6, 1995 in Kobe, Hyogo Prefecture. She made her debut in 2015 with the single "Ikite Itanda Yona" and has gained widespread attention for her unique voice and heartfelt lyrics. Her representative works include "Marigold", "Haru no Hi", and "Hadaka no Kokoro".',
      descriptionCn: 'あいみょん（Aimyon），日本创作型歌手，1995年3月6日出生于兵库县神户市。2015年以单曲《生きていたんだよな》出道，凭借独特的嗓音和真挚的歌词获得广泛关注。代表作品包括《マリーゴールド》、《ハルノヒ》、《裸の心》等。',
      coverImage: '/images/artists/aimyon.jpg',
      officialLinks: {
        website: 'https://www.aimyong.net/',
        twitter: 'https://twitter.com/aimyong_official',
        instagram: 'https://www.instagram.com/aimyong_official/',
      },
    },
    create: {
      id: 'aimyon',
      nameJp: 'あいみょん',
      nameEn: 'Aimyon',
      nameCn: '爱缪',
      searchKeywords: ['aimyon', 'あいみょん', '爱谬', '爱缪'],
      descriptionJp: 'あいみょん（Aimyon）は、日本のシンガーソングライター。1995年3月6日、兵庫県神戸市生まれ。2015年にシングル「生きていたんだよな」でデビュー。独特の声質と心に響く歌詞で多くの人々に愛されている。代表曲に「マリーゴールド」「ハルノヒ」「裸の心」などがある。',
      descriptionEn: 'Aimyon is a Japanese singer-songwriter born on March 6, 1995 in Kobe, Hyogo Prefecture. She made her debut in 2015 with the single "Ikite Itanda Yona" and has gained widespread attention for her unique voice and heartfelt lyrics. Her representative works include "Marigold", "Haru no Hi", and "Hadaka no Kokoro".',
      descriptionCn: 'あいみょん（Aimyon），日本创作型歌手，1995年3月6日出生于兵库县神户市。2015年以单曲《生きていたんだよな》出道，凭借独特的嗓音和真挚的歌词获得广泛关注。代表作品包括《マリーゴールド》、《ハルノヒ》、《裸の心》等。',
      coverImage: '/images/artists/aimyon.jpg',
      officialLinks: {
        website: 'https://www.aimyong.net/',
        twitter: 'https://twitter.com/aimyong_official',
        instagram: 'https://www.instagram.com/aimyong_official/',
      },
    },
  });

  console.log('✅ AIMYON 艺术家信息已创建/更新');

  // 爬取数据
  const url = 'https://www.aimyong.net/news/3/?page=1&range=future_event_end_time&sort=asc&lang=zh-tw';
  const events = await fetchAimyonData(url);

  if (events.length === 0) {
    console.log('⚠️ 没有找到演出数据，使用示例数据');
    // 使用示例数据
    const sampleEvents: LiveEvent[] = [
      {
        type: 'EVENT',
        date: '2026-02-23',
        title: 'HY 25th Anniversary 『BEST!!Special TIME TRIP』 (嘉賓出演)',
        location: '未知',
      },
      {
        type: 'TOUR',
        date: '2026-03-02',
        title: 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 東京',
        location: '东京',
      },
      {
        type: 'TOUR',
        date: '2026-03-03',
        title: 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 東京',
        location: '东京',
      },
      {
        type: 'TOUR',
        date: '2026-03-11',
        title: 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 廣島',
        location: '广岛',
      },
      {
        type: 'TOUR',
        date: '2026-03-13',
        title: 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 福岡',
        location: '福冈',
      },
      {
        type: 'TOUR',
        date: '2026-03-31',
        title: 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 北海道',
        location: '北海道',
      },
      {
        type: 'TOUR',
        date: '2026-04-02',
        title: 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 宮城',
        location: '宫城',
      },
      {
        type: 'TOUR',
        date: '2026-04-16',
        title: 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 愛知',
        location: '爱知',
      },
      {
        type: 'TOUR',
        date: '2026-04-17',
        title: 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 愛知',
        location: '爱知',
      },
      {
        type: 'TOUR',
        date: '2026-04-20',
        title: 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU" vol.2 大阪',
        location: '大阪',
      },
    ];

    // 处理示例数据
    for (const event of sampleEvents) {
      const dateStart = parseDate(event.date);
      const city = event.location || extractCityFromTitle(event.title);
      const venue = extractVenueFromTitle(event.title);

      // 确定巡演名称
      let tourName = 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU"';
      if (event.title.includes('HY 25th Anniversary')) {
        tourName = 'HY 25th Anniversary 『BEST!!Special TIME TRIP』';
      }

      // 创建或获取巡演
      const tour = await prisma.tour.upsert({
        where: { id: `aimyon-${tourName.replace(/\s+/g, '-').toLowerCase()}` },
        update: {},
        create: {
          id: `aimyon-${tourName.replace(/\s+/g, '-').toLowerCase()}`,
          artistId: aimyon.id,
          name: tourName,
          officialPageUrl: 'https://www.aimyong.net/news/3/',
        },
      });

      // 创建演出
      const liveId = `aimyon-${event.date}-${event.title.substring(0, 20).replace(/\s+/g, '-')}`;
      await prisma.live.upsert({
        where: { id: liveId },
        update: {
          title: event.title,
          dateStart,
          city,
          venue,
          artistId: aimyon.id,
          tourId: tour.id,
          officialPageUrl: 'https://www.aimyong.net/news/3/',
          status: LiveStatus.UPCOMING,
        },
        create: {
          id: liveId,
          title: event.title,
          dateStart,
          city,
          venue,
          artistId: aimyon.id,
          tourId: tour.id,
          officialPageUrl: 'https://www.aimyong.net/news/3/',
          status: LiveStatus.UPCOMING,
        },
      });

      console.log(`✅ 已创建演出: ${event.title} (${event.date})`);
    }
  } else {
    // 处理爬取到的数据
    for (const event of events) {
      const dateStart = parseDate(event.date);
      const city = event.location || extractCityFromTitle(event.title);
      const venue = extractVenueFromTitle(event.title);

      // 确定巡演名称
      let tourName = 'AIMYON 2026';
      if (event.title.includes('FAN CLUB TOUR')) {
        tourName = 'AIMYON FAN CLUB TOUR 2026 "PINKY PROMISE YOU"';
      } else if (event.title.includes('HY 25th Anniversary')) {
        tourName = 'HY 25th Anniversary 『BEST!!Special TIME TRIP』';
      }

      // 创建或获取巡演
      const tour = await prisma.tour.upsert({
        where: { id: `aimyon-${tourName.replace(/\s+/g, '-').toLowerCase()}` },
        update: {},
        create: {
          id: `aimyon-${tourName.replace(/\s+/g, '-').toLowerCase()}`,
          artistId: aimyon.id,
          name: tourName,
          officialPageUrl: event.url || 'https://www.aimyong.net/news/3/',
        },
      });

      // 创建演出
      const liveId = `aimyon-${event.date}-${event.title.substring(0, 20).replace(/\s+/g, '-')}`;
      await prisma.live.upsert({
        where: { id: liveId },
        update: {
          title: event.title,
          dateStart,
          city,
          venue,
          artistId: aimyon.id,
          tourId: tour.id,
          officialPageUrl: event.url || 'https://www.aimyong.net/news/3/',
          status: LiveStatus.UPCOMING,
        },
        create: {
          id: liveId,
          title: event.title,
          dateStart,
          city,
          venue,
          artistId: aimyon.id,
          tourId: tour.id,
          officialPageUrl: event.url || 'https://www.aimyong.net/news/3/',
          status: LiveStatus.UPCOMING,
        },
      });

      console.log(`✅ 已创建演出: ${event.title} (${event.date})`);
    }
  }

  console.log('🎉 AIMYON 数据导入完成！');
}

main()
  .catch((e) => {
    console.error('❌ 导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
