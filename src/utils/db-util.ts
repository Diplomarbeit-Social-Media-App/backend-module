import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

type prismaClientType = ReturnType<typeof prismaClient>;

const global = globalThis as unknown as {
  prisma: prismaClientType | undefined;
}

const prisma = (): prismaClientType | undefined => {
  return global.prisma ?? new PrismaClient();
}

export default prisma;
