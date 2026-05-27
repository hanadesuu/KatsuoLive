-- AlterTable
ALTER TABLE "lives" ADD COLUMN     "tourId" TEXT;

-- CreateTable
CREATE TABLE "tours" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "officialPageUrl" TEXT,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tours_artistId_idx" ON "tours"("artistId");

-- CreateIndex
CREATE INDEX "lives_tourId_idx" ON "lives"("tourId");

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lives" ADD CONSTRAINT "lives_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;
