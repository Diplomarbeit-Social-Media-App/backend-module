-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "loginOs" TEXT NOT NULL DEFAULT 'web';

-- CreateTable
CREATE TABLE "quadrant" (
    "quadrantid" SERIAL NOT NULL,
    "xid" SMALLINT,
    "yid" SMALLINT,
    "xminutes" SMALLINT,
    "yminutes" SMALLINT,

    CONSTRAINT "quadrant_pkey" PRIMARY KEY ("quadrantid")
);

-- CreateTable
CREATE TABLE "quadrant_distances" (
    "quadrant1id" SMALLINT NOT NULL,
    "quadrant2id" SMALLINT NOT NULL,
    "distance" REAL,

    CONSTRAINT "quadrant_distances_pkey" PRIMARY KEY ("quadrant1id","quadrant2id")
);
