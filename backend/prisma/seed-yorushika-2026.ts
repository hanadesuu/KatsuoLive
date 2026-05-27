import { PrismaClient, LiveStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎵 Adding YORUSHIKA 2026 Tour data...');

  // Create permissions
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

  // Create roles
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

  // Create default admin user
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

  // Create YORUSHIKA artist
  const yorushika = await prisma.artist.upsert({
    where: { id: 'yorushika' },
    update: {
      searchKeywords: ['ヨルシカ', 'yorushika', '夜鹿', 'n-buna', 'suis', '一人称', 'hitoshinsho'],
      descriptionJp: 'n-buna（作詞・作曲・ギター）とsuis（ボーカル）からなる日本のロックデュオ。',
      descriptionEn: 'Japanese rock duo consisting of n-buna (composer/guitarist) and suis (vocalist).',
      descriptionCn: '由n-buna（作词・作曲・吉他）和suis（主唱）组成的日本摇滚双人组合。',
    },
    create: {
      id: 'yorushika',
      nameJp: 'ヨルシカ',
      nameEn: 'Yorushika',
      nameCn: '夜鹿',
      searchKeywords: ['ヨルシカ', 'yorushika', '夜鹿', 'n-buna', 'suis', '一人称', 'hitoshinsho'],
      descriptionJp: 'n-buna（作詞・作曲・ギター）とsuis（ボーカル）からなる日本のロックデュオ。',
      descriptionEn: 'Japanese rock duo consisting of n-buna (composer/guitarist) and suis (vocalist).',
      descriptionCn: '由n-buna（作词・作曲・吉他）和suis（主唱）组成的日本摇滚双人组合。',
      officialLinks: {
        website: 'https://yorushika.com/',
        twitter: 'https://twitter.com/nbuna_staff',
        youtube: 'https://www.youtube.com/@YORUSHIKA_info',
      },
    },
  });

  console.log('✅ YORUSHIKA artist created');

  // Create tour
  const yorushikaTour2026 = await prisma.tour.upsert({
    where: { id: 'yorushika-2026-tour' },
    update: {
      artistId: yorushika.id,
      name: 'LIVE TOUR 2026「一人称」',
      description: 'YORUSHIKA live tour "Hitoshinsho," featuring their letter-style novel and digital album "Hitoshinsho," has been scheduled to take place in five cities across the country.',
      startDate: new Date('2026-03-21T00:00:00+09:00'),
      endDate: new Date('2026-09-16T23:59:00+09:00'),
      officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
    },
    create: {
      id: 'yorushika-2026-tour',
      artistId: yorushika.id,
      name: 'LIVE TOUR 2026「一人称」',
      description: 'YORUSHIKA live tour "Hitoshinsho," featuring their letter-style novel and digital album "Hitoshinsho," has been scheduled to take place in five cities across the country.',
      startDate: new Date('2026-03-21T00:00:00+09:00'),
      endDate: new Date('2026-09-16T23:59:00+09:00'),
      officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
    },
  });

  console.log('✅ Tour created');

  // Create live performances
  const lives = {
    miyagi1: await prisma.live.upsert({
      where: { id: 'yorushika-2026-miyagi-0321' },
      update: {
        title: 'LIVE TOUR 2026「一人称」宮城公演 ①',
        dateStart: new Date('2026-03-21T18:00:00+09:00'),
        dateEnd: new Date('2026-03-21T21:00:00+09:00'),
        venue: 'Xebio Arena Sendai (ゼビオアリーナ仙台)',
        city: '宮城',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-miyagi-0321',
        title: 'LIVE TOUR 2026「一人称」宮城公演 ①',
        dateStart: new Date('2026-03-21T18:00:00+09:00'),
        dateEnd: new Date('2026-03-21T21:00:00+09:00'),
        venue: 'Xebio Arena Sendai (ゼビオアリーナ仙台)',
        city: '宮城',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
    miyagi2: await prisma.live.upsert({
      where: { id: 'yorushika-2026-miyagi-0322' },
      update: {
        title: 'LIVE TOUR 2026「一人称」宮城公演 ②',
        dateStart: new Date('2026-03-22T16:00:00+09:00'),
        dateEnd: new Date('2026-03-22T19:00:00+09:00'),
        venue: 'Xebio Arena Sendai (ゼビオアリーナ仙台)',
        city: '宮城',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-miyagi-0322',
        title: 'LIVE TOUR 2026「一人称」宮城公演 ②',
        dateStart: new Date('2026-03-22T16:00:00+09:00'),
        dateEnd: new Date('2026-03-22T19:00:00+09:00'),
        venue: 'Xebio Arena Sendai (ゼビオアリーナ仙台)',
        city: '宮城',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
    osaka1: await prisma.live.upsert({
      where: { id: 'yorushika-2026-osaka-0418' },
      update: {
        title: 'LIVE TOUR 2026「一人称」大阪公演 ①',
        dateStart: new Date('2026-04-18T18:00:00+09:00'),
        dateEnd: new Date('2026-04-18T21:00:00+09:00'),
        venue: 'Osaka Castle Hall (大阪城ホール)',
        city: '大阪',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-osaka-0418',
        title: 'LIVE TOUR 2026「一人称」大阪公演 ①',
        dateStart: new Date('2026-04-18T18:00:00+09:00'),
        dateEnd: new Date('2026-04-18T21:00:00+09:00'),
        venue: 'Osaka Castle Hall (大阪城ホール)',
        city: '大阪',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
    osaka2: await prisma.live.upsert({
      where: { id: 'yorushika-2026-osaka-0419' },
      update: {
        title: 'LIVE TOUR 2026「一人称」大阪公演 ②',
        dateStart: new Date('2026-04-19T16:00:00+09:00'),
        dateEnd: new Date('2026-04-19T19:00:00+09:00'),
        venue: 'Osaka Castle Hall (大阪城ホール)',
        city: '大阪',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-osaka-0419',
        title: 'LIVE TOUR 2026「一人称」大阪公演 ②',
        dateStart: new Date('2026-04-19T16:00:00+09:00'),
        dateEnd: new Date('2026-04-19T19:00:00+09:00'),
        venue: 'Osaka Castle Hall (大阪城ホール)',
        city: '大阪',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
    aichi1: await prisma.live.upsert({
      where: { id: 'yorushika-2026-aichi-0530' },
      update: {
        title: 'LIVE TOUR 2026「一人称」愛知公演 ①',
        dateStart: new Date('2026-05-30T18:00:00+09:00'),
        dateEnd: new Date('2026-05-30T21:00:00+09:00'),
        venue: 'Nippon Gaishi Hall (日本ガイシホール)',
        city: '愛知',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-aichi-0530',
        title: 'LIVE TOUR 2026「一人称」愛知公演 ①',
        dateStart: new Date('2026-05-30T18:00:00+09:00'),
        dateEnd: new Date('2026-05-30T21:00:00+09:00'),
        venue: 'Nippon Gaishi Hall (日本ガイシホール)',
        city: '愛知',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
    aichi2: await prisma.live.upsert({
      where: { id: 'yorushika-2026-aichi-0531' },
      update: {
        title: 'LIVE TOUR 2026「一人称」愛知公演 ②',
        dateStart: new Date('2026-05-31T16:00:00+09:00'),
        dateEnd: new Date('2026-05-31T19:00:00+09:00'),
        venue: 'Nippon Gaishi Hall (日本ガイシホール)',
        city: '愛知',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-aichi-0531',
        title: 'LIVE TOUR 2026「一人称」愛知公演 ②',
        dateStart: new Date('2026-05-31T16:00:00+09:00'),
        dateEnd: new Date('2026-05-31T19:00:00+09:00'),
        venue: 'Nippon Gaishi Hall (日本ガイシホール)',
        city: '愛知',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
    fukuoka1: await prisma.live.upsert({
      where: { id: 'yorushika-2026-fukuoka-0804' },
      update: {
        title: 'LIVE TOUR 2026「一人称」福岡公演 ①',
        dateStart: new Date('2026-08-04T19:00:00+09:00'),
        dateEnd: new Date('2026-08-04T22:00:00+09:00'),
        venue: 'Marine Messe Fukuoka Hall A (マリンメッセ福岡A館)',
        city: '福岡',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-fukuoka-0804',
        title: 'LIVE TOUR 2026「一人称」福岡公演 ①',
        dateStart: new Date('2026-08-04T19:00:00+09:00'),
        dateEnd: new Date('2026-08-04T22:00:00+09:00'),
        venue: 'Marine Messe Fukuoka Hall A (マリンメッセ福岡A館)',
        city: '福岡',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
    fukuoka2: await prisma.live.upsert({
      where: { id: 'yorushika-2026-fukuoka-0805' },
      update: {
        title: 'LIVE TOUR 2026「一人称」福岡公演 ②',
        dateStart: new Date('2026-08-05T19:00:00+09:00'),
        dateEnd: new Date('2026-08-05T22:00:00+09:00'),
        venue: 'Marine Messe Fukuoka Hall A (マリンメッセ福岡A館)',
        city: '福岡',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-fukuoka-0805',
        title: 'LIVE TOUR 2026「一人称」福岡公演 ②',
        dateStart: new Date('2026-08-05T19:00:00+09:00'),
        dateEnd: new Date('2026-08-05T22:00:00+09:00'),
        venue: 'Marine Messe Fukuoka Hall A (マリンメッセ福岡A館)',
        city: '福岡',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
    chiba1: await prisma.live.upsert({
      where: { id: 'yorushika-2026-chiba-0915' },
      update: {
        title: 'LIVE TOUR 2026「一人称」千葉公演 ①',
        dateStart: new Date('2026-09-15T19:00:00+09:00'),
        dateEnd: new Date('2026-09-15T22:00:00+09:00'),
        venue: 'LaLa arena TOKYO-BAY',
        city: '千葉',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-chiba-0915',
        title: 'LIVE TOUR 2026「一人称」千葉公演 ①',
        dateStart: new Date('2026-09-15T19:00:00+09:00'),
        dateEnd: new Date('2026-09-15T22:00:00+09:00'),
        venue: 'LaLa arena TOKYO-BAY',
        city: '千葉',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
    chiba2: await prisma.live.upsert({
      where: { id: 'yorushika-2026-chiba-0916' },
      update: {
        title: 'LIVE TOUR 2026「一人称」千葉公演 ②',
        dateStart: new Date('2026-09-16T19:00:00+09:00'),
        dateEnd: new Date('2026-09-16T22:00:00+09:00'),
        venue: 'LaLa arena TOKYO-BAY',
        city: '千葉',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
      create: {
        id: 'yorushika-2026-chiba-0916',
        title: 'LIVE TOUR 2026「一人称」千葉公演 ②',
        dateStart: new Date('2026-09-16T19:00:00+09:00'),
        dateEnd: new Date('2026-09-16T22:00:00+09:00'),
        venue: 'LaLa arena TOKYO-BAY',
        city: '千葉',
        status: LiveStatus.UPCOMING,
        artistId: yorushika.id,
        tourId: yorushikaTour2026.id,
        officialPageUrl: 'https://yorushika.com/news/detail/11732?lang=en',
      },
    }),
  };

  console.log('✅ All 10 live performances created');

  // ============================================
  // Lottery rounds
  // ============================================

  // Round 1: FC member advance (companion must also be member)
  // 宫城公演（无B席）
  const fcMemberBothMiyagi = await prisma.lottery.create({
    data: {
      roundType: '「後書き」会員先行（同行者会員）',
      requirement: '応募者・同行者ともにヨルシカ smartphone site「後書き」会員',
      startTime: new Date('2026-01-13T18:00:00+09:00'),
      endTime: new Date('2026-01-19T23:59:00+09:00'),
      sourceUrl: 'https://yorushika.com/feature/livetour2026_ichininsho',
      notes: 'お1人様1申込み1公演最大2枚まで。応募者・同行者のスマートフォン端末で、それぞれチケットを発券します。',
      seatTypes: [
        { name: 'S席', price: '¥12,000' },
        { name: 'A席', price: '¥10,500' },
        { name: 'A轮椅席', price: '¥10,500' },
        { name: '注釈付き指定席', price: '¥8,500' },
      ],
      ticketLimit: 2,
    },
  });

  // 其他城市公演（有B席）
  const fcMemberBothOther = await prisma.lottery.create({
    data: {
      roundType: '「後書き」会員先行（同行者会員）',
      requirement: '応募者・同行者ともにヨルシカ smartphone site「後書き」会員',
      startTime: new Date('2026-01-13T18:00:00+09:00'),
      endTime: new Date('2026-01-19T23:59:00+09:00'),
      sourceUrl: 'https://yorushika.com/feature/livetour2026_ichininsho',
      notes: 'お1人様1申込み1公演最大2枚まで。応募者・同行者のスマートフォン端末で、それぞれチケットを発券します。',
      seatTypes: [
        { name: 'S席', price: '¥12,000' },
        { name: 'A席', price: '¥10,500' },
        { name: 'A轮椅席', price: '¥10,500' },
        { name: 'B席', price: '¥9,000' },
        { name: 'B轮椅席', price: '¥9,000' },
        { name: '注釈付き指定席', price: '¥8,500' },
      ],
      ticketLimit: 2,
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.miyagi1.id, lotteryId: fcMemberBothMiyagi.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.miyagi2.id, lotteryId: fcMemberBothMiyagi.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka1.id, lotteryId: fcMemberBothOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka2.id, lotteryId: fcMemberBothOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.aichi1.id, lotteryId: fcMemberBothOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.aichi2.id, lotteryId: fcMemberBothOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka1.id, lotteryId: fcMemberBothOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka2.id, lotteryId: fcMemberBothOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.chiba1.id, lotteryId: fcMemberBothOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.chiba2.id, lotteryId: fcMemberBothOther.id } }),
  ]);

  console.log('✅ FC member advance (companion must be member) created');

  // Round 2: FC member advance (companion can be non-member)
  // 宫城公演（无B席）
  const fcMemberSingleMiyagi = await prisma.lottery.create({
    data: {
      roundType: '「後書き」会員先行（同行者非会員）',
      requirement: '応募者がヨルシカ smartphone site「後書き」会員',
      startTime: new Date('2026-01-23T18:00:00+09:00'),
      endTime: new Date('2026-01-27T23:59:00+09:00'),
      sourceUrl: 'https://yorushika.com/feature/livetour2026_ichininsho',
      notes: 'お1人様1申込み1公演最大2枚まで。応募者のスマートフォン端末にまとめて表示されます。',
      seatTypes: [
        { name: 'S席', price: '¥12,000' },
        { name: 'A席', price: '¥10,500' },
        { name: 'A轮椅席', price: '¥10,500' },
        { name: '注釈付き指定席', price: '¥8,500' },
      ],
      ticketLimit: 2,
    },
  });

  // 其他城市公演（有B席）
  const fcMemberSingleOther = await prisma.lottery.create({
    data: {
      roundType: '「後書き」会員先行（同行者非会員）',
      requirement: '応募者がヨルシカ smartphone site「後書き」会員',
      startTime: new Date('2026-01-23T18:00:00+09:00'),
      endTime: new Date('2026-01-27T23:59:00+09:00'),
      sourceUrl: 'https://yorushika.com/feature/livetour2026_ichininsho',
      notes: 'お1人様1申込み1公演最大2枚まで。応募者のスマートフォン端末にまとめて表示されます。',
      seatTypes: [
        { name: 'S席', price: '¥12,000' },
        { name: 'A席', price: '¥10,500' },
        { name: 'A轮椅席', price: '¥10,500' },
        { name: 'B席', price: '¥9,000' },
        { name: 'B轮椅席', price: '¥9,000' },
        { name: '注釈付き指定席', price: '¥8,500' },
      ],
      ticketLimit: 2,
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.miyagi1.id, lotteryId: fcMemberSingleMiyagi.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.miyagi2.id, lotteryId: fcMemberSingleMiyagi.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka1.id, lotteryId: fcMemberSingleOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka2.id, lotteryId: fcMemberSingleOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.aichi1.id, lotteryId: fcMemberSingleOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.aichi2.id, lotteryId: fcMemberSingleOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka1.id, lotteryId: fcMemberSingleOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka2.id, lotteryId: fcMemberSingleOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.chiba1.id, lotteryId: fcMemberSingleOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.chiba2.id, lotteryId: fcMemberSingleOther.id } }),
  ]);

  console.log('✅ FC member advance (companion can be non-member) created');

  // Round 3: Official advance
  // 宫城公演（无B席）
  const officialAdvanceMiyagi = await prisma.lottery.create({
    data: {
      roundType: 'オフィシャル先行',
      requirement: '無',
      startTime: new Date('2026-01-30T18:00:00+09:00'),
      endTime: new Date('2026-02-08T23:59:00+09:00'),
      sourceUrl: 'https://l-tike.com/',
      notes: 'お1人様1申込み1公演最大2枚まで。ヨルシカ公式アプリ（チケプラ電子チケット）で発券',
      seatTypes: [
        { name: 'S席', price: '¥12,000' },
        { name: 'A席', price: '¥10,500' },
        { name: 'A轮椅席', price: '¥10,500' },
        { name: '注釈付き指定席', price: '¥8,500' },
      ],
      ticketLimit: 2,
    },
  });

  // 其他城市公演（有B席）
  const officialAdvanceOther = await prisma.lottery.create({
    data: {
      roundType: 'オフィシャル先行',
      requirement: '無',
      startTime: new Date('2026-01-30T18:00:00+09:00'),
      endTime: new Date('2026-02-08T23:59:00+09:00'),
      sourceUrl: 'https://l-tike.com/',
      notes: 'お1人様1申込み1公演最大2枚まで。ヨルシカ公式アプリ（チケプラ電子チケット）で発券',
      seatTypes: [
        { name: 'S席', price: '¥12,000' },
        { name: 'A席', price: '¥10,500' },
        { name: 'A轮椅席', price: '¥10,500' },
        { name: 'B席', price: '¥9,000' },
        { name: 'B轮椅席', price: '¥9,000' },
        { name: '注釈付き指定席', price: '¥8,500' },
      ],
      ticketLimit: 2,
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.miyagi1.id, lotteryId: officialAdvanceMiyagi.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.miyagi2.id, lotteryId: officialAdvanceMiyagi.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka1.id, lotteryId: officialAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka2.id, lotteryId: officialAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.aichi1.id, lotteryId: officialAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.aichi2.id, lotteryId: officialAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka1.id, lotteryId: officialAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka2.id, lotteryId: officialAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.chiba1.id, lotteryId: officialAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.chiba2.id, lotteryId: officialAdvanceOther.id } }),
  ]);

  console.log('✅ Official advance created');

  // Round 4: Inbound advance
  // 宫城公演（无B席）
  const inboundAdvanceMiyagi = await prisma.lottery.create({
    data: {
      roundType: 'インバウンド先行',
      requirement: '海外在住で、090/080/070で始まる日本の携帯電話番号をお持ちでないお客様',
      startTime: new Date('2026-01-30T18:00:00+09:00'),
      endTime: new Date('2026-02-08T23:59:00+09:00'),
      sourceUrl: 'https://l-tike.com/',
      notes: 'お1人様1申込み1公演最大2枚まで。紙チケット（当日引換）',
      seatTypes: [
        { name: 'S席', price: '¥12,000' },
        { name: 'A席', price: '¥10,500' },
        { name: 'A轮椅席', price: '¥10,500' },
        { name: '注釈付き指定席', price: '¥8,500' },
      ],
      ticketLimit: 2,
    },
  });

  // 其他城市公演（有B席）
  const inboundAdvanceOther = await prisma.lottery.create({
    data: {
      roundType: 'インバウンド先行',
      requirement: '海外在住で、090/080/070で始まる日本の携帯電話番号をお持ちでないお客様',
      startTime: new Date('2026-01-30T18:00:00+09:00'),
      endTime: new Date('2026-02-08T23:59:00+09:00'),
      sourceUrl: 'https://l-tike.com/',
      notes: 'お1人様1申込み1公演最大2枚まで。紙チケット（当日引換）',
      seatTypes: [
        { name: 'S席', price: '¥12,000' },
        { name: 'A席', price: '¥10,500' },
        { name: 'A轮椅席', price: '¥10,500' },
        { name: 'B席', price: '¥9,000' },
        { name: 'B轮椅席', price: '¥9,000' },
        { name: '注釈付き指定席', price: '¥8,500' },
      ],
      ticketLimit: 2,
    },
  });

  await Promise.all([
    prisma.liveLottery.create({ data: { liveId: lives.miyagi1.id, lotteryId: inboundAdvanceMiyagi.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.miyagi2.id, lotteryId: inboundAdvanceMiyagi.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka1.id, lotteryId: inboundAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.osaka2.id, lotteryId: inboundAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.aichi1.id, lotteryId: inboundAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.aichi2.id, lotteryId: inboundAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka1.id, lotteryId: inboundAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.fukuoka2.id, lotteryId: inboundAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.chiba1.id, lotteryId: inboundAdvanceOther.id } }),
    prisma.liveLottery.create({ data: { liveId: lives.chiba2.id, lotteryId: inboundAdvanceOther.id } }),
  ]);

  console.log('✅ Inbound advance created');

  console.log('');
  console.log('🎉 Complete YORUSHIKA 2026 Tour seed completed!');
  console.log('📊 Summary:');
  console.log('   - Tour: LIVE TOUR 2026「一人称」');
  console.log('   - 10 live concerts (5 cities, 2 performances each)');
  console.log('   - 8 lottery rounds (4 rounds × 2 city groups: Miyagi and Others)');
  console.log('   - All Japan venues covered');
  console.log('   - Official page: https://yorushika.com/news/detail/11732?lang=en');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
