-- CreateTable
CREATE TABLE "HostRating" (
    "hrId" SERIAL NOT NULL,
    "hostId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostRating_pkey" PRIMARY KEY ("hrId")
);

-- AddForeignKey
ALTER TABLE "HostRating" ADD CONSTRAINT "HostRating_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("hId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostRating" ADD CONSTRAINT "HostRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;
