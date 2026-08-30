import { redirect } from "next/navigation";
import { FileText, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  SENT: "bg-brand-50 text-brand-700",
  WON: "bg-green-50 text-green-700",
  DECLINED: "bg-slate-100 text-slate-500",
};
const STATUS_LABELS: Record<string, string> = {
  SENT: "Sent",
  WON: "Won",
  DECLINED: "Not selected",
};

export default async function QuotesPage() {
  const user = await getCurrentUser();
  const profile = user!.tutorProfile!;
  if (profile.status !== "APPROVED") redirect("/pro/verification");

  const quotes = await db.quote.findMany({
    where: { tutorId: profile.id },
    include: { request: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">My Quotes</h1>
      <p className="mt-2 text-sm text-slate-400">
        {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
      </p>

      <div className="mt-6 space-y-4">
        {quotes.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            You haven't sent any quotes yet. Head to Opportunities to find your first student!
          </div>
        )}
        {quotes.map((quote) => (
          <div key={quote.id} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <span className="font-bold text-slate-900">{quote.request.parentName}</span>
              <span className="text-sm text-slate-400">{timeAgo(quote.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {quote.request.service.name}
              {quote.request.city ? ` — ${quote.request.city}` : ""} — {quote.request.mode}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                <FileText size={15} /> ${quote.price} / session
              </span>
              {quote.sharePhone && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Phone size={14} /> Phone number shared
                </span>
              )}
              <span
                className={`ml-auto rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[quote.status]}`}
              >
                {STATUS_LABELS[quote.status]}
              </span>
            </div>
            <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-500">
              {quote.message}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
