import { db } from "@/lib/db";
import { adjustCredits, deleteUser } from "@/actions/admin";
import { timeAgo } from "@/lib/format";
import { formatZone } from "@/lib/geo";

export default async function AdminTutors() {
  const tutors = await db.user.findMany({
    where: { role: "TUTOR" },
    include: {
      tutorProfile: {
        include: {
          services: { include: { service: true } },
          quotes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Teachers</h1>
      <p className="mt-2 text-sm text-slate-400">{tutors.length} registered</p>

      <div className="mt-6 space-y-4">
        {tutors.map((t) => {
          const p = t.tutorProfile!;
          const grades: string[] = JSON.parse(p.grades || "[]");
          return (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">
                    {t.email} · joined {timeAgo(t.createdAt)}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
                      {p.gender || "Gender not set"}
                    </span>
                    {p.country && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
                        {p.country}
                        {p.timezone ? ` (${formatZone(p.timezone)})` : ""}
                      </span>
                    )}
                    {p.ijazah && (
                      <span className="rounded-lg bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">
                        Ijazah
                      </span>
                    )}
                    {p.hafiz && (
                      <span className="rounded-lg bg-accent-50 px-2 py-0.5 font-semibold text-accent-700">
                        {p.gender === "Female" ? "Hafiza" : "Hafiz"}
                      </span>
                    )}
                    {(JSON.parse(p.languages || "[]") as string[]).map((l) => (
                      <span key={l} className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
                        {l}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-slate-900">{p.balance} credits</p>
                  <p className="text-slate-500">
                    {p.quotes.length} quotes · {p.quotes.filter((quote) => quote.status === "WON").length} wins
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.services.map((ts) => (
                  <span
                    key={ts.id}
                    className="rounded-lg bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                  >
                    {ts.service.name}
                  </span>
                ))}
                {grades.map((g) => (
                  <span
                    key={g}
                    className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {g}
                  </span>
                ))}
                {p.services.length === 0 && (
                  <span className="text-xs text-slate-400">No courses selected yet</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <form action={adjustCredits} className="flex items-center gap-2">
                  <input type="hidden" name="tutorId" value={p.id} />
                  <input
                    name="amount"
                    type="number"
                    step="1"
                    placeholder="+/- credits"
                    className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
                  />
                  <button className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">
                    Adjust credits
                  </button>
                </form>
                <form action={deleteUser} className="ml-auto">
                  <input type="hidden" name="userId" value={t.id} />
                  <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                    Delete teacher
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
