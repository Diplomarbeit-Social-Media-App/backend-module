/*
  Warnings:

  - You are about to drop the column `owningUser` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `GroupMember` table. All the data in the column will be lost.
  - Added the required column `gId` to the `GroupMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_owningUser_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_aId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_uId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "owningUser";

-- AlterTable
ALTER TABLE "GroupMember" DROP COLUMN "groupId",
ADD COLUMN     "gId" INTEGER NOT NULL,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_gId_fkey" FOREIGN KEY ("gId") REFERENCES "Group"("gId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_uId_fkey" FOREIGN KEY ("uId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;
