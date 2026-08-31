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

// Schema changes must not go through a connection pooler. Migrations take a
// postgres advisory lock, which belongs to a session — a pooler hands each
// statement to a different backend, so the lock can never be acquired and the
// deploy dies with P1002 after ten seconds.
//
// Neon names the two endpoints for the same database "<id>-pooler.<host>" and
// "<id>.<host>", so a pooled URL can be rewritten into its direct twin. That
// keeps deploys working even when the environment only offers a pooled URL, or
// offers a "direct" one that turns out to be pooled after all.
function toDirect(url) {
  return url
    .replace("-pooler.", ".")
    .replace(/([?&])pgbouncer=true(&|$)/, (_m, before, after) => (after === "&" ? before : ""))
    .replace(/[?&]$/, "");
}

const direct = toDirect(
  process.env.DIRECT_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    pooled
);

// A sleeping Neon compute, or a migration still finishing elsewhere, makes the
// first attempt time out (P1002 — advisory lock) and would otherwise fail the
// whole deploy. These are transient, so wait and try again.
const TRANSIENT = /P1002|P1001|advisory lock|timed out|ETIMEDOUT|ECONNRESET|ECONNREFUSED/i;
const ATTEMPTS = 3;
const sleep = (seconds) =>
  execSync(`node -e "setTimeout(()=>{}, ${seconds * 1000})"`, { stdio: "ignore" });

const run = (command, url) => {
  for (let attempt = 1; ; attempt++) {
    try {
      // Merge stderr into stdout so a failure's reason is visible in the build log.
      process.stdout.write(
        execSync(`${command} 2>&1`, {
          env: { ...process.env, DATABASE_URL: url },
          encoding: "utf8",
        })
      );
      return;
    } catch (error) {
      const output = String(error.stdout ?? "") + String(error.stderr ?? "");
      process.stdout.write(output);

      if (attempt >= ATTEMPTS || !TRANSIENT.test(output)) {
        console.error(`\n✖ "${command}" failed after ${attempt} attempt(s).`);
        process.exit(1);
      }

      const wait = attempt * 10;
      console.warn(
        `\n⚠  "${command}" hit a transient database error ` +
          `(attempt ${attempt}/${ATTEMPTS}). Retrying in ${wait}s…\n`
      );
      sleep(wait);
    }
  }
};

console.log(
  direct === pooled
    ? "Applying database migrations…"
    : "Applying database migrations (direct connection)…"
);
if (direct.includes("-pooler.")) {
  console.warn("⚠  The migration URL still looks pooled; the advisory lock may time out.");
}
run("prisma migrate deploy", direct);

console.log("Ensuring the course catalogue exists…");
run("tsx prisma/seed-courses.ts", direct);
