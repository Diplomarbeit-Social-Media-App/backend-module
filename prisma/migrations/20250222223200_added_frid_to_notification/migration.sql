-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "frId" INTEGER;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_frId_fkey" FOREIGN KEY ("frId") REFERENCES "AboRequest"("frId") ON DELETE SET NULL ON UPDATE CASCADE;
