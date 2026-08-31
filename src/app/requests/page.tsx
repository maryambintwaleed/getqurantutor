import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Star, BadgeCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { acceptQuote } from "@/actions/requests";
import { timeAgo } from "@/lib/format";
import { formatZone } from "@/lib/geo";

export default async function MyRequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/requests");

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">My Requests</h1>
          <Link
            href="/"
            className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            New request
          </Link>
        </div>

        {requests.length === 0 && (
          <div className="mt-10 rounded-2xl border border-slate-200 p-12 text-center">
            <p className="font-semibold text-slate-900">You haven't made a request yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Tell us what you need and verified teachers will send you quotes.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
            >
              Find a teacher
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {requests.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <p className="font-bold text-slate-900">{r.service.name}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {r.grade || r.mode}
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
                    {r.quotes.map((quote) => (
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
                              <p className="font-semibold text-slate-900">
                                {quote.tutor.user.name}
                              </p>
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
