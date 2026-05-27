import { PrismaClient, LiveStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎵 Adding complete ZUTOMAYO INTENSE II data...');

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

  // 创建 ZUTOMAYO 艺术家
  const zutomayo = await prisma.artist.upsert({
    where: { id: 'zutomayo' },
    update: {
      searchKeywords: ['ztmy', '真夜中', 'ずとまよ'],
    },
    create: {
      id: 'zutomayo',
      nameJp: 'ずっと真夜中でいいのに。',
      nameEn: 'ZUTOMAYO',
      nameCn: 'ZUTOMAYO',
      searchKeywords: ['ztmy', '真夜中', 'ずとまよ'],
      description: 'Japanese music unit',
      officialLinks: {
        website: 'https://zutomayo.net/',
        twitter: 'https://twitter.com/zutomayo',
        youtube: 'https://www.youtube.com/@zutomayo',
      },
    },
  });

  console.log('✅ ZUTOMAYO artist created');

  // 创建巡演/系列
  const intense2Tour = await prisma.tour.upsert({
    where: { id: 'zutomayo-intense2-tour' },
    update: {
      artistId: zutomayo.id,
      name: 'INTENSE II「坐・ZOMBIE CRAB LABO」',
      description: 'JAPAN & ASIA TOUR 2026',
      startDate: new Date('2026-02-28T00:00:00+09:00'),
      endDate: new Date('2026-06-18T23:59:00+09:00'),
      officialPageUrl: 'https://zutomayo.net/intense2/',
    },
    create: {
      id: 'zutomayo-intense2-tour',
      artistId: zutomayo.id,
      name: 'INTENSE II「坐・ZOMBIE CRAB LABO」',
      description: 'JAPAN & ASIA TOUR 2026',
      startDate: new Date('2026-02-28T00:00:00+09:00'),
      endDate: new Date('2026-06-18T23:59:00+09:00'),
      officialPageUrl: 'https://zutomayo.net/intense2/',
    },
  });

  console.log('✅ Tour created');

  // 创建公演数据
  const lives = {
    budokan1: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-budokan-0228',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」东京 Day 1',
        dateStart: new Date('2026-02-28T19:00:00+09:00'),
        dateEnd: new Date('2026-02-28T21:30:00+09:00'),
        venue: '日本武道馆 (Nippon Budokan)',
        city: '东京',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    budokan2: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-budokan-0301',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」东京 Day 2',
        dateStart: new Date('2026-03-01T18:00:00+09:00'),
        dateEnd: new Date('2026-03-01T20:30:00+09:00'),
        venue: '日本武道馆 (Nippon Budokan)',
        city: '东京',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    seoul1: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-seoul-0314',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」首尔 Day 1',
        dateStart: new Date('2026-03-14T18:00:00+09:00'),
        dateEnd: new Date('2026-03-14T20:30:00+09:00'),
        venue: '高丽大学 TIGER DOME',
        city: '首尔',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    seoul2: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-seoul-0315',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」首尔 Day 2',
        dateStart: new Date('2026-03-15T18:00:00+09:00'),
        dateEnd: new Date('2026-03-15T20:30:00+09:00'),
        venue: '高丽大学 TIGER DOME',
        city: '首尔',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    fukuoka1: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-fukuoka-0328',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」福冈 Day 1',
        dateStart: new Date('2026-03-28T18:30:00+09:00'),
        dateEnd: new Date('2026-03-28T21:00:00+09:00'),
        venue: '马林梅塞福冈B馆',
        city: '福冈',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    fukuoka2: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-fukuoka-0329',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」福冈 Day 2',
        dateStart: new Date('2026-03-29T17:30:00+09:00'),
        dateEnd: new Date('2026-03-29T20:00:00+09:00'),
        venue: '马林梅塞福冈B馆',
        city: '福冈',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    yokohama1: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-yokohama-0404',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」横滨 Day 1',
        dateStart: new Date('2026-04-04T18:30:00+09:00'),
        dateEnd: new Date('2026-04-04T21:00:00+09:00'),
        venue: '横滨竞技场 (YOKOHAMA ARENA)',
        city: '横滨',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    yokohama2: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-yokohama-0405',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」横滨 Day 2',
        dateStart: new Date('2026-04-05T17:30:00+09:00'),
        dateEnd: new Date('2026-04-05T20:00:00+09:00'),
        venue: '横滨竞技场 (YOKOHAMA ARENA)',
        city: '横滨',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    singapore: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-singapore-0417',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」新加坡',
        dateStart: new Date('2026-04-17T20:00:00+08:00'),
        dateEnd: new Date('2026-04-17T22:30:00+08:00'),
        venue: 'The Star Theatre',
        city: '新加坡',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    osaka1: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-osaka-0424',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」大阪 Day 1',
        dateStart: new Date('2026-04-24T19:00:00+09:00'),
        dateEnd: new Date('2026-04-24T21:30:00+09:00'),
        venue: '大阪城ホール',
        city: '大阪',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    osaka2: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-osaka-0425',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」大阪 Day 2',
        dateStart: new Date('2026-04-25T18:00:00+09:00'),
        dateEnd: new Date('2026-04-25T20:30:00+09:00'),
        venue: '大阪城ホール',
        city: '大阪',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    bangkok: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-bangkok-0502',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」曼谷',
        dateStart: new Date('2026-05-02T20:00:00+07:00'),
        dateEnd: new Date('2026-05-02T22:30:00+07:00'),
        venue: 'Union Hall',
        city: '曼谷',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    taipei1: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-taipei-0516',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」台北 Day 1',
        dateStart: new Date('2026-05-16T18:00:00+08:00'),
        dateEnd: new Date('2026-05-16T20:30:00+08:00'),
        venue: 'New Taipei City Exhibition Hall',
        city: '台北',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    taipei2: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-taipei-0517',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」台北 Day 2',
        dateStart: new Date('2026-05-17T17:00:00+08:00'),
        dateEnd: new Date('2026-05-17T19:30:00+08:00'),
        venue: 'New Taipei City Exhibition Hall',
        city: '台北',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    karena1: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-karena-0602',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」横滨 K-Arena Day 1',
        dateStart: new Date('2026-06-02T19:00:00+09:00'),
        dateEnd: new Date('2026-06-02T21:30:00+09:00'),
        venue: 'K-Arena 横滨',
        city: '横滨',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    karena2: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-karena-0603',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」横滨 K-Arena Day 2',
        dateStart: new Date('2026-06-03T19:00:00+09:00'),
        dateEnd: new Date('2026-06-03T21:30:00+09:00'),
        venue: 'K-Arena 横滨',
        city: '横滨',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    hongkong: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-hongkong-0606',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」香港',
        dateStart: new Date('2026-06-06T20:00:00+08:00'),
        dateEnd: new Date('2026-06-06T22:30:00+08:00'),
        venue: 'AsiaWorld-Expo Hall 10',
        city: '香港',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    kobe1: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-kobe-0617',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」神户 Day 1',
        dateStart: new Date('2026-06-17T19:00:00+09:00'),
        dateEnd: new Date('2026-06-17T21:30:00+09:00'),
        venue: 'GLION ARENA',
        city: '神户',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
    kobe2: await prisma.live.create({
      data: {
        id: 'zutomayo-intense2-kobe-0618',
        title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」神户 Day 2',
        dateStart: new Date('2026-06-18T19:00:00+09:00'),
        dateEnd: new Date('2026-06-18T21:30:00+09:00'),
        venue: 'GLION ARENA',
        city: '神户',
        officialPageUrl: 'https://zutomayo.net/intense2/',
        status: LiveStatus.UPCOMING,
        artistId: zutomayo.id,
        tourId: intense2Tour.id,
      },
    }),
  };

  console.log('✅ All 19 lives created');

  // ============================================
  // 日本公演（东京、横滨、大阪、K-Arena、神户）- 4个批次
  // ============================================

  // 批次1: PREMIUM会员最速先行
  const jpPremium1 = await prisma.lottery.create({
    data: {
      roundType: 'PREMIUM会员最速先行',
      requirement: 'ZUTOMAYO PREMIUM 会员',
      startTime: new Date('2025-11-19T17:00:00+09:00'),
      endTime: new Date('2025-12-01T23:59:00+09:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '同行者非会员也可申请',
      seatTypes: [
        { name: 'Premium Seat', price: '¥11,000' },
        { name: 'Reserved Seat', price: '¥9,900' },
      ],
      ticketLimit: 2,
      resultAnnouncementTime: new Date('2025-12-10T18:00:00+09:00'),
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.budokan1.id, lotteryId: jpPremium1.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.budokan2.id, lotteryId: jpPremium1.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.yokohama1.id, lotteryId: jpPremium1.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.yokohama2.id, lotteryId: jpPremium1.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka1.id, lotteryId: jpPremium1.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka2.id, lotteryId: jpPremium1.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.karena1.id, lotteryId: jpPremium1.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.karena2.id, lotteryId: jpPremium1.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.kobe1.id, lotteryId: jpPremium1.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.kobe2.id, lotteryId: jpPremium1.id } }),
  ]);

  // 批次2: PREMIUM会员2次先行
  const jpPremium2 = await prisma.lottery.create({
    data: {
      roundType: 'PREMIUM会员2次先行',
      requirement: 'ZUTOMAYO PREMIUM 会员',
      startTime: new Date('2025-12-10T18:00:00+09:00'),
      endTime: new Date('2025-12-15T23:59:00+09:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '同行者非会员也可申请',
      seatTypes: [
        { name: 'Reserved Seat', price: '¥9,900' },
      ],
      ticketLimit: 2,
      resultAnnouncementTime: new Date('2025-12-24T18:00:00+09:00'),
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.budokan1.id, lotteryId: jpPremium2.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.budokan2.id, lotteryId: jpPremium2.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.yokohama1.id, lotteryId: jpPremium2.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.yokohama2.id, lotteryId: jpPremium2.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka1.id, lotteryId: jpPremium2.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka2.id, lotteryId: jpPremium2.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.karena1.id, lotteryId: jpPremium2.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.karena2.id, lotteryId: jpPremium2.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.kobe1.id, lotteryId: jpPremium2.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.kobe2.id, lotteryId: jpPremium2.id } }),
  ]);

  // 批次3: 一般最速先行
  const jpGeneral = await prisma.lottery.create({
    data: {
      roundType: '一般最速先行',
      requirement: '无',
      startTime: new Date('2025-12-24T18:00:00+09:00'),
      endTime: new Date('2026-01-08T23:59:00+09:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '非会员也可申请',
      seatTypes: [
        { name: 'Reserved Seat', price: '¥9,900' },
      ],
      ticketLimit: 4,
      resultAnnouncementTime: new Date('2026-01-17T18:00:00+09:00'),
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.budokan1.id, lotteryId: jpGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.budokan2.id, lotteryId: jpGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.yokohama1.id, lotteryId: jpGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.yokohama2.id, lotteryId: jpGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka1.id, lotteryId: jpGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka2.id, lotteryId: jpGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.karena1.id, lotteryId: jpGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.karena2.id, lotteryId: jpGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.kobe1.id, lotteryId: jpGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.kobe2.id, lotteryId: jpGeneral.id } }),
  ]);

  // 批次4: Seven-Eleven 先行
  const jpSeven = await prisma.lottery.create({
    data: {
      roundType: 'Seven-Eleven 先行',
      requirement: '无',
      startTime: new Date('2026-01-28T18:00:00+09:00'),
      endTime: new Date('2026-02-04T23:59:00+09:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '非会员也可申请',
      seatTypes: [
        { name: 'Reserved Seat', price: '¥9,900' },
      ],
      ticketLimit: 4,
      resultAnnouncementTime: new Date('2026-02-07T18:00:00+09:00'),
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.budokan1.id, lotteryId: jpSeven.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.budokan2.id, lotteryId: jpSeven.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.yokohama1.id, lotteryId: jpSeven.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.yokohama2.id, lotteryId: jpSeven.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka1.id, lotteryId: jpSeven.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka2.id, lotteryId: jpSeven.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.karena1.id, lotteryId: jpSeven.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.karena2.id, lotteryId: jpSeven.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.kobe1.id, lotteryId: jpSeven.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.kobe2.id, lotteryId: jpSeven.id } }),
  ]);

  console.log('✅ Japan main venues: 4 lottery rounds created');

  // ============================================
  // 福冈公演 - 2个批次
  // ============================================

  // 福冈批次1: PREMIUM 先行
  const fukuokaPremium = await prisma.lottery.create({
    data: {
      roundType: 'PREMIUM会员先行（福冈）',
      requirement: 'ZUTOMAYO PREMIUM 会员',
      startTime: new Date('2026-01-10T18:00:00+09:00'),
      endTime: new Date('2026-01-18T23:59:00+09:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '同行者非会员也可申请。福冈追加公演',
      seatTypes: [
        { name: 'Premium Seat', price: '¥11,000' },
        { name: 'Reserved Seat', price: '¥9,900' },
      ],
      ticketLimit: 2,
      resultAnnouncementTime: new Date('2026-01-27T18:00:00+09:00'),
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka1.id, lotteryId: fukuokaPremium.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka2.id, lotteryId: fukuokaPremium.id } }),
  ]);

  // 福冈批次2: 一般最速先行
  const fukuokaGeneral = await prisma.lottery.create({
    data: {
      roundType: '一般最速先行（福冈）',
      requirement: '无',
      startTime: new Date('2026-01-28T18:00:00+09:00'),
      endTime: new Date('2026-02-04T23:59:00+09:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '非会员也可申请',
      seatTypes: [
        { name: 'Reserved Seat', price: '¥9,900' },
      ],
      ticketLimit: 4,
      resultAnnouncementTime: new Date('2026-02-07T18:00:00+09:00'),
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka1.id, lotteryId: fukuokaGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka2.id, lotteryId: fukuokaGeneral.id } }),
  ]);

  console.log('✅ Fukuoka: 2 lottery rounds created');

  // ============================================
  // 海外公演
  // ============================================

  // 首尔一般销售
  const seoulGeneral = await prisma.lottery.create({
    data: {
      roundType: '一般销售',
      requirement: '无',
      startTime: new Date('2026-01-12T20:00:00+09:00'),
      endTime: new Date('2026-03-14T18:00:00+09:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '具体票价和票数限制请查看官网',
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.seoul1.id, lotteryId: seoulGeneral.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.seoul2.id, lotteryId: seoulGeneral.id } }),
  ]);

  // 新加坡一般销售
  const singaporeGeneral = await prisma.lottery.create({
    data: {
      roundType: '一般销售',
      requirement: '无',
      startTime: new Date('2025-12-23T12:00:00+08:00'),
      endTime: new Date('2026-04-17T20:00:00+08:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '具体票价和票数限制请查看官网',
    },
  });

  await prisma.liveLottery.create({ data: { liveId: lives.singapore.id, lotteryId: singaporeGeneral.id } });

  // 曼谷一般销售
  const bangkokGeneral = await prisma.lottery.create({
    data: {
      roundType: '一般销售',
      requirement: '无',
      startTime: new Date('2025-12-24T12:00:00+07:00'),
      endTime: new Date('2026-05-02T20:00:00+07:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '具体票价和票数限制请查看官网',
    },
  });

  await prisma.liveLottery.create({ data: { liveId: lives.bangkok.id, lotteryId: bangkokGeneral.id } });

  // 台北 PREMIUM 先行
  const taipeiPremium = await prisma.lottery.create({
    data: {
      roundType: 'PREMIUM会员先行',
      requirement: 'ZUTOMAYO PREMIUM 会员',
      startTime: new Date('2026-02-02T18:00:00+08:00'),
      endTime: new Date('2026-02-03T23:59:00+08:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '台北 5/17 追加公演。具体票价和票数限制请查看官网',
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.taipei1.id, lotteryId: taipeiPremium.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.taipei2.id, lotteryId: taipeiPremium.id } }),
  ]);

  // 香港一般销售
  const hongkongGeneral = await prisma.lottery.create({
    data: {
      roundType: '一般销售',
      requirement: '无',
      startTime: new Date('2026-01-12T12:00:00+08:00'),
      endTime: new Date('2026-06-06T20:00:00+08:00'),
      sourceUrl: 'https://zutomayo.net/intense2/',
      notes: '具体票价和票数限制请查看官网',
    },
  });

  await prisma.liveLottery.create({ data: { liveId: lives.hongkong.id, lotteryId: hongkongGeneral.id } });

  console.log('✅ Overseas concerts: lottery info created');
  console.log('');
  console.log('🎉 Complete ZUTOMAYO INTENSE II seed completed!');
  console.log('📊 Summary:');
  console.log('   - 19 live concerts');
  console.log('   - 13 lottery rounds');
  console.log('   - Japan main venues: 4 rounds each');
  console.log('   - Fukuoka: 2 rounds');
  console.log('   - Overseas: general sales or premium');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
