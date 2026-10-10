import Link from "next/link";
import { connection } from "next/server";
import {
  Headphones,
  Users,
  Video,
  ShieldCheck,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import TeacherCard from "@/components/TeacherCard";
import { db } from "@/lib/db";

export const metadata = {
  title: "Verified Quran Teachers | GetQuranTutor",
  description:
    "Listen to recitations from verified female and male Quran teachers with certified Ijazah and Hafiz qualifications.",
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
            Listen to recitation samples, check qualifications, and find qualified male and
            female teachers.
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
            {tutors.map((t) => (
              <TeacherCard key={t.id} teacher={t} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} GetQuranTutor · Connecting families with verified Quran teachers
      </footer>
    </>
  );
}
