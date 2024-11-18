/*
  Warnings:

  - You are about to drop the column `isVerified` on the `Host` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aId]` on the table `Host` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOfBirth` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aId` to the `Host` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Host" DROP COLUMN "isVerified",
ADD COLUMN     "aId" INTEGER NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Friendship" (
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("userId","friendId")
);

-- CreateTable
CREATE TABLE "Token" (
    "tId" SERIAL NOT NULL,
    "iat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exp" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "backlisted" BOOLEAN NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("tId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Host_aId_key" ON "Host"("aId");

-- CreateIndex
CREATE UNIQUE INDEX "User_aId_key" ON "User"("aId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;
