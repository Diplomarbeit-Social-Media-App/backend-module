-- CreateTable
CREATE TABLE "AboRequest" (
    "frId" SERIAL NOT NULL,
    "state" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,

    CONSTRAINT "AboRequest_pkey" PRIMARY KEY ("frId")
);

-- AddForeignKey
ALTER TABLE "AboRequest" ADD CONSTRAINT "AboRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AboRequest" ADD CONSTRAINT "AboRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;
