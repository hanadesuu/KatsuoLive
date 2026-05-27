import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating ZUTOMAYO search keywords...');

  try {
    // Update ZUTOMAYO artist with new search keywords
    const result = await prisma.artist.updateMany({
      where: {
        OR: [
          { nameJp: { contains: 'ずっと真夜中でいいのに' } },
          { id: 'zutomayo' },
        ],
      },
      data: {
        searchKeywords: ['ztmy', '真夜中', 'ずとまよ'],
      },
    });

    if (result.count > 0) {
      console.log(`✅ Updated ${result.count} artist(s)`);
      
      // Verify the update
      const artist = await prisma.artist.findFirst({
        where: {
          OR: [
            { nameJp: { contains: 'ずっと真夜中でいいのに' } },
            { id: 'zutomayo' },
          ],
        },
      });

      if (artist) {
        console.log('📋 Current keywords:', artist.searchKeywords);
        console.log('✨ Artist:', artist.nameJp);
      }
    } else {
      console.log('⚠️  No ZUTOMAYO artist found. Creating one...');
      
      const artist = await prisma.artist.create({
        data: {
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
      
      console.log('✅ Created ZUTOMAYO artist');
      console.log('📋 Keywords:', artist.searchKeywords);
    }

    console.log('');
    console.log('🎉 Update completed!');
    console.log('💡 Now you can search using: ztmy, 真夜中, or ずとまよ');
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
