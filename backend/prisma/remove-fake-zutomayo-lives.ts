import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Removing incorrectly added ZUTOMAYO lives...');

  // Delete the fake lives
  const liveIdsToDelete = [
    'zutomayo-osaka-2025-04-15',
    'zutomayo-nagoya-2025-05-10',
    'zutomayo-fukuoka-2025-06-05',
    'zutomayo-sapporo-2025-07-20',
    'zutomayo-yokohama-2025-08-25',
    'zutomayo-tokyo-2026-03-15',
    'zutomayo-tokyo-2026-03-16',
  ];

  for (const liveId of liveIdsToDelete) {
    try {
      await prisma.live.delete({
        where: { id: liveId },
      });
      console.log(`✅ Deleted: ${liveId}`);
    } catch (error) {
      console.log(`⚠️  Live ${liveId} not found or already deleted`);
    }
  }

  // Delete the fake tour
  try {
    await prisma.tour.delete({
      where: { id: 'zutomayo-tour-2025' },
    });
    console.log('✅ Deleted fake tour');
  } catch (error) {
    console.log('⚠️  Tour not found or already deleted');
  }

  console.log('🎉 Cleanup completed!');
}

main()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
