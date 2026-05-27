import { PrismaClient, LiveStatus } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface LiveInfo {
  title: string;
  dateStart: Date;
  dateEnd?: Date;
  venue: string;
  city: string;
  officialPageUrl: string;
  lotteries?: LotteryInfo[];
}

interface LotteryInfo {
  roundType: string;
  requirement?: string;
  startTime: Date;
  endTime: Date;
  sourceUrl?: string;
  notes?: string;
  seatTypes?: Array<{ name: string; price: string }>;
  ticketLimit?: number;
  resultAnnouncementTime?: Date;
}

async function fetchYoasobiLiveData(url: string): Promise<Partial<LiveInfo>> {
  try {
    console.log(`📡 正在获取网页数据: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,zh-CN;q=0.9,en;q=0.8',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const liveInfo: Partial<LiveInfo> = {
      officialPageUrl: url,
    };

    // 尝试提取标题 - 更精确的选择器
    let title = $('h1.live-title, h1.event-title, .live-detail h1, .event-detail h1').first().text().trim();
    if (!title || title.length > 200) {
      title = $('h1').first().text().trim();
    }
    // 排除网站标题
    if (title && title.length < 200 && !title.includes('オフィシャルサイト') && !title.includes('Official Site')) {
      liveInfo.title = title;
    }

    // 尝试提取日期 - 更广泛的搜索
    let dateText = $('.live-date, .event-date, .date, [class*="date"], time').first().text().trim();
    if (!dateText) {
      // 尝试从页面文本中查找日期模式
      const pageText = $('body').text();
      const datePatterns = [
        /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})/,
        /(\d{1,2})[月\/\-](\d{1,2})[日]/,
        /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
      ];
      
      for (const pattern of datePatterns) {
        const match = pageText.match(pattern);
        if (match) {
          if (match.length === 4) {
            // 有年份
            const year = parseInt(match[1]);
            const month = parseInt(match[2]);
            const day = parseInt(match[3]);
            if (year >= 2025 && year <= 2027 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
              liveInfo.dateStart = new Date(year, month - 1, day, 19, 0, 0);
              break;
            }
          } else if (match.length === 3) {
            // 没有年份，假设是2026年
            const month = parseInt(match[1]);
            const day = parseInt(match[2]);
            if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
              liveInfo.dateStart = new Date(2026, month - 1, day, 19, 0, 0);
              break;
            }
          }
        }
      }
    } else {
      const dateMatch = dateText.match(/(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})/);
      if (dateMatch) {
        const year = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
        const day = parseInt(dateMatch[3]);
        liveInfo.dateStart = new Date(year, month - 1, day, 19, 0, 0);
      }
    }

    // 尝试提取场地
    const venueText = $('.venue, .live-venue, .event-venue, [class*="venue"]').first().text().trim();
    if (venueText && venueText.length < 100) {
      liveInfo.venue = venueText;
    }

    // 尝试提取城市
    const cityText = $('.city, .live-city, .event-city, [class*="city"]').first().text().trim();
    if (cityText && cityText.length < 50) {
      liveInfo.city = cityText;
    }

    // 只有获取到标题和日期才认为成功
    if (liveInfo.title && liveInfo.dateStart) {
      console.log(`✅ 成功获取数据: ${liveInfo.title} (${liveInfo.dateStart.toLocaleDateString('ja-JP')})`);
    } else {
      console.log(`⚠️ 获取的数据不完整: 标题=${!!liveInfo.title}, 日期=${!!liveInfo.dateStart}`);
    }
    
    return liveInfo;
  } catch (error) {
    console.error('❌ 获取网页数据失败:', error);
    return { officialPageUrl: url };
  }
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
    '横浜': '横滨',
    '横滨': '横滨',
    '名古屋': '名古屋',
  };

  const sortedCities = Object.entries(cityMap).sort((a, b) => b[0].length - a[0].length);

  for (const [key, value] of sortedCities) {
    if (title.includes(key)) {
      return value;
    }
  }

  return '未知';
}

async function main() {
  console.log('🎵 开始添加 YOASOBI 数据...');

  // 创建权限
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
    prisma.permission.upsert({
      where: { resource_action: { resource: 'lottery', action: 'create' } },
      update: {},
      create: { resource: 'lottery', action: 'create' },
    }),
    prisma.permission.upsert({
      where: { resource_action: { resource: 'lottery', action: 'read' } },
      update: {},
      create: { resource: 'lottery', action: 'read' },
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

  console.log('✅ Roles created');

  // 创建默认管理员用户
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

  console.log('✅ Admin user created');

  // 创建 YOASOBI 艺术家
  const yoasobi = await prisma.artist.upsert({
    where: { id: 'yoasobi' },
    update: {
      nameJp: 'YOASOBI',
      nameEn: 'YOASOBI',
      nameCn: 'YOASOBI',
      searchKeywords: ['yoasobi', 'ヨアソビ', 'よあそび', 'yaso', 'ayase', 'ikura', '几田りら', '夜に駆ける', 'アイドル', '夜游', '夜遊び'],
      descriptionJp: 'YOASOBI（ヨアソビ）は、2019年10月1日に結成された日本の音楽ユニット。VOCALOIDで楽曲制作を行う作曲家Ayase（作詞・作曲）と、シンガーソングライターの几田りら（ボーカル、ikura名義）からなる。団名は「夜遊び」を意味し、メンバーそれぞれの「朝の活動」に対し、YOASOBIを「夜の活動」として位置づけている。日本ソニー・ミュージックエンタテインメントが運営する小説・イラスト投稿サイト「monogatary.com」の原作を「小説音楽化」するという独自のコンセプトで活動。デビュー曲「夜に駆ける」は公開1週間で2000万再生を記録し、2024年8月時点で8億再生を突破。2023年にはアニメ「【推しの子】」の主題歌「アイドル」がBillboard Global 200で連続1位を獲得するなど、国内外で高い人気を誇る。',
      descriptionEn: 'YOASOBI is a Japanese music unit formed on October 1, 2019, consisting of Ayase (composer/lyricist), who creates music using VOCALOID, and ikura (vocalist), a singer-songwriter also known as 几田りら (Ikuta Rira). The group name means "playing at night" (夜遊び), representing their "night activities" as opposed to their individual "morning activities." YOASOBI is known for their unique concept of "novel musicization," turning original stories from "monogatary.com," a novel and illustration submission site operated by Sony Music Entertainment Japan, into music. Their debut song "Yoru ni Kakeru" (Racing into the Night) reached 20 million views in one week and exceeded 800 million views by August 2024. In 2023, their song "Idol" (アイドル), used as the theme song for the anime "Oshi no Ko," topped the Billboard Global 200 chart for consecutive weeks, gaining popularity both domestically and internationally.',
      descriptionCn: 'YOASOBI（ヨアソビ）是2019年10月1日成立的日本音乐组合，由使用VOCALOID进行音乐创作的作曲家Ayase（作词・作曲）和创作歌手几田莉拉（主唱，以ikura名义活动）组成。团名意为"夜遊び"（在夜晚玩耍），成员将各自的工作定义为"早上的活动"，而YOASOBI则是"晚上的活动"。YOASOBI的特色在于将日本索尼音乐娱乐运营的小说及插画投稿网站"monogatary.com"中的原作"小说音乐化"。出道曲《夜に駆ける》（向夜晚奔去）发布一周后获得2000万点击，截至2024年8月共获得8亿点击。2023年作为动画《我推的孩子》主题曲的《アイドル》（偶像）在Billboard Global 200连续登顶，在国内外都拥有极高人气。',
      coverImage: '/images/artists/yoasobi.jpg',
      officialLinks: {
        website: 'https://www.yoasobi-music.jp/',
        twitter: 'https://twitter.com/ayase_0404',
        youtube: 'https://www.youtube.com/@Ayase_0404',
        instagram: 'https://www.instagram.com/ayase_0404/',
      },
    },
    create: {
      id: 'yoasobi',
      nameJp: 'YOASOBI',
      nameEn: 'YOASOBI',
      nameCn: 'YOASOBI',
      searchKeywords: ['yoasobi', 'ヨアソビ', 'よあそび', 'yaso', 'ayase', 'ikura', '几田りら', '夜に駆ける', 'アイドル', '夜游', '夜遊び'],
      descriptionJp: 'YOASOBI（ヨアソビ）は、2019年10月1日に結成された日本の音楽ユニット。VOCALOIDで楽曲制作を行う作曲家Ayase（作詞・作曲）と、シンガーソングライターの几田りら（ボーカル、ikura名義）からなる。団名は「夜遊び」を意味し、メンバーそれぞれの「朝の活動」に対し、YOASOBIを「夜の活動」として位置づけている。日本ソニー・ミュージックエンタテインメントが運営する小説・イラスト投稿サイト「monogatary.com」の原作を「小説音楽化」するという独自のコンセプトで活動。デビュー曲「夜に駆ける」は公開1週間で2000万再生を記録し、2024年8月時点で8億再生を突破。2023年にはアニメ「【推しの子】」の主題歌「アイドル」がBillboard Global 200で連続1位を獲得するなど、国内外で高い人気を誇る。',
      descriptionEn: 'YOASOBI is a Japanese music unit formed on October 1, 2019, consisting of Ayase (composer/lyricist), who creates music using VOCALOID, and ikura (vocalist), a singer-songwriter also known as 几田りら (Ikuta Rira). The group name means "playing at night" (夜遊び), representing their "night activities" as opposed to their individual "morning activities." YOASOBI is known for their unique concept of "novel musicization," turning original stories from "monogatary.com," a novel and illustration submission site operated by Sony Music Entertainment Japan, into music. Their debut song "Yoru ni Kakeru" (Racing into the Night) reached 20 million views in one week and exceeded 800 million views by August 2024. In 2023, their song "Idol" (アイドル), used as the theme song for the anime "Oshi no Ko," topped the Billboard Global 200 chart for consecutive weeks, gaining popularity both domestically and internationally.',
      descriptionCn: 'YOASOBI（ヨアソビ）是2019年10月1日成立的日本音乐组合，由使用VOCALOID进行音乐创作的作曲家Ayase（作词・作曲）和创作歌手几田莉拉（主唱，以ikura名义活动）组成。团名意为"夜遊び"（在夜晚玩耍），成员将各自的工作定义为"早上的活动"，而YOASOBI则是"晚上的活动"。YOASOBI的特色在于将日本索尼音乐娱乐运营的小说及插画投稿网站"monogatary.com"中的原作"小说音乐化"。出道曲《夜に駆ける》（向夜晚奔去）发布一周后获得2000万点击，截至2024年8月共获得8亿点击。2023年作为动画《我推的孩子》主题曲的《アイドル》（偶像）在Billboard Global 200连续登顶，在国内外都拥有极高人气。',
      coverImage: '/images/artists/yoasobi.jpg',
      officialLinks: {
        website: 'https://www.yoasobi-music.jp/',
        twitter: 'https://twitter.com/ayase_0404',
        youtube: 'https://www.youtube.com/@Ayase_0404',
        instagram: 'https://www.instagram.com/ayase_0404/',
      },
    },
  });

  console.log('✅ YOASOBI 艺术家信息已创建/更新');

  // 获取两个live页面的信息
  const liveUrls = [
    'https://www.yoasobi-music.jp/live/54776',
    'https://www.yoasobi-music.jp/live/54594',
  ];

  const liveDataList: LiveInfo[] = [];

  for (const url of liveUrls) {
    const fetchedData = await fetchYoasobiLiveData(url);
    
    // 只有当获取到完整信息（标题和日期）时才使用爬取的数据
    if (fetchedData.title && fetchedData.dateStart && fetchedData.title !== 'YOASOBI オフィシャルサイト') {
      const liveInfo: LiveInfo = {
        title: fetchedData.title,
        dateStart: fetchedData.dateStart,
        dateEnd: fetchedData.dateEnd,
        venue: fetchedData.venue || '待定',
        city: fetchedData.city || extractCityFromTitle(fetchedData.title),
        officialPageUrl: url,
      };
      liveDataList.push(liveInfo);
    }
  }

  // 检查是否需要使用手动配置的数据
  // 如果爬取的数据不完整或为空，使用手动配置的数据
  const needsManualData = liveDataList.length === 0 || 
    liveDataList.some(l => !l.title || !l.dateStart || l.title.includes('未知') || l.venue === '待定');
  
  if (needsManualData) {
    console.log('⚠️ 无法从网页获取完整信息，使用手动配置的数据');
    console.log('💡 提示: 如果需要更新live信息，请访问以下链接查看详细信息并更新脚本:');
    liveUrls.forEach(url => console.log(`   - ${url}`));
    
    // 手动配置live信息（根据官网页面内容）
    liveDataList.length = 0;
    
    // 根据链接54776：YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027
    // 大阪公演
    liveDataList.push(
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 大阪公演 Day 1',
        dateStart: new Date('2026-10-24T18:00:00+09:00'),
        dateEnd: new Date('2026-10-24T21:00:00+09:00'),
        venue: '京セラドーム大阪',
        city: '大阪',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 大阪公演 Day 2',
        dateStart: new Date('2026-10-25T17:00:00+09:00'),
        dateEnd: new Date('2026-10-25T20:00:00+09:00'),
        venue: '京セラドーム大阪',
        city: '大阪',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
      // 愛知公演
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 愛知公演 Day 1',
        dateStart: new Date('2026-11-07T18:00:00+09:00'),
        dateEnd: new Date('2026-11-07T21:00:00+09:00'),
        venue: 'バンテリンドーム ナゴヤ',
        city: '愛知',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 愛知公演 Day 2',
        dateStart: new Date('2026-11-08T17:00:00+09:00'),
        dateEnd: new Date('2026-11-08T20:00:00+09:00'),
        venue: 'バンテリンドーム ナゴヤ',
        city: '愛知',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
      // 北海道公演
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 北海道公演 Day 1',
        dateStart: new Date('2026-11-14T18:00:00+09:00'),
        dateEnd: new Date('2026-11-14T21:00:00+09:00'),
        venue: '大和ハウス プレミストドーム',
        city: '北海道',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 北海道公演 Day 2',
        dateStart: new Date('2026-11-15T17:00:00+09:00'),
        dateEnd: new Date('2026-11-15T20:00:00+09:00'),
        venue: '大和ハウス プレミストドーム',
        city: '北海道',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
      // 福岡公演
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 福岡公演 Day 1',
        dateStart: new Date('2026-11-28T18:00:00+09:00'),
        dateEnd: new Date('2026-11-28T21:00:00+09:00'),
        venue: 'みずほpaypayドーム福岡',
        city: '福岡',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 福岡公演 Day 2',
        dateStart: new Date('2026-11-29T17:00:00+09:00'),
        dateEnd: new Date('2026-11-29T20:00:00+09:00'),
        venue: 'みずほpaypayドーム福岡',
        city: '福岡',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
      // 東京公演
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 東京公演 Day 1',
        dateStart: new Date('2026-12-05T18:00:00+09:00'),
        dateEnd: new Date('2026-12-05T21:00:00+09:00'),
        venue: '東京ドーム',
        city: '东京',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
      {
        title: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027 東京公演 Day 2',
        dateStart: new Date('2026-12-06T17:00:00+09:00'),
        dateEnd: new Date('2026-12-06T20:00:00+09:00'),
        venue: '東京ドーム',
        city: '东京',
        officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
      },
    );
    
    // 为所有live添加统一的抽选信息（YOASOBI ASIA 10-CITY DOME & STADIUM TOUR）
    // 根据官方信息：2026年1月4日(日)正午より = 2026年1月4日 12:00
    // 受付期間：2026年1月4日(日)12:00〜2026年2月1日(日)23:59
    const tourLottery = {
      roundType: 'YOA\'S会員最速先行',
      requirement: 'オフィシャルファンクラブ YOA\'S会員',
      startTime: new Date('2026-01-04T12:00:00+09:00'), // 2026年1月4日(日)正午
      endTime: new Date('2026-02-01T23:59:00+09:00'), // 2026年2月1日(日)23:59
      sourceUrl: 'https://yoasobi-fc.com/s/n135/?ima=4314',
      notes: 'YOA\'S会員限定のチケット最速先行受付。2026年1月4日(日)正午より受付開始。',
      seatTypes: [
        { name: '指定席', price: '¥14,000（税込）' },
        { name: 'ファミリーチケット・大人［着席指定］', price: '¥14,000（税込）' },
        { name: 'ファミリーチケット・子供［着席指定］', price: '¥8,000（税込）' },
      ],
      ticketLimit: 4, // お1人様4枚まで（複数公演申込可能）
    };
    
    // 为每个live添加抽选信息
    for (const liveData of liveDataList) {
      liveData.lotteries = [tourLottery];
    }
    
    // 根据链接54594：THE MUSIC STADIUM 2026
    liveDataList.push({
      title: 'docomo presents THE MUSIC STADIUM 2026 organized by ONE OK ROCK',
      dateStart: new Date('2026-04-05T17:30:00+09:00'), // 午後5時30分開演
      dateEnd: new Date('2026-04-05T21:00:00+09:00'),
      venue: 'MUFGスタジアム（国立競技場）',
      city: '东京',
      officialPageUrl: 'https://www.yoasobi-music.jp/live/54594',
      lotteries: [
        {
          roundType: 'YOA\'S会員先行',
          requirement: 'オフィシャルファンクラブ YOA\'S会員',
          startTime: new Date('2025-11-07T18:00:00+09:00'), // 11月7日(金)18:00
          endTime: new Date('2025-11-25T23:59:00+09:00'), // 11月25日(火)23:59
          sourceUrl: 'https://yoasobi-fc.com/news_10340/',
          notes: 'd ticketの会員登録(無料)が必要です',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 4,
        },
      ],
    });
  } else {
    // 如果从网页获取到了信息，但缺少抽选信息，添加默认的抽选信息
    for (const liveData of liveDataList) {
      if (!liveData.lotteries || liveData.lotteries.length === 0) {
        liveData.lotteries = [
          {
            roundType: 'FC会员先行',
            requirement: 'YOASOBI FC会员',
            startTime: new Date('2025-12-01T10:00:00+09:00'),
            endTime: new Date('2025-12-10T23:59:00+09:00'),
            sourceUrl: liveData.officialPageUrl,
            notes: 'FC会员可申请，具体信息请查看官网',
            seatTypes: [
              { name: '指定席', price: '待定' },
            ],
            ticketLimit: 2,
            resultAnnouncementTime: new Date('2025-12-15T18:00:00+09:00'),
          },
          {
            roundType: '一般先行',
            requirement: '无',
            startTime: new Date('2025-12-20T10:00:00+09:00'),
            endTime: new Date('2025-12-27T23:59:00+09:00'),
            sourceUrl: liveData.officialPageUrl,
            notes: '非会员也可申请，具体信息请查看官网',
            seatTypes: [
              { name: '指定席', price: '待定' },
            ],
            ticketLimit: 4,
            resultAnnouncementTime: new Date('2026-01-05T18:00:00+09:00'),
          },
        ];
      }
    }
  }

  // 创建或获取巡演
  const tour = await prisma.tour.upsert({
    where: { id: 'yoasobi-asia-tour-2026-2027' },
    update: {
      artistId: yoasobi.id,
      name: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027',
      description: 'YOASOBI史上最大規模のアジアツアー。日本国内5都市（大阪、愛知、北海道、福岡、東京）でのドーム公演。各都市2公演、計10公演。',
      startDate: new Date('2026-10-24T00:00:00+09:00'),
      endDate: new Date('2026-12-06T23:59:00+09:00'),
      officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
    },
    create: {
      id: 'yoasobi-asia-tour-2026-2027',
      artistId: yoasobi.id,
      name: 'YOASOBI ASIA 10-CITY DOME & STADIUM TOUR 2026-2027',
      description: 'YOASOBI史上最大規模のアジアツアー。日本国内5都市（大阪、愛知、北海道、福岡、東京）でのドーム公演。各都市2公演、計10公演。',
      startDate: new Date('2026-10-24T00:00:00+09:00'),
      endDate: new Date('2026-12-06T23:59:00+09:00'),
      officialPageUrl: 'https://www.yoasobi-music.jp/live/54776',
    },
  });

  console.log('✅ Tour created');

  // 先创建所有live
  const createdLives: Array<{ id: string; lotteries?: LotteryInfo[] }> = [];
  for (const liveData of liveDataList) {
    // 生成唯一的live ID：使用title生成唯一ID
    // 对于ASIA 10-CITY巡演，使用更详细的ID包含城市和日期
    let liveId: string;
    if (liveData.title.includes('ASIA 10-CITY')) {
      // 提取城市和Day信息
      const cityMatch = liveData.title.match(/(大阪|愛知|北海道|福岡|東京)公演/);
      const dayMatch = liveData.title.match(/Day (\d+)/);
      const city = cityMatch ? cityMatch[1] : 'unknown';
      const day = dayMatch ? dayMatch[1] : '1';
      const dateStr = liveData.dateStart.toISOString().split('T')[0].replace(/-/g, '');
      liveId = `yoasobi-asia-tour-2026-2027-${city}-day${day}-${dateStr}`;
    } else {
      // 其他演出使用title的hash
      const titleHash = liveData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 50);
      const urlId = liveData.officialPageUrl.split('/').pop();
      liveId = urlId && urlId !== 'live' ? `yoasobi-${urlId}-${titleHash}` : `yoasobi-${titleHash}`;
    }
    
    const live = await prisma.live.upsert({
      where: { id: liveId },
      update: {
        title: liveData.title,
        dateStart: liveData.dateStart,
        dateEnd: liveData.dateEnd,
        venue: liveData.venue,
        city: liveData.city,
        artistId: yoasobi.id,
        tourId: liveData.title.includes('ASIA 10-CITY') ? tour.id : null, // 只有巡演才关联tour
        officialPageUrl: liveData.officialPageUrl,
        status: LiveStatus.UPCOMING,
      },
      create: {
        id: liveId,
        title: liveData.title,
        dateStart: liveData.dateStart,
        dateEnd: liveData.dateEnd,
        venue: liveData.venue,
        city: liveData.city,
        artistId: yoasobi.id,
        tourId: liveData.title.includes('ASIA 10-CITY') ? tour.id : null, // 只有巡演才关联tour
        officialPageUrl: liveData.officialPageUrl,
        status: LiveStatus.UPCOMING,
      },
    });

    createdLives.push({ id: live.id, lotteries: liveData.lotteries });
    console.log(`✅ 已创建演出: ${liveData.title}`);
  }

  // 按抽选信息分组创建lottery
  const lotteryGroups = new Map<string, { lottery: LotteryInfo; liveIds: string[] }>();
  
  for (const live of createdLives) {
    if (live.lotteries && live.lotteries.length > 0) {
      for (const lotteryData of live.lotteries) {
        // 使用roundType和sourceUrl作为唯一标识
        const key = `${lotteryData.roundType}-${lotteryData.sourceUrl || ''}`;
        
        if (!lotteryGroups.has(key)) {
          lotteryGroups.set(key, { lottery: lotteryData, liveIds: [] });
        }
        lotteryGroups.get(key)!.liveIds.push(live.id);
      }
    }
  }

  // 为每个抽选组创建lottery并关联live
  for (const [key, group] of lotteryGroups.entries()) {
    const lotteryData = group.lottery;
    // 使用固定的ID，避免重复创建相同的lottery
    // 对于ASIA 10-CITY巡演的YOA'S会員最速先行，使用固定ID
    let lotteryId: string;
    if (lotteryData.roundType === 'YOA\'S会員最速先行' && 
        lotteryData.sourceUrl === 'https://yoasobi-fc.com/s/n135/?ima=4314') {
      lotteryId = 'yoasobi-asia-tour-2026-2027-yoa\'s会員最速先行';
    } else {
      lotteryId = `yoasobi-${key.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
    }
    
    const lottery = await prisma.lottery.upsert({
      where: { id: lotteryId },
      update: {
        roundType: lotteryData.roundType,
        requirement: lotteryData.requirement,
        startTime: lotteryData.startTime,
        endTime: lotteryData.endTime,
        sourceUrl: lotteryData.sourceUrl,
        notes: lotteryData.notes,
        seatTypes: lotteryData.seatTypes as any,
        ticketLimit: lotteryData.ticketLimit,
        resultAnnouncementTime: lotteryData.resultAnnouncementTime,
      },
      create: {
        id: lotteryId,
        roundType: lotteryData.roundType,
        requirement: lotteryData.requirement,
        startTime: lotteryData.startTime,
        endTime: lotteryData.endTime,
        sourceUrl: lotteryData.sourceUrl,
        notes: lotteryData.notes,
        seatTypes: lotteryData.seatTypes as any,
        ticketLimit: lotteryData.ticketLimit,
        resultAnnouncementTime: lotteryData.resultAnnouncementTime,
      },
    });

    // 为所有相关live创建关联关系
    for (const liveId of group.liveIds) {
      await prisma.liveLottery.upsert({
        where: {
          liveId_lotteryId: {
            liveId: liveId,
            lotteryId: lottery.id,
          },
        },
        update: {},
        create: {
          liveId: liveId,
          lotteryId: lottery.id,
        },
      });
    }

    console.log(`✅ 已创建抽选: ${lotteryData.roundType} (关联 ${group.liveIds.length} 个演出)`);
  }

  // 统计抽选批次数量
  const lotteryCount = liveDataList.length > 0 && liveDataList[0].lotteries && liveDataList[0].lotteries.length > 0 ? 1 : 0;

  console.log('');
  console.log('🎉 YOASOBI 数据导入完成！');
  console.log(`📊 总结:`);
  console.log(`   - ${liveDataList.length} 个演出`);
  console.log(`   - ${lotteryCount} 个抽选批次`);
}

main()
  .catch((e) => {
    console.error('❌ 导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
