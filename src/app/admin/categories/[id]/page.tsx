import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import CategoryForm from "@/components/CategoryForm";

export default async function EditCategory({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await db.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Edit category</h1>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <CategoryForm
          initial={{
            id: service.id,
            name: service.name,
            emoji: service.emoji,
            description: service.description,
            priceMin: service.priceMin,
            priceMax: service.priceMax,
            grades: JSON.parse(service.grades || "[]"),
          }}
        />
      </div>
    </>
  );
}
