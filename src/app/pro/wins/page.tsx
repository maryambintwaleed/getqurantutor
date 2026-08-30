import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";

export default async function WinsPage() {
  const user = await getCurrentUser();
  const profile = user!.tutorProfile!;
  if (profile.status !== "APPROVED") redirect("/pro/verification");

  const wins = await db.quote.findMany({
    where: { tutorId: profile.id, status: "WON" },
    include: { request: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">My Wins</h1>

      {wins.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <Trophy size={30} />
          </span>
          <h2 className="mt-5 text-lg font-bold text-slate-900">No wins yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            The jobs you win will appear here. Start by sending quotes to the opportunities that
            fit you best!
          </p>
          <Link
            href="/pro/opportunities"
            className="mt-6 inline-block rounded-full bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600"
          >
            Go to opportunities
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {wins.map((quote) => (
            <div key={quote.id} className="rounded-2xl border border-green-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-green-500" />
                  <span className="font-bold text-slate-900">{quote.request.parentName}</span>
                </div>
                <span className="text-sm text-slate-400">{timeAgo(quote.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {quote.request.service.name}
                {quote.request.city ? ` — ${quote.request.city}` : ""} — {quote.request.mode}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Agreed price: <b>${quote.price} / session</b>
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
