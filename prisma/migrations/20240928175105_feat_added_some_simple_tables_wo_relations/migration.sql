-- CreateTable
CREATE TABLE "Location" (
    "lId" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "postCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Austria',

    CONSTRAINT "Location_pkey" PRIMARY KEY ("lId")
);

-- CreateTable
CREATE TABLE "User" (
    "uId" SERIAL NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uId")
);

-- CreateTable
CREATE TABLE "Host" (
    "hId" SERIAL NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("hId")
);

-- CreateTable
CREATE TABLE "Account" (
    "aId" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "picture" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("aId")
);

-- CreateTable
CREATE TABLE "Message" (
    "mId" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("mId")
);

-- CreateTable
CREATE TABLE "Event" (
    "eId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("eId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_userName_key" ON "Account"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
