import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? (() => {
  // Always use adapter for PostgreSQL
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 60000,
    query_timeout: 60000,
    statement_timeout: 60000,
    idle_in_transaction_session_timeout: 60000
  })
  const adapter = new PrismaPg(pool)
  const client = new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn']
  })
  console.log('Prisma client created')
  return client
})()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
