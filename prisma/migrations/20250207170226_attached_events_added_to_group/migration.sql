/*
  Warnings:

  - You are about to drop the `_AttachedEvents` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gId` to the `AttachedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AttachedEvents" DROP CONSTRAINT "_AttachedEvents_A_fkey";

-- DropForeignKey
ALTER TABLE "_AttachedEvents" DROP CONSTRAINT "_AttachedEvents_B_fkey";

-- AlterTable
ALTER TABLE "AttachedEvent" ADD COLUMN     "gId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_AttachedEvents";

-- AddForeignKey
ALTER TABLE "AttachedEvent" ADD CONSTRAINT "AttachedEvent_gId_fkey" FOREIGN KEY ("gId") REFERENCES "Group"("gId") ON DELETE CASCADE ON UPDATE CASCADE;
