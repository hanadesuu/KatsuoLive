-- AlterTable
ALTER TABLE "artists" ADD COLUMN     "searchKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
