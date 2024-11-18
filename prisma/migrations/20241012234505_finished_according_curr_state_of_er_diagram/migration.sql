/*
  Warnings:

  - Added the required column `creatorId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_HostFollowers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AttachedActivites" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AttachedEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Participates" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_HostFollowers_AB_unique" ON "_HostFollowers"("A", "B");

-- CreateIndex
CREATE INDEX "_HostFollowers_B_index" ON "_HostFollowers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttachedActivites_AB_unique" ON "_AttachedActivites"("A", "B");

-- CreateIndex
CREATE INDEX "_AttachedActivites_B_index" ON "_AttachedActivites"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AttachedEvents_AB_unique" ON "_AttachedEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_AttachedEvents_B_index" ON "_AttachedEvents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Participates_AB_unique" ON "_Participates"("A", "B");

-- CreateIndex
CREATE INDEX "_Participates_B_index" ON "_Participates"("B");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Host"("hId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HostFollowers" ADD CONSTRAINT "_HostFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "Host"("hId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HostFollowers" ADD CONSTRAINT "_HostFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachedActivites" ADD CONSTRAINT "_AttachedActivites_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachedActivites" ADD CONSTRAINT "_AttachedActivites_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("gId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachedEvents" ADD CONSTRAINT "_AttachedEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttachedEvents" ADD CONSTRAINT "_AttachedEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("gId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Participates" ADD CONSTRAINT "_Participates_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Participates" ADD CONSTRAINT "_Participates_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;
