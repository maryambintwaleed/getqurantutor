import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string to .env (local) " +
        "and to the project's Environment Variables (Vercel)."
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
