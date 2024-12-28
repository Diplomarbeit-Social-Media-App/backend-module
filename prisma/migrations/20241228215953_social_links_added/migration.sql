-- CreateTable
CREATE TABLE "SocialLinks" (
    "slId" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "hId" INTEGER NOT NULL,
    "hostHId" INTEGER NOT NULL,

    CONSTRAINT "SocialLinks_pkey" PRIMARY KEY ("slId")
);

-- AddForeignKey
ALTER TABLE "SocialLinks" ADD CONSTRAINT "SocialLinks_hostHId_fkey" FOREIGN KEY ("hostHId") REFERENCES "Host"("hId") ON DELETE RESTRICT ON UPDATE CASCADE;
