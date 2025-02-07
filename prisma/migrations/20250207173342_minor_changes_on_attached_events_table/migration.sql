/*
  Warnings:

  - You are about to drop the column `picture` on the `AttachedEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AttachedEvent" DROP COLUMN "picture",
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Austria',
ADD COLUMN     "image" TEXT,
ALTER COLUMN "postCode" SET DATA TYPE TEXT,
ALTER COLUMN "houseNumber" SET DATA TYPE TEXT;
