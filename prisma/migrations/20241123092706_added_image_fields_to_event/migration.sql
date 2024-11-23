/*
  Warnings:

  - You are about to drop the column `public` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "public",
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "galleryImages" TEXT[],
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "prtId" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,
    "aId" INTEGER NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("prtId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_aId_key" ON "PasswordResetToken"("aId");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE RESTRICT ON UPDATE CASCADE;
