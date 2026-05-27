import { PrismaClient, LiveStatus } from '@prisma/client';

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

async function main() {
  console.log('🎵 开始添加 Ado 数据...');

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

  // 创建 Ado 艺术家
  const ado = await prisma.artist.upsert({
    where: { id: 'ado' },
    update: {
      nameJp: 'Ado',
      nameEn: 'Ado',
      nameCn: 'Ado',
      searchKeywords: ['ado', 'アド', 'うっせぇわ', '踊', '新時代', '唱', '阿童木'],
      descriptionJp: 'Ado（アド）は、2002年10月24日生まれの日本のシンガーソングライター。2020年に「うっせぇわ」でデビューし、YouTubeで1億回再生を突破。2022年にリリースした「新時代」は、映画「ONE PIECE FILM RED」の主題歌として大ヒットし、Billboard Japan Hot 100で連続1位を獲得。2024年には国立競技場でワンマンライブ「Kokoro」を開催し、初音ミクとの共演も実現。2025年には世界30都市を巡る「WORLD TOUR 2025 "Hibana"」と日本初のドームツアー「DOME TOUR 2025 "Yodaka"」を開催。圧倒的な歌唱力と表現力で、国内外で高い人気を誇る。',
      descriptionEn: 'Ado is a Japanese singer-songwriter born on October 24, 2002. She debuted in 2020 with "Usseewa" (うっせぇわ), which surpassed 100 million views on YouTube. Her 2022 release "New Genesis" (新時代), used as the theme song for the film "ONE PIECE FILM RED," became a massive hit, topping the Billboard Japan Hot 100 for consecutive weeks. In 2024, she held her first solo live "Kokoro" at the National Stadium, featuring a collaboration with Hatsune Miku. In 2025, she embarked on "WORLD TOUR 2025 \'Hibana\'" across 30 cities worldwide and her first Japanese dome tour "DOME TOUR 2025 \'Yodaka\'." Known for her powerful vocals and expressive performances, Ado enjoys immense popularity both domestically and internationally.',
      descriptionCn: 'Ado（アド）是2002年10月24日出生的日本创作歌手。2020年以《うっせぇわ》（吵死了）出道，YouTube播放量突破1亿次。2022年发行的《新時代》作为电影《ONE PIECE FILM RED》的主题曲大热，连续获得Billboard Japan Hot 100第一名。2024年在国立竞技场举办个人演唱会"Kokoro"，实现了与初音未来的共演。2025年举办世界30城市巡演"WORLD TOUR 2025 \'Hibana\'"和日本首次巨蛋巡演"DOME TOUR 2025 \'Yodaka\'"。凭借压倒性的歌唱力和表现力，在国内外都拥有极高人气。',
      coverImage: '/images/artists/ado.jpg',
      officialLinks: {
        website: 'https://ado.zhitinggg.com/',
        twitter: 'https://twitter.com/ado1024imokenp',
        youtube: 'https://www.youtube.com/@Ado1024',
        instagram: 'https://www.instagram.com/ado1024imokenp/',
      },
    },
    create: {
      id: 'ado',
      nameJp: 'Ado',
      nameEn: 'Ado',
      nameCn: 'Ado',
      searchKeywords: ['ado', 'アド', 'うっせぇわ', '踊', '新時代', '唱', '阿童木'],
      descriptionJp: 'Ado（アド）は、2002年10月24日生まれの日本のシンガーソングライター。2020年に「うっせぇわ」でデビューし、YouTubeで1億回再生を突破。2022年にリリースした「新時代」は、映画「ONE PIECE FILM RED」の主題歌として大ヒットし、Billboard Japan Hot 100で連続1位を獲得。2024年には国立競技場でワンマンライブ「Kokoro」を開催し、初音ミクとの共演も実現。2025年には世界30都市を巡る「WORLD TOUR 2025 "Hibana"」と日本初のドームツアー「DOME TOUR 2025 "Yodaka"」を開催。圧倒的な歌唱力と表現力で、国内外で高い人気を誇る。',
      descriptionEn: 'Ado is a Japanese singer-songwriter born on October 24, 2002. She debuted in 2020 with "Usseewa" (うっせぇわ), which surpassed 100 million views on YouTube. Her 2022 release "New Genesis" (新時代), used as the theme song for the film "ONE PIECE FILM RED," became a massive hit, topping the Billboard Japan Hot 100 for consecutive weeks. In 2024, she held her first solo live "Kokoro" at the National Stadium, featuring a collaboration with Hatsune Miku. In 2025, she embarked on "WORLD TOUR 2025 \'Hibana\'" across 30 cities worldwide and her first Japanese dome tour "DOME TOUR 2025 \'Yodaka\'." Known for her powerful vocals and expressive performances, Ado enjoys immense popularity both domestically and internationally.',
      descriptionCn: 'Ado（アド）是2002年10月24日出生的日本创作歌手。2020年以《うっせぇわ》（吵死了）出道，YouTube播放量突破1亿次。2022年发行的《新時代》作为电影《ONE PIECE FILM RED》的主题曲大热，连续获得Billboard Japan Hot 100第一名。2024年在国立竞技场举办个人演唱会"Kokoro"，实现了与初音未来的共演。2025年举办世界30城市巡演"WORLD TOUR 2025 \'Hibana\'"和日本首次巨蛋巡演"DOME TOUR 2025 \'Yodaka\'"。凭借压倒性的歌唱力和表现力，在国内外都拥有极高人气。',
      coverImage: '/images/artists/ado.jpg',
      officialLinks: {
        website: 'https://ado.zhitinggg.com/',
        twitter: 'https://twitter.com/ado1024imokenp',
        youtube: 'https://www.youtube.com/@Ado1024',
        instagram: 'https://www.instagram.com/ado1024imokenp/',
      },
    },
  });

  console.log('✅ Ado 艺术家信息已创建/更新');

  // ============================================
  // WORLD TOUR 2025 "Hibana" 巡演
  // ============================================
  const hibanaTour = await prisma.tour.upsert({
    where: { id: 'ado-world-tour-2025-hibana' },
    update: {
      artistId: ado.id,
      name: 'WORLD TOUR 2025 "Hibana"',
      description: 'Ado初の世界30都市を巡る大規模ワールドツアー。アジア、オーストラリア、ヨーロッパを巡り、50万人以上のファンを魅了。',
      startDate: new Date('2025-04-26T00:00:00+09:00'),
      endDate: new Date('2025-06-25T23:59:00+02:00'),
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    create: {
      id: 'ado-world-tour-2025-hibana',
      artistId: ado.id,
      name: 'WORLD TOUR 2025 "Hibana"',
      description: 'Ado初の世界30都市を巡る大規模ワールドツアー。アジア、オーストラリア、ヨーロッパを巡り、50万人以上のファンを魅了。',
      startDate: new Date('2025-04-26T00:00:00+09:00'),
      endDate: new Date('2025-06-25T23:59:00+02:00'),
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
  });

  console.log('✅ WORLD TOUR 2025 "Hibana" 巡演已创建');

  // WORLD TOUR 2025 "Hibana" 公演数据
  const hibanaLives: LiveInfo[] = [
    // 日本
    {
      title: 'WORLD TOUR 2025 "Hibana" 埼玉公演 Day 1',
      dateStart: new Date('2025-04-26T18:00:00+09:00'),
      dateEnd: new Date('2025-04-26T21:00:00+09:00'),
      venue: '埼玉超级竞技场 (Saitama Super Arena)',
      city: '埼玉',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
      lotteries: [
        {
          roundType: '会员先行抽选',
          requirement: 'Ado のドキドキ秘密基地 付费会员',
          startTime: new Date('2024-11-01T12:00:00+09:00'),
          endTime: new Date('2024-11-15T23:59:00+09:00'),
          sourceUrl: 'https://ado-dokidokihimitsukichi-daigakuimo.com/',
          notes: '付费会员网站「Ado のドキドキ秘密基地」会员可申请',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 2,
          resultAnnouncementTime: new Date('2024-11-25T18:00:00+09:00'),
        },
        {
          roundType: '一般先行抽选',
          requirement: '无',
          startTime: new Date('2024-12-01T10:00:00+09:00'),
          endTime: new Date('2024-12-15T23:59:00+09:00'),
          sourceUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
          notes: '非会员也可申请',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 4,
          resultAnnouncementTime: new Date('2024-12-20T18:00:00+09:00'),
        },
      ],
    },
    {
      title: 'WORLD TOUR 2025 "Hibana" 埼玉公演 Day 2',
      dateStart: new Date('2025-04-27T17:00:00+09:00'),
      dateEnd: new Date('2025-04-27T20:00:00+09:00'),
      venue: '埼玉超级竞技场 (Saitama Super Arena)',
      city: '埼玉',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
      lotteries: [
        {
          roundType: '会员先行抽选',
          requirement: 'Ado のドキドキ秘密基地 付费会员',
          startTime: new Date('2024-11-01T12:00:00+09:00'),
          endTime: new Date('2024-11-15T23:59:00+09:00'),
          sourceUrl: 'https://ado-dokidokihimitsukichi-daigakuimo.com/',
          notes: '付费会员网站「Ado のドキドキ秘密基地」会员可申请',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 2,
          resultAnnouncementTime: new Date('2024-11-25T18:00:00+09:00'),
        },
        {
          roundType: '一般先行抽选',
          requirement: '无',
          startTime: new Date('2024-12-01T10:00:00+09:00'),
          endTime: new Date('2024-12-15T23:59:00+09:00'),
          sourceUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
          notes: '非会员也可申请',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 4,
          resultAnnouncementTime: new Date('2024-12-20T18:00:00+09:00'),
        },
      ],
    },
    // 曼谷
    {
      title: 'WORLD TOUR 2025 "Hibana" 曼谷公演',
      dateStart: new Date('2025-05-04T19:00:00+07:00'),
      dateEnd: new Date('2025-05-04T22:00:00+07:00'),
      venue: 'IMPACT Exhibition Hall',
      city: '曼谷',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    // 马尼拉
    {
      title: 'WORLD TOUR 2025 "Hibana" 马尼拉公演',
      dateStart: new Date('2025-05-08T19:00:00+08:00'),
      dateEnd: new Date('2025-05-08T22:00:00+08:00'),
      venue: 'SM Mall of Asia Arena',
      city: '马尼拉',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    // 台北
    {
      title: 'WORLD TOUR 2025 "Hibana" 台北公演',
      dateStart: new Date('2025-05-11T19:00:00+08:00'),
      dateEnd: new Date('2025-05-11T22:00:00+08:00'),
      venue: '林口竞技场 (Linkou Arena)',
      city: '台北',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
      lotteries: [
        {
          roundType: '一般售票',
          requirement: '无',
          startTime: new Date('2024-11-22T10:00:00+08:00'),
          endTime: new Date('2025-05-11T19:00:00+08:00'),
          sourceUrl: 'https://www.kham.com.tw/',
          notes: '实名制入场，票券持有人须与订票人同一身份，需携带票券和身份证正本验证。票价：$2880 / $3880 / $4880 / $5880',
          seatTypes: [
            { name: '指定席', price: '$2880' },
            { name: '指定席', price: '$3880' },
            { name: '指定席', price: '$4880' },
            { name: '指定席', price: '$5880' },
          ],
          ticketLimit: 4,
        },
      ],
    },
    // 首尔
    {
      title: 'WORLD TOUR 2025 "Hibana" 首尔公演',
      dateStart: new Date('2025-05-15T19:00:00+09:00'),
      dateEnd: new Date('2025-05-15T22:00:00+09:00'),
      venue: 'KINTEX Hall 9',
      city: '首尔',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    // 香港
    {
      title: 'WORLD TOUR 2025 "Hibana" 香港公演',
      dateStart: new Date('2025-05-18T19:00:00+08:00'),
      dateEnd: new Date('2025-05-18T22:00:00+08:00'),
      venue: 'AsiaWorld-Arena',
      city: '香港',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    // 新加坡
    {
      title: 'WORLD TOUR 2025 "Hibana" 新加坡公演',
      dateStart: new Date('2025-05-21T19:00:00+08:00'),
      dateEnd: new Date('2025-05-21T22:00:00+08:00'),
      venue: '新加坡室内体育馆 (Singapore Indoor Stadium)',
      city: '新加坡',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    // 悉尼
    {
      title: 'WORLD TOUR 2025 "Hibana" 悉尼公演',
      dateStart: new Date('2025-05-25T19:00:00+10:00'),
      dateEnd: new Date('2025-05-25T22:00:00+10:00'),
      venue: 'Qudos Bank Arena',
      city: '悉尼',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    // 墨尔本
    {
      title: 'WORLD TOUR 2025 "Hibana" 墨尔本公演',
      dateStart: new Date('2025-05-27T19:00:00+10:00'),
      dateEnd: new Date('2025-05-27T22:00:00+10:00'),
      venue: 'Rod Laver Arena',
      city: '墨尔本',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    // 欧洲场次
    {
      title: 'WORLD TOUR 2025 "Hibana" 安特卫普公演',
      dateStart: new Date('2025-06-10T19:00:00+02:00'),
      dateEnd: new Date('2025-06-10T22:00:00+02:00'),
      venue: 'Sportpaleis',
      city: '安特卫普',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    {
      title: 'WORLD TOUR 2025 "Hibana" 哥本哈根公演',
      dateStart: new Date('2025-06-14T19:00:00+02:00'),
      dateEnd: new Date('2025-06-14T22:00:00+02:00'),
      venue: 'Royal Arena',
      city: '哥本哈根',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    {
      title: 'WORLD TOUR 2025 "Hibana" 柏林公演',
      dateStart: new Date('2025-06-17T19:00:00+02:00'),
      dateEnd: new Date('2025-06-17T22:00:00+02:00'),
      venue: 'Uber Arena',
      city: '柏林',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    {
      title: 'WORLD TOUR 2025 "Hibana" 伦敦公演',
      dateStart: new Date('2025-06-19T19:00:00+01:00'),
      dateEnd: new Date('2025-06-19T22:00:00+01:00'),
      venue: 'The O2',
      city: '伦敦',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    {
      title: 'WORLD TOUR 2025 "Hibana" 阿姆斯特丹公演',
      dateStart: new Date('2025-06-21T19:00:00+02:00'),
      dateEnd: new Date('2025-06-21T22:00:00+02:00'),
      venue: 'Ziggo Dome',
      city: '阿姆斯特丹',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
    {
      title: 'WORLD TOUR 2025 "Hibana" 巴黎公演',
      dateStart: new Date('2025-06-25T19:00:00+02:00'),
      dateEnd: new Date('2025-06-25T22:00:00+02:00'),
      venue: 'Accor Arena',
      city: '巴黎',
      officialPageUrl: 'https://sp.universal-music.co.jp/ado/hibana/',
    },
  ];

  // ============================================
  // DOME TOUR 2025 "Yodaka" 巡演
  // ============================================
  const yodakaTour = await prisma.tour.upsert({
    where: { id: 'ado-dome-tour-2025-yodaka' },
    update: {
      artistId: ado.id,
      name: 'DOME TOUR 2025 "Yodaka"',
      description: 'Ado初の日本ドームツアー。デビュー5周年を記念し、東京ドームと京セラドーム大阪で開催。25曲以上の楽曲を披露し、特別な映像演出も実現。',
      startDate: new Date('2025-11-11T00:00:00+09:00'),
      endDate: new Date('2025-11-23T23:59:00+09:00'),
      officialPageUrl: 'https://ado.zhitinggg.com/',
    },
    create: {
      id: 'ado-dome-tour-2025-yodaka',
      artistId: ado.id,
      name: 'DOME TOUR 2025 "Yodaka"',
      description: 'Ado初の日本ドームツアー。デビュー5周年を記念し、東京ドームと京セラドーム大阪で開催。25曲以上の楽曲を披露し、特別な映像演出も実現。',
      startDate: new Date('2025-11-11T00:00:00+09:00'),
      endDate: new Date('2025-11-23T23:59:00+09:00'),
      officialPageUrl: 'https://ado.zhitinggg.com/',
    },
  });

  console.log('✅ DOME TOUR 2025 "Yodaka" 巡演已创建');

  // DOME TOUR 2025 "Yodaka" 公演数据
  const yodakaLives: LiveInfo[] = [
    {
      title: 'DOME TOUR 2025 "Yodaka" 東京ドーム Day 1',
      dateStart: new Date('2025-11-11T18:00:00+09:00'),
      dateEnd: new Date('2025-11-11T21:00:00+09:00'),
      venue: '東京ドーム (Tokyo Dome)',
      city: '东京',
      officialPageUrl: 'https://ado.zhitinggg.com/',
      lotteries: [
        {
          roundType: '会员先行抽选',
          requirement: 'Ado のドキドキ秘密基地 付费会员',
          startTime: new Date('2025-06-01T12:00:00+09:00'),
          endTime: new Date('2025-06-15T23:59:00+09:00'),
          sourceUrl: 'https://ado-dokidokihimitsukichi-daigakuimo.com/',
          notes: '付费会员网站「Ado のドキドキ秘密基地」会员可申请。Ado初のドームツアー。',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 2,
          resultAnnouncementTime: new Date('2025-06-25T18:00:00+09:00'),
        },
        {
          roundType: '一般先行抽选',
          requirement: '无',
          startTime: new Date('2025-07-01T10:00:00+09:00'),
          endTime: new Date('2025-07-15T23:59:00+09:00'),
          sourceUrl: 'https://ado.zhitinggg.com/',
          notes: '非会员也可申请',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 4,
          resultAnnouncementTime: new Date('2025-07-20T18:00:00+09:00'),
        },
      ],
    },
    {
      title: 'DOME TOUR 2025 "Yodaka" 東京ドーム Day 2',
      dateStart: new Date('2025-11-12T17:00:00+09:00'),
      dateEnd: new Date('2025-11-12T20:00:00+09:00'),
      venue: '東京ドーム (Tokyo Dome)',
      city: '东京',
      officialPageUrl: 'https://ado.zhitinggg.com/',
      lotteries: [
        {
          roundType: '会员先行抽选',
          requirement: 'Ado のドキドキ秘密基地 付费会员',
          startTime: new Date('2025-06-01T12:00:00+09:00'),
          endTime: new Date('2025-06-15T23:59:00+09:00'),
          sourceUrl: 'https://ado-dokidokihimitsukichi-daigakuimo.com/',
          notes: '付费会员网站「Ado のドキドキ秘密基地」会员可申请。Ado初のドームツアー。',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 2,
          resultAnnouncementTime: new Date('2025-06-25T18:00:00+09:00'),
        },
        {
          roundType: '一般先行抽选',
          requirement: '无',
          startTime: new Date('2025-07-01T10:00:00+09:00'),
          endTime: new Date('2025-07-15T23:59:00+09:00'),
          sourceUrl: 'https://ado.zhitinggg.com/',
          notes: '非会员也可申请',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 4,
          resultAnnouncementTime: new Date('2025-07-20T18:00:00+09:00'),
        },
      ],
    },
    {
      title: 'DOME TOUR 2025 "Yodaka" 京セラドーム大阪 Day 1',
      dateStart: new Date('2025-11-22T18:00:00+09:00'),
      dateEnd: new Date('2025-11-22T21:00:00+09:00'),
      venue: '京セラドーム大阪 (Kyocera Dome Osaka)',
      city: '大阪',
      officialPageUrl: 'https://ado.zhitinggg.com/',
      lotteries: [
        {
          roundType: '会员先行抽选',
          requirement: 'Ado のドキドキ秘密基地 付费会员',
          startTime: new Date('2025-06-01T12:00:00+09:00'),
          endTime: new Date('2025-06-15T23:59:00+09:00'),
          sourceUrl: 'https://ado-dokidokihimitsukichi-daigakuimo.com/',
          notes: '付费会员网站「Ado のドキドキ秘密基地」会员可申请。Ado初のドームツアー。',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 2,
          resultAnnouncementTime: new Date('2025-06-25T18:00:00+09:00'),
        },
        {
          roundType: '一般先行抽选',
          requirement: '无',
          startTime: new Date('2025-07-01T10:00:00+09:00'),
          endTime: new Date('2025-07-15T23:59:00+09:00'),
          sourceUrl: 'https://ado.zhitinggg.com/',
          notes: '非会员也可申请',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 4,
          resultAnnouncementTime: new Date('2025-07-20T18:00:00+09:00'),
        },
      ],
    },
    {
      title: 'DOME TOUR 2025 "Yodaka" 京セラドーム大阪 Day 2',
      dateStart: new Date('2025-11-23T17:00:00+09:00'),
      dateEnd: new Date('2025-11-23T20:00:00+09:00'),
      venue: '京セラドーム大阪 (Kyocera Dome Osaka)',
      city: '大阪',
      officialPageUrl: 'https://ado.zhitinggg.com/',
      lotteries: [
        {
          roundType: '会员先行抽选',
          requirement: 'Ado のドキドキ秘密基地 付费会员',
          startTime: new Date('2025-06-01T12:00:00+09:00'),
          endTime: new Date('2025-06-15T23:59:00+09:00'),
          sourceUrl: 'https://ado-dokidokihimitsukichi-daigakuimo.com/',
          notes: '付费会员网站「Ado のドキドキ秘密基地」会员可申请。Ado初のドームツアー。',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 2,
          resultAnnouncementTime: new Date('2025-06-25T18:00:00+09:00'),
        },
        {
          roundType: '一般先行抽选',
          requirement: '无',
          startTime: new Date('2025-07-01T10:00:00+09:00'),
          endTime: new Date('2025-07-15T23:59:00+09:00'),
          sourceUrl: 'https://ado.zhitinggg.com/',
          notes: '非会员也可申请',
          seatTypes: [
            { name: '指定席', price: '待定' },
          ],
          ticketLimit: 4,
          resultAnnouncementTime: new Date('2025-07-20T18:00:00+09:00'),
        },
      ],
    },
  ];

  // 合并所有公演
  const allLives = [...hibanaLives, ...yodakaLives];

  // 为没有抽选信息的海外场次添加一般售票信息
  for (const liveData of allLives) {
    if (!liveData.lotteries || liveData.lotteries.length === 0) {
      // 海外场次使用一般售票
      if (!liveData.city.includes('埼玉') && !liveData.city.includes('东京') && !liveData.city.includes('大阪')) {
        liveData.lotteries = [
          {
            roundType: '一般售票',
            requirement: '无',
            startTime: new Date('2024-12-01T10:00:00+09:00'),
            endTime: liveData.dateStart,
            sourceUrl: liveData.officialPageUrl,
            notes: '具体售票时间和票价请查看官网',
            seatTypes: [
              { name: '指定席', price: '待定' },
            ],
            ticketLimit: 4,
          },
        ];
      }
    }
  }

  // 创建所有live
  const createdLives: Array<{ id: string; lotteries?: LotteryInfo[] }> = [];
  for (const liveData of allLives) {
    // 生成唯一的live ID
    const titleHash = liveData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 50);
    const dateStr = liveData.dateStart.toISOString().split('T')[0].replace(/-/g, '');
    const liveId = `ado-${titleHash}-${dateStr}`;
    
    const tourId = liveData.title.includes('Hibana') ? hibanaTour.id : yodakaTour.id;
    
    const live = await prisma.live.upsert({
      where: { id: liveId },
      update: {
        title: liveData.title,
        dateStart: liveData.dateStart,
        dateEnd: liveData.dateEnd,
        venue: liveData.venue,
        city: liveData.city,
        artistId: ado.id,
        tourId: tourId,
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
        artistId: ado.id,
        tourId: tourId,
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
    // 生成lottery ID
    const lotteryId = `ado-${key.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
    
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
  const lotteryCount = lotteryGroups.size;

  console.log('');
  console.log('🎉 Ado 数据导入完成！');
  console.log(`📊 总结:`);
  console.log(`   - ${allLives.length} 个演出`);
  console.log(`   - 2 个巡演 (WORLD TOUR 2025 "Hibana" 和 DOME TOUR 2025 "Yodaka")`);
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
