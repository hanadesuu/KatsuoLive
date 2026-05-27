import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查演出和艺术家的关联...');

  // 获取所有演出
  const lives = await prisma.live.findMany({
    include: {
      artist: true,
    },
  });

  console.log(`找到 ${lives.length} 场演出\n`);

  let problemCount = 0;

  for (const live of lives) {
    if (!live.artist) {
      console.log(`❌ 问题演出: ${live.title}`);
      console.log(`   ID: ${live.id}`);
      console.log(`   artistId: ${live.artistId}`);
      console.log(`   artist: null\n`);
      problemCount++;
    } else if (!live.artist.nameJp && !live.artist.nameCn && !live.artist.nameEn) {
      console.log(`⚠️ 艺术家名称缺失: ${live.title}`);
      console.log(`   艺术家ID: ${live.artist.id}`);
      console.log(`   nameJp: ${live.artist.nameJp || 'null'}`);
      console.log(`   nameCn: ${live.artist.nameCn || 'null'}`);
      console.log(`   nameEn: ${live.artist.nameEn || 'null'}\n`);
      problemCount++;
    }
  }

  if (problemCount === 0) {
    console.log('✅ 所有演出的艺术家关联都正常！');
  } else {
    console.log(`\n⚠️ 发现 ${problemCount} 个问题`);
  }

  // 检查特定演出
  const hyLive = await prisma.live.findFirst({
    where: {
      title: { contains: 'HY 25th Anniversary' },
    },
    include: {
      artist: true,
    },
  });

  if (hyLive) {
    console.log(`\n📋 HY 25th Anniversary 演出详情:`);
    console.log(`   标题: ${hyLive.title}`);
    console.log(`   artistId: ${hyLive.artistId}`);
    console.log(`   艺术家: ${hyLive.artist ? JSON.stringify({
      id: hyLive.artist.id,
      nameJp: hyLive.artist.nameJp,
      nameCn: hyLive.artist.nameCn,
      nameEn: hyLive.artist.nameEn,
    }) : 'null'}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ 检查失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
