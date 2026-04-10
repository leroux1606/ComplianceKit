/**
 * scripts/seed-test-user.mjs
 *
 * Creates (or resets) the E2E test user directly in the database.
 * Bypasses the signup UI for faster, more reliable test setup.
 *
 * Run with:
 *   pnpm dotenv -e .env.test -- node scripts/seed-test-user.mjs
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✗ DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.E2E_TEST_EMAIL ?? "e2e@test.local";
  const password = process.env.E2E_TEST_PASSWORD ?? "E2eTest123!";
  const name = process.env.E2E_TEST_NAME ?? "E2E Test User";

  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date();

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      consentedAt: now,
      dpaAcceptedAt: now,
      emailVerified: now,
    },
    create: {
      email,
      name,
      password: hashedPassword,
      consentedAt: now,
      dpaAcceptedAt: now,
      emailVerified: now,
    },
  });

  console.log(`✓ Test user ready: ${user.email} (id: ${user.id})`);

  // Clear any brute-force lockout records for the test user so E2E auth works
  const deleted = await prisma.loginAttemptRecord.deleteMany({
    where: { identifier: { startsWith: email.toLowerCase() } },
  });
  if (deleted.count > 0) {
    console.log(`✓ Cleared ${deleted.count} lockout record(s) for ${email}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (err) => {
    console.error("✗ Failed to seed test user:", err);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
