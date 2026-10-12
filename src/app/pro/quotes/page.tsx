import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import EditableQuoteCard from "@/components/EditableQuoteCard";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Quotes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {quotes.length} {quotes.length === 1 ? "quote" : "quotes"} sent · Wallet balance:{" "}
            <strong className="text-brand-700">{profile.balance} credits</strong>
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {quotes.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            You haven&apos;t sent any quotes yet. Head to Opportunities to find your first student!
          </div>
        )}
        {quotes.map((quote) => (
          <EditableQuoteCard
            key={quote.id}
            quote={quote}
            tutorBalance={profile.balance}
          />
        ))}
      </div>
    </>
  );
}
