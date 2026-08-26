import { notFound } from "next/navigation";
import Wizard from "@/components/Wizard";
import { db } from "@/lib/db";
import { buildQuestions } from "@/lib/services";

export default async function RequestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await db.service.findUnique({ where: { slug } });
  if (!service || !service.active) notFound();

  const grades: string[] = JSON.parse(service.grades);
  return (
    <Wizard
      service={{
        slug: service.slug,
        name: service.name,
        emoji: service.emoji,
        priceMin: service.priceMin,
        priceMax: service.priceMax,
        questions: buildQuestions(slug, grades),
      }}
    />
  );
}
