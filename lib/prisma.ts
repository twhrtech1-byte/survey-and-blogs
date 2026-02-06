import { PrismaClient } from './generated/client/client'

// Prisma Accelerate / Standard Connection
// The connection string protocol 'prisma+postgres://' handles the connection type.

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        accelerateUrl: process.env.DATABASE_URL,
        log: ['query', 'error', 'warn'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
