-- AlterTable
ALTER TABLE "lotteries" ADD COLUMN     "resultAnnouncementTime" TIMESTAMP(3),
ADD COLUMN     "seatTypes" JSONB,
ADD COLUMN     "ticketLimit" INTEGER;
