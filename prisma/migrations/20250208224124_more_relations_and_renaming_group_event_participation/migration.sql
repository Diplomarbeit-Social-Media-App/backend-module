/*
  Warnings:

  - You are about to drop the `GroupEventVote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupEventVote" DROP CONSTRAINT "GroupEventVote_aId_fkey";

-- DropForeignKey
ALTER TABLE "GroupEventVote" DROP CONSTRAINT "GroupEventVote_uId_fkey";

-- DropTable
DROP TABLE "GroupEventVote";

-- CreateTable
CREATE TABLE "GroupEventParticipation" (
    "gevId" SERIAL NOT NULL,
    "uId" INTEGER NOT NULL,
    "aId" INTEGER NOT NULL,
    "gmId" INTEGER NOT NULL,
    "aeId" INTEGER NOT NULL,
    "vote" BOOLEAN NOT NULL,
    "pickupOutbound" BOOLEAN NOT NULL DEFAULT false,
    "pickupReturn" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GroupEventParticipation_pkey" PRIMARY KEY ("gevId")
);

-- AddForeignKey
ALTER TABLE "GroupEventParticipation" ADD CONSTRAINT "GroupEventParticipation_uId_fkey" FOREIGN KEY ("uId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupEventParticipation" ADD CONSTRAINT "GroupEventParticipation_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupEventParticipation" ADD CONSTRAINT "GroupEventParticipation_gmId_fkey" FOREIGN KEY ("gmId") REFERENCES "GroupMember"("gmId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupEventParticipation" ADD CONSTRAINT "GroupEventParticipation_aeId_fkey" FOREIGN KEY ("aeId") REFERENCES "AttachedEvent"("aeId") ON DELETE CASCADE ON UPDATE CASCADE;
