/*
  Warnings:

  - You are about to drop the column `joined` on the `GroupMember` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `GroupMember` table. All the data in the column will be lost.
  - Added the required column `aId` to the `GroupMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uId` to the `GroupMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_userId_fkey";

-- AlterTable
ALTER TABLE "GroupMember" DROP COLUMN "joined",
DROP COLUMN "userId",
ADD COLUMN     "aId" INTEGER NOT NULL,
ADD COLUMN     "acceptedInvitation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "uId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_uId_fkey" FOREIGN KEY ("uId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE RESTRICT ON UPDATE CASCADE;
