import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // max: 1 is correct for serverless — each function invocation handles one
  // request at a time, so a larger pool just opens idle connections that count
  // against the database's connection limit. At 50 concurrent cold starts with
  // the default pool size of 10 you would hit Postgres's connection cap.
  // When DATABASE_URL points to a PgBouncer pooler (Neon/Supabase), PgBouncer
  // multiplexes these single connections across many serverless instances safely.
  const pool = new Pool({ connectionString, max: 1 });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
