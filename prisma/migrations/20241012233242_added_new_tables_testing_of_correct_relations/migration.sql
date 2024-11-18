/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[locationId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAge` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupGId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentBy` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aId` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "isPublic",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "lId" INTEGER NOT NULL,
ADD COLUMN     "locationId" INTEGER NOT NULL,
ADD COLUMN     "minAge" INTEGER NOT NULL,
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Host" ADD COLUMN     "companyName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "groupGId" INTEGER NOT NULL,
ADD COLUMN     "sentBy" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "aId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Activity" (
    "aId" SERIAL NOT NULL,
    "openingTimes" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("aId")
);

-- CreateTable
CREATE TABLE "Category" (
    "cId" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "seasonal" BOOLEAN NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("cId")
);

-- CreateTable
CREATE TABLE "Group" (
    "gId" SERIAL NOT NULL,
    "picture" TEXT,
    "name" TEXT NOT NULL DEFAULT 'Party gurrrls',
    "creationDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "owningUser" INTEGER NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("gId")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "gmId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "joined" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("gmId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "nId" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("nId")
);

-- CreateTable
CREATE TABLE "_BelongsToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Activity_locationId_key" ON "Activity"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "_BelongsToCategory_AB_unique" ON "_BelongsToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_BelongsToCategory_B_index" ON "_BelongsToCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Event_locationId_key" ON "Event"("locationId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupGId_fkey" FOREIGN KEY ("groupGId") REFERENCES "Group"("gId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("lId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Host"("hId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("lId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_owningUser_fkey" FOREIGN KEY ("owningUser") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("gId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BelongsToCategory" ADD CONSTRAINT "_BelongsToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BelongsToCategory" ADD CONSTRAINT "_BelongsToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("cId") ON DELETE CASCADE ON UPDATE CASCADE;
