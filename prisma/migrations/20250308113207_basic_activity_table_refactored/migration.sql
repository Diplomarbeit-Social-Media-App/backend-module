/*
  Warnings:

  - The primary key for the `Activity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `_AttachedActivites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BelongsToCategory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[lId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coverImage` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `openingTimes` on the `Activity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_locationId_fkey";

-- DropForeignKey
ALTER TABLE "_AttachedActivites" DROP CONSTRAINT "_AttachedActivites_A_fkey";

-- DropForeignKey
ALTER TABLE "_AttachedActivites" DROP CONSTRAINT "_AttachedActivites_B_fkey";

-- DropForeignKey
ALTER TABLE "_BelongsToCategory" DROP CONSTRAINT "_BelongsToCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_BelongsToCategory" DROP CONSTRAINT "_BelongsToCategory_B_fkey";

-- DropIndex
DROP INDEX "Activity_locationId_key";

-- AlterTable
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_pkey",
DROP COLUMN "aId",
DROP COLUMN "creatorId",
DROP COLUMN "locationId",
ADD COLUMN     "acId" SERIAL NOT NULL,
ADD COLUMN     "closed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "closureNote" TEXT,
ADD COLUMN     "coverImage" TEXT NOT NULL,
ADD COLUMN     "galleryImages" TEXT[],
ADD COLUMN     "hId" INTEGER NOT NULL,
ADD COLUMN     "lId" INTEGER NOT NULL,
DROP COLUMN "openingTimes",
ADD COLUMN     "openingTimes" JSONB NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ADD CONSTRAINT "Activity_pkey" PRIMARY KEY ("acId");

-- DropTable
DROP TABLE "_AttachedActivites";

-- DropTable
DROP TABLE "_BelongsToCategory";

-- CreateIndex
CREATE UNIQUE INDEX "Activity_lId_key" ON "Activity"("lId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_lId_fkey" FOREIGN KEY ("lId") REFERENCES "Location"("lId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_hId_fkey" FOREIGN KEY ("hId") REFERENCES "Host"("hId") ON DELETE CASCADE ON UPDATE CASCADE;
