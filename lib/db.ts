// Re-evaluating Prisma Client after schema update
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma_longevity_v2: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma_longevity_v2 ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prisma_longevity_v2 = db;
