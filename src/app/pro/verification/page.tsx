import Link from "next/link";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import VerificationForm from "@/components/VerificationForm";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;
  const user = await getCurrentUser();
  const profile = user!.tutorProfile!;

  if (profile.status === "APPROVED") {
    return (
      <>
        <h1 className="text-3xl font-bold text-slate-900">You are verified</h1>
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
          <p className="flex items-center gap-2 font-semibold text-green-800">
            <CheckCircle2 size={19} /> Your teaching profile has been approved
          </p>
          {profile.reviewNote && (
            <p className="mt-2 text-sm text-green-900">{profile.reviewNote}</p>
          )}
          <Link
            href="/pro/opportunities"
            className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
          >
            See family requests
          </Link>
        </div>
      </>
    );
  }

  const waiting = profile.status === "SUBMITTED";
  const rejected = profile.status === "REJECTED";

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Get verified</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Families trust us with their children, so we check every teacher before showing them any
        requests. Two things are needed, and review usually takes less than a day.
      </p>

      {waiting && (
        <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <p className="flex items-center gap-2 font-semibold text-brand-800">
            <Clock size={19} /> {submitted ? "Sent for review" : "We are reviewing your details"}
          </p>
          <p className="mt-2 text-sm text-brand-900">
            You will get an email as soon as this is done. You can still set up your courses and
            profile in the meantime — nothing is lost.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/pro/profile"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Finish my profile
            </Link>
            <Link
              href="/pro/services"
              className="rounded-full border border-brand-300 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-white"
            >
              Choose my courses
            </Link>
          </div>
        </div>
      )}

      {rejected && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <p className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertTriangle size={19} /> We could not verify you yet
          </p>
          <p className="mt-2 text-sm text-amber-900">
            {profile.reviewNote || "We could not confirm your details from what was sent."}
          </p>
          <p className="mt-2 text-sm text-amber-900">
            Upload again below and we will take another look.
          </p>
        </div>
      )}

      {!waiting && (
        <div className="mt-6">
          <VerificationForm
            hasAudio={Boolean(profile.audioType || profile.audioUrl)}
            hasDoc={Boolean(profile.idDocData)}
            rejected={rejected}
          />
        </div>
      )}
    </>
  );
}
