import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import Wizard from "@/components/Wizard";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildQuestions, getService, SCHOOL_HIRING_SLUG } from "@/lib/services";

export default async function RequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ tutor?: string; teacher?: string }>;
}) {
  await connection();
  const { slug } = await params;
  const { teacher } = (await searchParams) || {};

  const user = await getCurrentUser();
  if (!user) {
    const nextPath = `/request/${slug}${teacher ? `?teacher=${encodeURIComponent(teacher)}` : ""}`;
    const roleParam = slug === SCHOOL_HIRING_SLUG ? "&role=SCHOOL" : "";
    redirect(`/register?next=${encodeURIComponent(nextPath)}${roleParam}`);
  }

  let service = await db.service.findUnique({ where: { slug } });
  if (!service && slug === SCHOOL_HIRING_SLUG) {
    const def = getService(SCHOOL_HIRING_SLUG)!;
    service = await db.service.create({
      data: {
        slug: def.slug,
        name: def.name,
        description: def.description,
        emoji: def.emoji,
        priceMin: def.priceMin,
        priceMax: def.priceMax,
        grades: JSON.stringify(def.grades),
      },
    });
  }
  if (!service || !service.active) notFound();

  const grades: string[] = JSON.parse(service.grades);
  return (
    <Wizard
      service={{
        slug: service.slug,
        name: service.name,
        emoji: service.emoji,
        questions: buildQuestions(slug, grades),
      }}
      preferredTeacher={teacher}
      initialUser={{ name: user.name, email: user.email }}
    />
  );
}
