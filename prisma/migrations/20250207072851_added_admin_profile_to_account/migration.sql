-- CreateTable
CREATE TABLE "AdminProfile" (
    "aaId" SERIAL NOT NULL,
    "aId" INTEGER NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("aaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_aId_key" ON "AdminProfile"("aId");

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_aId_fkey" FOREIGN KEY ("aId") REFERENCES "Account"("aId") ON DELETE RESTRICT ON UPDATE CASCADE;
