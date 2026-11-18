import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Star, BadgeCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { acceptQuote, updateRequestMode } from "@/actions/requests";
import { timeAgo } from "@/lib/format";
import { formatZone } from "@/lib/geo";

export default async function MyRequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/requests");
  // This is the family view. A teacher who lands here — from a bookmark, or a
  // ?next= carried through login — belongs in their own dashboard, not on a
  // page inviting them to hire a teacher.
  if (user.role === "TUTOR") redirect("/pro/opportunities");
  if (user.role === "ADMIN") redirect("/admin");

  const requests = await db.request.findMany({
    where: { parentId: user.id },
    include: {
      service: true,
      quotes: {
        include: { tutor: { include: { user: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">My Requests</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/request/school-hiring"
              className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-100 transition"
            >
              🏫 Hire for School
            </Link>
            <Link
              href="/"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              New request
            </Link>
          </div>
        </div>

        {requests.length === 0 && (
          <div className="mt-10 rounded-2xl border border-slate-200 p-12 text-center">
            <p className="font-semibold text-slate-900">You haven't made a request yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Tell us what you need and verified teachers will send you quotes or apply to your school.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
              >
                Find a teacher
              </Link>
              <Link
                href="/request/school-hiring"
                className="inline-block rounded-full border border-indigo-200 bg-indigo-50 px-6 py-3 font-semibold text-indigo-800 hover:bg-indigo-100"
              >
                🏫 School Hiring Request
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {requests.map((r) => {
            const reqMode = r.mode === "Offline" ? "Offline" : "Online";
            const toggleTarget = reqMode === "Online" ? "Offline" : "Online";
            return (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900">{r.service.name}</p>
                      {r.isSchool && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                          🏫 School Hiring
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          reqMode === "Offline"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            reqMode === "Offline" ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        />
                        {reqMode}
                      </span>
                      {r.status === "OPEN" && (
                        <form action={updateRequestMode.bind(null, r.id, toggleTarget)}>
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700 transition"
                          >
                            Switch to {toggleTarget}
                          </button>
                        </form>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {r.grade || reqMode}
                      {r.city ? ` · ${r.city}` : ""} · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      r.status === "OPEN"
                        ? "bg-brand-50 text-brand-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {r.status === "OPEN" ? "Receiving quotes" : "Teacher chosen"}
                  </span>
                </div>

                <div className="px-6 py-4">
                  {r.quotes.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-500">
                      No quotes yet — teachers usually respond within a few hours.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {r.quotes.map((quote) => {
                        const qMode = quote.mode === "Offline" ? "Offline" : "Online";
                        return (
                          <div
                            key={quote.id}
                            className={`rounded-xl border p-4 ${
                              quote.status === "WON"
                                ? "border-green-300 bg-green-50/50"
                                : quote.status === "DECLINED"
                                  ? "border-slate-100 opacity-60"
                                  : "border-slate-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                                  {quote.tutor.user.name.charAt(0)}
                                </span>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-slate-900">
                                      {quote.tutor.user.name}
                                    </p>
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                        qMode === "Offline"
                                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                      }`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          qMode === "Offline" ? "bg-amber-500" : "bg-emerald-500"
                                        }`}
                                      />
                                      {qMode}
                                    </span>
                                  </div>
                                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Star size={12} className="fill-accent-500 text-accent-500" />
                                      Ranking {quote.tutor.ranking}
                                    </span>
                                    {quote.tutor.gender && <span>{quote.tutor.gender} teacher</span>}
                                    {quote.tutor.country && <span>· {quote.tutor.country}</span>}
                                    {quote.tutor.timezone && <span>({formatZone(quote.tutor.timezone)})</span>}
                                  </p>
                                  <p className="mt-1 flex flex-wrap items-center gap-1.5">
                                    {quote.tutor.ijazah && (
                                      <span className="flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                                        <BadgeCheck size={12} /> Ijazah
                                      </span>
                                    )}
                                    {quote.tutor.hafiz && (
                                      <span className="rounded-lg bg-accent-50 px-2 py-0.5 text-[11px] font-semibold text-accent-700">
                                        🕌 {quote.tutor.gender === "Female" ? "Hafiza" : "Hafiz"}
                                      </span>
                                    )}
                                    {(JSON.parse(quote.tutor.languages || "[]") as string[]).map((l) => (
                                      <span
                                        key={l}
                                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                                      >
                                        {l}
                                      </span>
                                    ))}
                                  </p>
                                </div>
                              </div>
                              <p className="text-lg font-bold text-slate-900">
                                ${quote.price}
                                <span className="text-xs font-normal text-slate-400"> /class</span>
                              </p>
                            </div>
                        {quote.tutor.bio && (
                          <p className="mt-2 text-xs text-slate-500">{quote.tutor.bio}</p>
                        )}
                        <p className="mt-3 text-sm leading-relaxed text-slate-700">
                          {quote.message}
                        </p>
                        <div className="mt-3">
                          {quote.status === "WON" ? (
                            <p className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
                              <CheckCircle2 size={16} /> You chose this teacher
                            </p>
                          ) : (
                            r.status === "OPEN" && (
                              <form action={acceptQuote.bind(null, quote.id)}>
                                <button className="rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600">
                                  Choose this teacher
                                </button>
                              </form>
                            )
                          )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
