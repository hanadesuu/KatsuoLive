import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Updating artist cover images...');

  // Update Zutomayo cover image
  const zutomayo = await prisma.artist.update({
    where: { id: 'zutomayo' },
    data: {
      coverImage: '/images/artists/zutomayo.jpg',
    },
  });

  console.log('✅ Updated ZUTOMAYO cover image:', zutomayo.coverImage);

  // Update Yorushika cover image
  const yorushika = await prisma.artist.update({
    where: { id: 'yorushika' },
    data: {
      coverImage: '/images/artists/yorushika.jpg',
    },
  });

  console.log('✅ Updated Yorushika cover image:', yorushika.coverImage);

  // Update sample AIMYON artist cover image
  const aimyon = await prisma.artist.update({
    where: { id: 'sample-artist' },
    data: {
      coverImage: '/images/artists/aimyon.jpg',
    },
  });

  console.log('✅ Updated AIMYON cover image:', aimyon.coverImage);

  console.log('🎉 Artist cover images updated successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
