/*
  Warnings:

  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `NotificationEventTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationGroupTopic` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `targetId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationEventTopic" DROP CONSTRAINT "NotificationEventTopic_eId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationEventTopic" DROP CONSTRAINT "NotificationEventTopic_uId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationGroupTopic" DROP CONSTRAINT "NotificationGroupTopic_gmId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationGroupTopic" DROP CONSTRAINT "NotificationGroupTopic_uId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_pkey",
DROP COLUMN "nId",
DROP COLUMN "text",
ADD COLUMN     "eventId" INTEGER,
ADD COLUMN     "groupId" INTEGER,
ADD COLUMN     "hostId" INTEGER,
ADD COLUMN     "ntId" SERIAL NOT NULL,
ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "targetId" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("ntId");

-- DropTable
DROP TABLE "NotificationEventTopic";

-- DropTable
DROP TABLE "NotificationGroupTopic";

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("gId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("hId") ON DELETE CASCADE ON UPDATE CASCADE;
