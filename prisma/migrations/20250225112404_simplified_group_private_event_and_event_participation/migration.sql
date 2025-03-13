/*
  Warnings:

  - You are about to drop the column `meetingPoint` on the `AttachedEvent` table. All the data in the column will be lost.
  - You are about to drop the column `meetingTime` on the `AttachedEvent` table. All the data in the column will be lost.
  - You are about to drop the `GroupEventParticipation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `startsAt` to the `AttachedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroupEventParticipation" DROP CONSTRAINT "GroupEventParticipation_aId_fkey";

-- DropForeignKey
ALTER TABLE "GroupEventParticipation" DROP CONSTRAINT "GroupEventParticipation_aeId_fkey";

-- DropForeignKey
ALTER TABLE "GroupEventParticipation" DROP CONSTRAINT "GroupEventParticipation_gmId_fkey";

-- DropForeignKey
ALTER TABLE "GroupEventParticipation" DROP CONSTRAINT "GroupEventParticipation_uId_fkey";

-- AlterTable
ALTER TABLE "AttachedEvent" DROP COLUMN "meetingPoint",
DROP COLUMN "meetingTime",
ADD COLUMN     "startsAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "GroupEventParticipation";

-- CreateTable
CREATE TABLE "PrivateEventParticipation" (
    "pepId" SERIAL NOT NULL,
    "uId" INTEGER NOT NULL,
    "aId" INTEGER NOT NULL,
    "gmId" INTEGER NOT NULL,
    "aeId" INTEGER NOT NULL,

    CONSTRAINT "PrivateEventParticipation_pkey" PRIMARY KEY ("pepId")
);

-- AddForeignKey
ALTER TABLE "PrivateEventParticipation" ADD CONSTRAINT "PrivateEventParticipation_uId_fkey" FOREIGN KEY ("uId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateEventParticipation" ADD CONSTRAINT "PrivateEventParticipation_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateEventParticipation" ADD CONSTRAINT "PrivateEventParticipation_gmId_fkey" FOREIGN KEY ("gmId") REFERENCES "GroupMember"("gmId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateEventParticipation" ADD CONSTRAINT "PrivateEventParticipation_aeId_fkey" FOREIGN KEY ("aeId") REFERENCES "AttachedEvent"("aeId") ON DELETE CASCADE ON UPDATE CASCADE;
