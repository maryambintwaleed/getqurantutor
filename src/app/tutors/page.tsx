import Link from "next/link";
import { connection } from "next/server";
import {
  BadgeCheck,
  Headphones,
  Award,
  Users,
  Video,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import RecitationPlayer from "@/components/RecitationPlayer";
import { db } from "@/lib/db";

export const metadata = {
  title: "Verified Quran Teachers | GetQuranTutor",
  description:
    "Listen to recitations from verified female and male Quran teachers with certified Ijazah and Hafiz qualifications. Book your free trial class today.",
};

export default async function TutorsDirectory({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; ijazah?: string }>;
}) {
  await connection();
  const { gender, ijazah } = (await searchParams) || {};

  const whereClause: any = {
    status: "APPROVED",
  };

  if (gender === "Female") {
    whereClause.gender = "Female";
  } else if (gender === "Male") {
    whereClause.gender = "Male";
  }

  if (ijazah === "1") {
    whereClause.ijazah = true;
  }

  const tutors = await db.tutorProfile.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true } },
      services: { include: { service: true } },
      recitation: { select: { tutorId: true } },
    },
    orderBy: { ranking: "desc" },
  });

  return (
    <>
      <SiteHeader />

      {/* Header */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 px-4 py-12 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs sm:text-sm font-medium text-brand-100">
            <Headphones size={14} /> Voice-verified Quran teachers
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Meet Our Quran Teachers
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-brand-100">
            Listen to recitation samples, check qualifications, and choose the ideal
            teacher for your child or yourself. Every first class is free.
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-slate-100 bg-white px-4 py-3.5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs sm:text-sm text-slate-600">
          <span className="flex items-center gap-1.5">
            <Users size={15} className="text-brand-600 shrink-0" /> Dedicated female teachers for sisters &amp; children
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-brand-600 shrink-0" /> Voice &amp; Tajweed verified
          </span>
          <span className="flex items-center gap-1.5">
            <Video size={15} className="text-brand-600 shrink-0" /> 1-on-1 online classes
          </span>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Filter:
            </span>
            <Link
              href="/tutors"
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                !gender && !ijazah
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Teachers
            </Link>
            <Link
              href="/tutors?gender=Female"
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                gender === "Female"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700"
              }`}
            >
              Female Teachers Only
            </Link>
            <Link
              href="/tutors?gender=Male"
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                gender === "Male"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Male Teachers
            </Link>
            <Link
              href="/tutors?ijazah=1"
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                ijazah === "1"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              Certified Ijazah Only
            </Link>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Showing {tutors.length} verified teacher{tutors.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Teachers Grid */}
        {tutors.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-slate-800">
              No teachers found matching this filter.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try selecting &quot;All Teachers&quot; or request a customized match.
            </p>
            <Link
              href="/tutors"
              className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tutors.map((t) => {
              const languages: string[] = JSON.parse(t.languages || "[]");
              const hasAudio = !!(t.recitation || t.audioType || t.audioUrl);
              const firstCourse = t.services[0]?.service;

              return (
                <div
                  key={t.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-base ${
                            t.gender === "Female"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-brand-100 text-brand-700"
                          }`}
                        >
                          {t.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h2 className="font-semibold text-slate-900 leading-tight">
                              {t.user.name}
                            </h2>
                            <BadgeCheck size={16} className="text-emerald-600 shrink-0" />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {t.country || "Online"} {t.timezone ? `(${t.timezone})` : ""}
                          </p>
                        </div>
                      </div>

                      {t.gender && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${
                            t.gender === "Female"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {t.gender === "Female" ? "Sister / Female" : "Male"}
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                      {t.ijazah && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800 border border-amber-200">
                          <Award size={12} /> Certified Ijazah
                        </span>
                      )}
                      {t.hafiz && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 font-medium text-brand-700 border border-brand-200">
                          {t.gender === "Female" ? "Hafiza" : "Hafiz"}
                        </span>
                      )}
                      {languages.slice(0, 3).map((lang) => (
                        <span
                          key={lang}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>

                    {/* Bio */}
                    {t.bio && (
                      <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-3">
                        {t.bio}
                      </p>
                    )}

                    {/* Courses */}
                    {t.services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {t.services.map((ts) => (
                          <span
                            key={ts.id}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                          >
                            {ts.service.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    {/* Audio Recitation Player */}
                    <div className="mt-4">
                      {hasAudio ? (
                        <RecitationPlayer
                          tutorId={t.id}
                          audioUrl={t.audioUrl || undefined}
                          tutorName={t.user.name}
                        />
                      ) : (
                        <div className="rounded-xl bg-slate-50 p-2.5 text-center text-xs text-slate-400">
                          Recitation available on profile
                        </div>
                      )}
                    </div>

                    {/* Call to action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <Sparkles size={13} /> 1st class free
                      </span>
                      <Link
                        href={firstCourse ? `/request/${firstCourse.slug}` : "/request/quran-recitation"}
                        className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 shadow-sm"
                      >
                        Book Free Trial
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} GetQuranTutor · Connecting families with verified Quran teachers
      </footer>
    </>
  );
}
