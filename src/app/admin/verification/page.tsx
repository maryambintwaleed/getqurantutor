import { BadgeCheck, Clock, FileText, ShieldCheck, Mail, CheckCircle2, Send } from "lucide-react";
import { db } from "@/lib/db";
import { reviewTutor } from "@/actions/verification";
import { sendVerificationReminders } from "@/actions/admin";
import { timeAgo } from "@/lib/format";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminVerification({
  searchParams,
}: {
  searchParams: Promise<{ reminded?: string }>;
}) {
  const { reminded } = (await searchParams) || {};
  const [waiting, decided, unverifiedCount] = await Promise.all([
    db.tutorProfile.findMany({
      where: { status: "SUBMITTED" },
      include: { user: true, services: { include: { service: true } } },
      orderBy: { submittedAt: "asc" }, // oldest first — nobody waits forever
    }),
    db.tutorProfile.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { user: true },
      orderBy: { reviewedAt: "desc" },
      take: 10,
    }),
    db.tutorProfile.count({
      where: { status: { in: ["PENDING", "REJECTED"] } },
    }),
  ]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Verification</h1>
          <p className="mt-1 text-slate-500 text-sm">
            Listen to the recitation, check the ID name matches, and confirm the voice matches the
            gender on their profile. Approving deletes their ID document.
          </p>
        </div>
      </div>

      {reminded && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          Successfully sent verification reminder emails to {reminded} unverified teacher(s)!
        </div>
      )}

      {/* Broadcast Reminder to Unverified Teachers */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-base">
            <Mail size={18} className="text-brand-600" />
            Unverified Teachers ({unverifiedCount})
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Send an email reminder to all registered teachers who haven&apos;t completed their Quran recitation and ID application.
          </p>
        </div>
        <form action={sendVerificationReminders}>
          <SubmitButton className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition disabled:opacity-50 shrink-0">
            <Send size={15} />
            Email {unverifiedCount} Unverified Teachers
          </SubmitButton>
        </form>
      </div>

      <h2 className="mt-8 flex items-center gap-2 text-lg font-bold text-slate-900">
        <Clock size={18} className="text-accent-600" />
        Waiting for review ({waiting.length})
      </h2>

      {waiting.length === 0 && (
        <p className="mt-3 rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
          Nothing waiting. New teachers appear here as soon as they submit.
        </p>
      )}

      <div className="mt-3 space-y-4">
        {waiting.map((t) => {
          const languages: string[] = JSON.parse(t.languages || "[]");
          return (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{t.user.name}</p>
                  <p className="text-sm text-slate-500">
                    {t.user.email} · submitted {t.submittedAt ? timeAgo(t.submittedAt) : "—"}
                  </p>
                  <p className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                      Claims: {t.gender || "gender not set"}
                    </span>
                    {t.country && (
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
                        {t.country}
                      </span>
                    )}
                    {t.ijazah && (
                      <span className="rounded-lg bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">
                        Claims ijazah
                      </span>
                    )}
                    {t.hafiz && (
                      <span className="rounded-lg bg-accent-50 px-2 py-0.5 font-semibold text-accent-700">
                        Claims {t.gender === "Female" ? "hafiza" : "hafiz"}
                      </span>
                    )}
                    {languages.map((l) => (
                      <span key={l} className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">
                        {l}
                      </span>
                    ))}
                  </p>
                </div>
                {t.idDocData ? (
                  <a
                    href={`/admin/verification/id/${t.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700"
                  >
                    <FileText size={15} /> View ID
                  </a>
                ) : (
                  <span className="text-sm text-amber-700">No ID uploaded</span>
                )}
              </div>

              {t.bio && <p className="mt-3 text-sm text-slate-600">{t.bio}</p>}

              {t.audioType || t.audioUrl ? (
                <audio
                  controls
                  preload="none"
                  src={t.audioUrl || `/admin/verification/audio/${t.id}`}
                  className="mt-4 w-full"
                />
              ) : (
                <p className="mt-4 text-sm text-amber-700">No recitation uploaded.</p>
              )}

              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <form action={reviewTutor} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="tutorId" value={t.id} />
                  <input
                    name="note"
                    placeholder="Message to the teacher (optional for approval, needed if rejecting)"
                    className="min-w-56 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                  />
                  <button
                    name="decision"
                    value="approve"
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <BadgeCheck size={15} /> Approve
                  </button>
                  <button
                    name="decision"
                    value="reject"
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 flex items-center gap-2 text-lg font-bold text-slate-900">
        <ShieldCheck size={18} className="text-slate-400" /> Recently decided
      </h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {decided.length === 0 && (
          <p className="px-6 py-6 text-center text-sm text-slate-500">Nothing reviewed yet.</p>
        )}
        {decided.map((t, i) => (
          <div
            key={t.id}
            className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 ${
              i > 0 ? "border-t border-slate-100" : ""
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{t.user.name}</p>
              <p className="text-xs text-slate-500">
                {t.reviewedAt ? timeAgo(t.reviewedAt) : "—"}
                {t.reviewNote ? ` · “${t.reviewNote}”` : ""}
              </p>
            </div>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                t.status === "APPROVED"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {t.status}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
