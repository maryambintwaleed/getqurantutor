import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // Prefer an explicit DATABASE_URL, but fall back to the variables the Neon
  // integration maintains on Vercel. Those are updated automatically whenever
  // the database password is rotated, so nothing has to be re-pasted by hand.
  const connectionString =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error(
      "No database connection string. Set DATABASE_URL in .env locally; on Vercel " +
        "either set it or connect the Neon integration, which provides POSTGRES_URL."
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function getClient(): PrismaClient {
  // Cached on globalThis so serverless invocations reuse one pool, and so dev
  // hot-reloads don't open a new connection each time.
  return (globalForPrisma.prisma ??= createClient());
}

/**
 * Connects lazily: the client is only built on first query, so importing this
 * module during `next build` (which has no database) is safe.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
