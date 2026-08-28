// Prepares the database during the build: applies pending migrations, then
// makes sure the course catalogue exists. Without the second step a fresh
// database deploys an empty homepage — no courses, nothing to search.
//
// Skips cleanly when no database is configured yet, so the build still
// succeeds on a fresh project before DATABASE_URL has been attached.
import { execSync } from "node:child_process";

const pooled = process.env.DATABASE_URL;

if (!pooled) {
  console.warn(
    "\n⚠  DATABASE_URL is not set — skipping migrations and course setup.\n" +
      "   The app will return a server error until a Postgres database is attached.\n"
  );
  process.exit(0);
}

// Schema changes must not go through a connection pooler (Neon and Vercel
// Postgres both expose a direct URL alongside the pooled one). Serving queries
// still uses the pooled DATABASE_URL.
const direct =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  pooled;

const run = (command, url) =>
  execSync(command, { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });

console.log(
  direct === pooled
    ? "Applying database migrations…"
    : "Applying database migrations (direct connection)…"
);
run("prisma migrate deploy", direct);

console.log("Ensuring the course catalogue exists…");
run("tsx prisma/seed-courses.ts", direct);
