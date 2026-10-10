import Link from "next/link";
import { CheckCircle2, Headphones } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import TeacherCard from "@/components/TeacherCard";
import { db } from "@/lib/db";

export default async function RequestReceived() {
  const verifiedTutors = await db.tutorProfile.findMany({
    where: { status: "APPROVED" },
    include: {
      user: { select: { name: true } },
      services: { include: { service: true } },
      recitation: { select: { tutorId: true } },
    },
    orderBy: { ranking: "desc" },
    take: 6,
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-12">
        <div className="max-w-xl text-center">
          <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
          <h1 className="mt-5 text-3xl font-bold text-slate-900">Request received!</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Teachers who match your level, timings and gender preference have been notified,
            and we will email you as soon as quotes arrive — usually within a few hours. Create a
            free account to compare their quotes side by side.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm"
            >
              Create account
            </Link>
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-600"
            >
              Back home
            </Link>
          </div>
        </div>

        {/* Teacher Cards: Only visible after someone puts request, without Book Free Trial */}
        {verifiedTutors.length > 0 && (
          <div className="mt-16 w-full border-t border-slate-200 pt-12">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                <Headphones size={13} /> Voice-Verified Tutors
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Listen to Recitations While You Wait
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Here are some verified teachers from our community. Listen to their recitations and Tajweed while quotes are prepared for your request.
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {verifiedTutors.map((t) => (
                <TeacherCard key={t.id} teacher={t} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
