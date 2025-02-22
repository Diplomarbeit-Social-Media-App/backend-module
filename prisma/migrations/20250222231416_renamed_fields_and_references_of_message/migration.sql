/*
  Warnings:

  - You are about to drop the column `groupGId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `sentBy` on the `Message` table. All the data in the column will be lost.
  - Added the required column `gId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_groupGId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sentBy_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "groupGId",
DROP COLUMN "sentBy",
ADD COLUMN     "gId" INTEGER NOT NULL,
ADD COLUMN     "uId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_gId_fkey" FOREIGN KEY ("gId") REFERENCES "Group"("gId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_uId_fkey" FOREIGN KEY ("uId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;
