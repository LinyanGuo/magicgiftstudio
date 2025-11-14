import { PrismaClient } from '@prisma/client';

// 在全局声明，避免热重载导致的多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 在生产环境使用单例，在开发环境避免重复实例
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // 可调试 Prisma 查询
  });

// 只有在开发环境下缓存全局实例（生产环境 Vercel 是无状态，不需要缓存）
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
