-- DropForeignKey
ALTER TABLE "AboRequest" DROP CONSTRAINT "AboRequest_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "AboRequest" DROP CONSTRAINT "AboRequest_toUserId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_friendId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_userId_fkey";

-- DropForeignKey
ALTER TABLE "Host" DROP CONSTRAINT "Host_aId_fkey";

-- DropForeignKey
ALTER TABLE "HostRating" DROP CONSTRAINT "HostRating_hostId_fkey";

-- DropForeignKey
ALTER TABLE "HostRating" DROP CONSTRAINT "HostRating_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sentBy_fkey";

-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_aId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_aId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_aId_fkey";

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Host"("hId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Host"("hId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboRequest" ADD CONSTRAINT "AboRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboRequest" ADD CONSTRAINT "AboRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostRating" ADD CONSTRAINT "HostRating_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("hId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostRating" ADD CONSTRAINT "HostRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;
