import type { PrismaClient } from "../src/generated/prisma/client";
import { SERVICES } from "../src/lib/services";

/**
 * Courses are configuration, not sample data — without them the site has
 * nothing to show and nothing to search. This runs on every deploy so a fresh
 * database is never left empty.
 *
 * `active` is deliberately not updated: a course an admin has hidden stays
 * hidden across deploys.
 */
export async function seedCourses(db: PrismaClient) {
  const ids: Record<string, string> = {};
  for (const s of SERVICES) {
    const data = {
      name: s.name,
      description: s.description,
      emoji: s.emoji,
      priceMin: s.priceMin,
      priceMax: s.priceMax,
      grades: JSON.stringify(s.grades),
    };
    const rec = await db.service.upsert({
      where: { slug: s.slug },
      update: data,
      create: { slug: s.slug, ...data },
    });
    ids[s.slug] = rec.id;
  }
  return ids;
}
