/*
  Warnings:

  - You are about to drop the column `liveId` on the `lotteries` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "lotteries" DROP CONSTRAINT "lotteries_liveId_fkey";

-- DropIndex
DROP INDEX "lotteries_liveId_idx";

-- AlterTable
ALTER TABLE "lotteries" DROP COLUMN "liveId";

-- CreateTable
CREATE TABLE "live_lotteries" (
    "id" TEXT NOT NULL,
    "liveId" TEXT NOT NULL,
    "lotteryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_lotteries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "live_lotteries_liveId_idx" ON "live_lotteries"("liveId");

-- CreateIndex
CREATE INDEX "live_lotteries_lotteryId_idx" ON "live_lotteries"("lotteryId");

-- CreateIndex
CREATE UNIQUE INDEX "live_lotteries_liveId_lotteryId_key" ON "live_lotteries"("liveId", "lotteryId");

-- AddForeignKey
ALTER TABLE "live_lotteries" ADD CONSTRAINT "live_lotteries_liveId_fkey" FOREIGN KEY ("liveId") REFERENCES "lives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_lotteries" ADD CONSTRAINT "live_lotteries_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "lotteries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
