import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Phone, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { gradeWhere, genderWhere } from "@/lib/matching";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q = "", sort = "newest" } = await searchParams;
  const user = await getCurrentUser();
  const profile = user!.tutorProfile!;
  if (profile.status !== "APPROVED") redirect("/pro/verification");

  const serviceIds = (
    await db.tutorService.findMany({ where: { tutorId: profile.id } })
  ).map((ts) => ts.serviceId);

  const requests = await db.request.findMany({
    where: {
      status: "OPEN",
      serviceId: { in: serviceIds },
      quotes: { none: { tutorId: profile.id } },
      AND: [
        gradeWhere(profile.grades),
        genderWhere(profile.gender),
        q
          ? {
              OR: [
                { details: { contains: q } },
                { parentName: { contains: q } },
                { city: { contains: q } },
                { service: { name: { contains: q } } },
              ],
            }
          : {},
      ],
    },
    include: { service: true, quotes: true },
    orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Opportunities</h1>
      <p className="mt-2 text-sm text-slate-500">
        Requests matching your courses, the levels you accept and your gender.
      </p>

      <form className="mt-6 flex flex-wrap items-center gap-3">
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <div className="flex min-w-56 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Apply
        </button>
        <span className="ml-auto text-sm text-slate-400">
          {requests.length} {requests.length === 1 ? "opportunity" : "opportunities"}
        </span>
      </form>

      <div className="mt-6 space-y-4">
        {requests.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="font-semibold text-slate-900">No open opportunities right now</p>
            <p className="mt-2 text-sm text-slate-500">
              Add more courses or accept more student levels to see more family requests.
            </p>
            <Link
              href="/pro/services"
              className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Manage my courses
            </Link>
          </div>
        )}

        {requests.map((r) => {
          const answers: { question: string; answer: string }[] = JSON.parse(r.answers);
          const tags = answers.map((a) => a.answer).slice(0, 4);
          return (
            <Link
              key={r.id}
              href={`/pro/opportunities/${r.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="font-semibold text-slate-900">{r.parentName}</span>
                </div>
                <span className="text-sm text-slate-400">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="mt-2 font-semibold text-slate-800">
                {r.service.name}
                {r.grade ? ` — ${r.grade}` : ""}
                {r.city ? ` — ${r.city}` : ""}
              </p>
              {r.tutorGender && (
                <p className="mt-1 text-sm font-medium text-brand-700">
                  Wants a {r.tutorGender.toLowerCase()} teacher
                </p>
              )}
              {r.details && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
                  {r.details}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {r.urgent && (
                  <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                    Urgent
                  </span>
                )}
                <span className="rounded-lg bg-slate-100 p-1.5 text-slate-500">
                  <Phone size={13} />
                </span>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-sm text-slate-500">
                <FileText size={15} />
                {r.quotes.length === 0
                  ? "Be the first to quote"
                  : `${r.quotes.length} quote${r.quotes.length > 1 ? "s" : ""} received`}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
