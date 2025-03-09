-- CreateTable
CREATE TABLE "ActivityParticipation" (
    "apId" SERIAL NOT NULL,
    "uId" INTEGER NOT NULL,
    "acId" INTEGER NOT NULL,
    "on" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityParticipation_pkey" PRIMARY KEY ("apId")
);

-- AddForeignKey
ALTER TABLE "ActivityParticipation" ADD CONSTRAINT "ActivityParticipation_acId_fkey" FOREIGN KEY ("acId") REFERENCES "Activity"("acId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityParticipation" ADD CONSTRAINT "ActivityParticipation_uId_fkey" FOREIGN KEY ("uId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;
