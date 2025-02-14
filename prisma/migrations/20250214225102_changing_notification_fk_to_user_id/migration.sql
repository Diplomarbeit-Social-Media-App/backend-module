/*
  Warnings:

  - You are about to drop the column `aId` on the `NotificationEventTopic` table. All the data in the column will be lost.
  - You are about to drop the column `aId` on the `NotificationGroupTopic` table. All the data in the column will be lost.
  - Added the required column `uId` to the `NotificationEventTopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uId` to the `NotificationGroupTopic` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NotificationEventTopic" DROP CONSTRAINT "NotificationEventTopic_aId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationGroupTopic" DROP CONSTRAINT "NotificationGroupTopic_aId_fkey";

-- AlterTable
ALTER TABLE "NotificationEventTopic" DROP COLUMN "aId",
ADD COLUMN     "uId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "NotificationGroupTopic" DROP COLUMN "aId",
ADD COLUMN     "uId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "NotificationGroupTopic" ADD CONSTRAINT "NotificationGroupTopic_uId_fkey" FOREIGN KEY ("uId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEventTopic" ADD CONSTRAINT "NotificationEventTopic_uId_fkey" FOREIGN KEY ("uId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;
