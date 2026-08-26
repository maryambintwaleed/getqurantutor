import { GraduationCap, Users, Inbox, FileText, Trophy, Coins } from "lucide-react";
import { db } from "@/lib/db";

export default async function AdminOverview() {
  const [tutors, parents, openRequests, totalRequests, quotes, wins, creditAgg] =
    await Promise.all([
      db.user.count({ where: { role: "TUTOR" } }),
      db.user.count({ where: { role: "PARENT" } }),
      db.request.count({ where: { status: "OPEN" } }),
      db.request.count(),
      db.quote.count(),
      db.quote.count({ where: { status: "WON" } }),
      db.walletTransaction.aggregate({
        where: { type: "QUOTE_FEE" },
        _sum: { amount: true },
      }),
    ]);

  const creditsSpent = Math.abs(creditAgg._sum.amount ?? 0);

  const stats = [
    { icon: GraduationCap, label: "Teachers", value: tutors },
    { icon: Users, label: "Families", value: parents },
    { icon: Inbox, label: "Open requests", value: `${openRequests} / ${totalRequests}` },
    { icon: FileText, label: "Quotes sent", value: quotes },
    { icon: Trophy, label: "Jobs won", value: wins },
    { icon: Coins, label: "Credits spent on quotes", value: creditsSpent },
  ];

  const recent = await db.request.findMany({
    include: { service: true, quotes: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <s.icon size={20} />
            </span>
            <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold text-slate-900">Latest requests</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {recent.map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center justify-between gap-3 px-5 py-4 ${
              i > 0 ? "border-t border-slate-100" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">
                {r.service.name} — {r.parentName}
              </p>
              <p className="text-xs text-slate-500">
                {r.grade || "No level"} · {r.tutorGender || "Any"} teacher · {r.quotes.length} quote
                {r.quotes.length === 1 ? "" : "s"}
              </p>
            </div>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                r.status === "OPEN"
                  ? "bg-brand-50 text-brand-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
