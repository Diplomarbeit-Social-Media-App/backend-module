/*
  Warnings:

  - You are about to drop the column `hostHId` on the `SocialLinks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SocialLinks" DROP CONSTRAINT "SocialLinks_hostHId_fkey";

-- AlterTable
ALTER TABLE "SocialLinks" DROP COLUMN "hostHId";

-- AddForeignKey
ALTER TABLE "SocialLinks" ADD CONSTRAINT "SocialLinks_hId_fkey" FOREIGN KEY ("hId") REFERENCES "Host"("hId") ON DELETE RESTRICT ON UPDATE CASCADE;
