import { notFound } from "next/navigation";
import { connection } from "next/server";
import Wizard from "@/components/Wizard";
import { db } from "@/lib/db";
import { buildQuestions } from "@/lib/services";

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
  const service = await db.service.findUnique({ where: { slug } });
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
    />
  );
}
