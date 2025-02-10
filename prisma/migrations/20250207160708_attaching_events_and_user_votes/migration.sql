-- CreateTable
CREATE TABLE "AttachedEvent" (
    "aeId" SERIAL NOT NULL,
    "suggestedBy" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "eId" INTEGER NOT NULL,
    "pollEndsAt" TIMESTAMP(3) NOT NULL,
    "picture" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "street" TEXT NOT NULL,
    "postCode" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "houseNumber" INTEGER NOT NULL,
    "meetingPoint" TEXT NOT NULL,
    "meetingTime" TEXT NOT NULL,

    CONSTRAINT "AttachedEvent_pkey" PRIMARY KEY ("aeId")
);

-- CreateTable
CREATE TABLE "GroupEventVote" (
    "gevId" SERIAL NOT NULL,
    "uId" INTEGER NOT NULL,
    "aId" INTEGER NOT NULL,
    "vote" BOOLEAN NOT NULL,
    "pickupOutbound" BOOLEAN NOT NULL DEFAULT false,
    "pickupReturn" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GroupEventVote_pkey" PRIMARY KEY ("gevId")
);

-- AddForeignKey
ALTER TABLE "AttachedEvent" ADD CONSTRAINT "AttachedEvent_eId_fkey" FOREIGN KEY ("eId") REFERENCES "Event"("eId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupEventVote" ADD CONSTRAINT "GroupEventVote_uId_fkey" FOREIGN KEY ("uId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupEventVote" ADD CONSTRAINT "GroupEventVote_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;
