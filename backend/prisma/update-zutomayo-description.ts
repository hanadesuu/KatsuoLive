import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Updating ZUTOMAYO description with more details...');

  // Update Zutomayo with more detailed descriptions
  await prisma.artist.update({
    where: { id: 'zutomayo' },
    data: {
      descriptionJp: 'ACAねが作詞作曲を手掛け、ボーカルにずっと真夜中でいいのに。を擁する音楽ユニット。2018年6月に「秒針を噛む」でYouTubeデビューし、瞬く間に話題となる。独特な世界観と中毒性の高いメロディー、印象的なMVで若年層を中心に絶大な人気を誇る。ロックとポップスを融合させた楽曲は、深夜のような不思議な雰囲気を持ち、多くのファンを魅了し続けている。代表曲に「秒針を噛む」「暗く黒く」「MILABO」「勘ぐれい」などがある。',
      descriptionEn: 'A music unit featuring vocalist ZUTOMAYO with composition and lyrics by ACAne. Made their YouTube debut in June 2018 with "Byoushin wo Kamu" (Bite the Second Hand), which quickly became a sensation. Known for their unique worldview, highly addictive melodies, and impressive music videos, they enjoy immense popularity especially among younger audiences. Their music fuses rock and pop with a mysterious midnight-like atmosphere that continues to captivate many fans. Representative songs include "Byoushin wo Kamu", "Darken", "MILABO", and "Kangurei".',
      descriptionCn: '由ACAne作词作曲、ずっと真夜中でいいのに担任主唱的音乐组合。2018年6月以《秒针咬合》在YouTube出道，瞬间成为话题。以独特的世界观、极具感染力的旋律和令人印象深刻的MV，在年轻群体中享有极高人气。融合摇滚与流行的乐曲带有如同深夜般的神秘氛围，持续吸引着众多粉丝。代表作品包括《秒针咬合》《暗黑》《MILABO》《勘深疑》等。',
    },
  });
  console.log('✅ Updated ZUTOMAYO descriptions with more details');
  console.log('🎉 Update completed!');
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
