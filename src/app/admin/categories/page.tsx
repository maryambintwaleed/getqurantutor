import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { toggleCategory, deleteCategory } from "@/actions/admin";

export default async function AdminCategories() {
  const services = await db.service.findMany({
    include: { requests: true, tutors: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus size={16} /> New category
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {services.map((s) => {
          const grades: string[] = JSON.parse(s.grades || "[]");
          return (
            <div
              key={s.id}
              className={`rounded-2xl border bg-white p-5 ${
                s.active ? "border-slate-200" : "border-slate-200 opacity-60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">
                    {s.emoji} {s.name}
                    {!s.active && (
                      <span className="ml-2 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        Hidden
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">{s.description}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {grades.length === 0 ? (
                  <span className="text-xs text-amber-600">
                    ⚠ No levels set — wizard will skip the level question
                  </span>
                ) : (
                  grades.map((g) => (
                    <span
                      key={g}
                      className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {g}
                    </span>
                  ))
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-400">
                  {s.requests.length} requests · {s.tutors.length} teachers
                </span>
                <div className="ml-auto flex gap-2">
                  <Link
                    href={`/admin/categories/${s.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700"
                  >
                    Edit
                  </Link>
                  <form action={toggleCategory}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700">
                      {s.active ? "Hide" : "Show"}
                    </button>
                  </form>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
