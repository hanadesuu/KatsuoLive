import { PrismaClient, LiveStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎵 Updating artist descriptions and adding ZUTOMAYO lives...');

  // Update Zutomayo descriptions
  await prisma.artist.update({
    where: { id: 'zutomayo' },
    data: {
      descriptionJp: 'ACAねが作詞作曲を手掛け、ボーカルにずっと真夜中でいいのに。を擁する音楽ユニット。2018年活動開始。独特な世界観とキャッチーなメロディーで若年層を中心に人気を集める。',
      descriptionEn: 'A music unit featuring vocalist ZUTOMAYO with composition and lyrics by ACAne. Started activities in 2018. Popular among younger audiences with their unique worldview and catchy melodies.',
      descriptionCn: '由ACAne作词作曲、ずっと真夜中でいいのに担任主唱的音乐组合。2018年开始活动。以独特的世界观和动听的旋律在年轻群体中广受欢迎。',
    },
  });
  console.log('✅ Updated ZUTOMAYO descriptions');

  // Update Yorushika descriptions  
  await prisma.artist.update({
    where: { id: 'yorushika' },
    data: {
      descriptionJp: 'n-bunaとsuisによる音楽ユニット。2017年活動開始。詩的な歌詞と美しいメロディーで知られ、YouTubeでの再生回数は数億回を超える人気バンド。',
      descriptionEn: 'A music unit consisting of n-buna and suis. Started activities in 2017. Known for poetic lyrics and beautiful melodies, with hundreds of millions of views on YouTube.',
      descriptionCn: '由n-buna和suis组成的音乐组合。2017年开始活动。以诗意的歌词和优美的旋律闻名，YouTube播放量超过数亿次的人气乐队。',
    },
  });
  console.log('✅ Updated Yorushika descriptions');

  // Add more ZUTOMAYO lives for 2025
  const zutomayo = await prisma.artist.findUnique({ where: { id: 'zutomayo' } });
  if (!zutomayo) {
    console.error('❌ ZUTOMAYO not found');
    return;
  }

  // Create additional tour
  const tour2025 = await prisma.tour.upsert({
    where: { id: 'zutomayo-tour-2025' },
    update: {},
    create: {
      id: 'zutomayo-tour-2025',
      artistId: zutomayo.id,
      name: 'ZUTOMAYO LIVE 2025 "夜を駆ける"',
      description: 'ずっと真夜中でいいのに。2025年春夏ツアー',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-08-31'),
    },
  });
  console.log('✅ Created 2025 tour');

  // Add lives
  const newLives = [
    {
      id: 'zutomayo-osaka-2025-04-15',
      title: 'ZUTOMAYO LIVE 2025 "夜を駆ける" 大阪公演',
      dateStart: new Date('2025-04-15T18:00:00+09:00'),
      dateEnd: new Date('2025-04-15T20:30:00+09:00'),
      venue: '大阪城ホール',
      city: '大阪',
      status: 'FINISHED' as LiveStatus,
    },
    {
      id: 'zutomayo-nagoya-2025-05-10',
      title: 'ZUTOMAYO LIVE 2025 "夜を駆ける" 名古屋公演',
      dateStart: new Date('2025-05-10T18:00:00+09:00'),
      dateEnd: new Date('2025-05-10T20:30:00+09:00'),
      venue: '日本ガイシホール',
      city: '名古屋',
      status: 'FINISHED' as LiveStatus,
    },
    {
      id: 'zutomayo-fukuoka-2025-06-05',
      title: 'ZUTOMAYO LIVE 2025 "夜を駆ける" 福岡公演',
      dateStart: new Date('2025-06-05T18:00:00+09:00'),
      dateEnd: new Date('2025-06-05T20:30:00+09:00'),
      venue: 'マリンメッセ福岡',
      city: '福岡',
      status: 'FINISHED' as LiveStatus,
    },
    {
      id: 'zutomayo-sapporo-2025-07-20',
      title: 'ZUTOMAYO LIVE 2025 "夜を駆ける" 札幌公演',
      dateStart: new Date('2025-07-20T18:00:00+09:00'),
      dateEnd: new Date('2025-07-20T20:30:00+09:00'),
      venue: '真駒内セキスイハイムアイスアリーナ',
      city: '札幌',
      status: 'FINISHED' as LiveStatus,
    },
    {
      id: 'zutomayo-yokohama-2025-08-25',
      title: 'ZUTOMAYO LIVE 2025 "夜を駆ける" 横浜公演',
      dateStart: new Date('2025-08-25T18:00:00+09:00'),
      dateEnd: new Date('2025-08-25T20:30:00+09:00'),
      venue: '横浜アリーナ',
      city: '横浜',
      status: 'FINISHED' as LiveStatus,
    },
    {
      id: 'zutomayo-tokyo-2026-03-15',
      title: 'ZUTOMAYO LIVE 2026 "新世界" 東京 Day1',
      dateStart: new Date('2026-03-15T18:00:00+09:00'),
      dateEnd: new Date('2026-03-15T20:30:00+09:00'),
      venue: '東京ドーム',
      city: '東京',
      status: 'UPCOMING' as LiveStatus,
    },
    {
      id: 'zutomayo-tokyo-2026-03-16',
      title: 'ZUTOMAYO LIVE 2026 "新世界" 東京 Day2',
      dateStart: new Date('2026-03-16T18:00:00+09:00'),
      dateEnd: new Date('2026-03-16T20:30:00+09:00'),
      venue: '東京ドーム',
      city: '東京',
      status: 'UPCOMING' as LiveStatus,
    },
  ];

  for (const liveData of newLives) {
    await prisma.live.upsert({
      where: { id: liveData.id },
      update: {},
      create: {
        ...liveData,
        artistId: zutomayo.id,
        tourId: tour2025.id,
      },
    });
  }

  console.log(`✅ Added ${newLives.length} new ZUTOMAYO lives`);
  console.log('🎉 Update completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
