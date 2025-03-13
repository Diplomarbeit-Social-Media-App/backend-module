-- CreateTable
CREATE TABLE "NotificationGroupTopic" (
    "ngtId" SERIAL NOT NULL,
    "topic" TEXT NOT NULL,
    "aId" INTEGER NOT NULL,
    "gmId" INTEGER NOT NULL,

    CONSTRAINT "NotificationGroupTopic_pkey" PRIMARY KEY ("ngtId")
);

-- CreateTable
CREATE TABLE "NotificationEventTopic" (
    "netId" SERIAL NOT NULL,
    "topic" TEXT NOT NULL,
    "aId" INTEGER NOT NULL,
    "eId" INTEGER NOT NULL,

    CONSTRAINT "NotificationEventTopic_pkey" PRIMARY KEY ("netId")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationGroupTopic_gmId_key" ON "NotificationGroupTopic"("gmId");

-- AddForeignKey
ALTER TABLE "NotificationGroupTopic" ADD CONSTRAINT "NotificationGroupTopic_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationGroupTopic" ADD CONSTRAINT "NotificationGroupTopic_gmId_fkey" FOREIGN KEY ("gmId") REFERENCES "GroupMember"("gmId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEventTopic" ADD CONSTRAINT "NotificationEventTopic_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEventTopic" ADD CONSTRAINT "NotificationEventTopic_eId_fkey" FOREIGN KEY ("eId") REFERENCES "Event"("eId") ON DELETE CASCADE ON UPDATE CASCADE;
