import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Monitor, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { QUOTE_FEE } from "@/lib/services";
import QuoteForm from "@/components/QuoteForm";

export default async function OpportunityDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const profile = user!.tutorProfile!;

  const request = await db.request.findUnique({
    where: { id },
    include: { service: true, quotes: true },
  });
  if (!request) notFound();

  const answers: { question: string; answer: string }[] = JSON.parse(request.answers);
  const alreadyQuoted = request.quotes.some((quote) => quote.tutorId === profile.id);

  return (
    <>
      <Link
        href="/pro/opportunities"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700"
      >
        <ChevronLeft size={16} /> Back to opportunities
      </Link>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-lg font-bold text-slate-900">{request.parentName}</span>
              {request.urgent && (
                <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  Urgent
                </span>
              )}
            </div>
            <p className="mt-1 font-semibold text-slate-700">{request.service.name}</p>
          </div>
          <span className="flex items-center gap-1 text-sm text-slate-400">
            <Clock size={14} /> {timeAgo(request.createdAt)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            {request.mode === "Online" ? <Monitor size={15} /> : <MapPin size={15} />}
            {request.mode}
          </span>
          {request.city && (
            <span className="flex items-center gap-1.5">
              <MapPin size={15} /> {request.city}
            </span>
          )}
          {request.tutorGender && (
            <span className="font-semibold text-brand-700">
              Wants a {request.tutorGender.toLowerCase()} teacher
            </span>
          )}
        </div>

        {request.details && (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {request.details}
          </p>
        )}

        <dl className="mt-5 space-y-3">
          {answers.map((a) => (
            <div key={a.question} className="grid gap-1 sm:grid-cols-2 sm:gap-4">
              <dt className="text-sm text-slate-500">{a.question}</dt>
              <dd className="text-sm font-medium text-slate-900">{a.answer}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        {request.status !== "OPEN" ? (
          <p className="text-center text-slate-500">This opportunity is closed.</p>
        ) : alreadyQuoted ? (
          <p className="text-center text-slate-500">
            You already sent a quote for this opportunity.{" "}
            <Link href="/pro/quotes" className="font-semibold text-brand-600 hover:underline">
              View my quotes
            </Link>
          </p>
        ) : (
          <>
            <h2 className="text-lg font-bold text-slate-900">Send your quote</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sending a quote costs <b>{QUOTE_FEE} credits</b>. Your balance:{" "}
              <b>{profile.balance} credits</b>. You keep 100% of your class fees.
            </p>
            <QuoteForm requestId={request.id} />
          </>
        )}
      </div>
    </>
  );
}
