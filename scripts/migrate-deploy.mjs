// Applies pending Prisma migrations during the build.
// Skips cleanly when no database is configured yet, so the build still succeeds
// on a fresh Vercel project before DATABASE_URL has been attached.
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn(
    "\n⚠  DATABASE_URL is not set — skipping `prisma migrate deploy`.\n" +
      "   The app will return a server error until a Postgres database is attached.\n"
  );
  process.exit(0);
}

console.log("Applying database migrations…");
execSync("prisma migrate deploy", { stdio: "inherit" });
