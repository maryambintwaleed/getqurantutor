import Link from "next/link";
import { connection } from "next/server";
import {
  ClipboardList,
  MessagesSquare,
  UserCheck,
  Star,
  ShieldCheck,
  Video,
  Users,
  BadgeCheck,
  Headphones,
  ArrowRight,
  Award,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ServiceSearch from "@/components/ServiceSearch";
import RecitationPlayer from "@/components/RecitationPlayer";
import { formatZone } from "@/lib/geo";
import { db } from "@/lib/db";

export default async function Home() {
  await connection(); // render per request so admin category changes appear immediately
  const [services, verifiedTutors] = await Promise.all([
    db.service.findMany({ where: { active: true } }),
    db.tutorProfile.findMany({
      where: { status: "APPROVED" },
      include: {
        user: { select: { name: true } },
        services: { include: { service: true } },
        recitation: { select: { tutorId: true } },
      },
      orderBy: { ranking: "desc" },
      take: 6,
    }),
  ]);
  const searchServices = services.map((s) => ({
    slug: s.slug,
    name: s.name,
    emoji: s.emoji,
    description: s.description,
  }));
  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-4 py-12 sm:py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs sm:text-sm font-medium text-brand-100">
            Online Quran and Islamic studies classes for families worldwide
          </p>
          <h1 className="text-2xl sm:text-5xl font-bold leading-tight">
            Verified Quran teachers,
            <span className="text-accent-400"> matched to your family</span>
          </h1>
          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-lg text-brand-100">
            Islamic studies, Arabic and more; tell us what you need and qualified male and
            female teachers send you their plan. Free for families.
          </p>
          <div className="mt-6 sm:mt-8">
            <ServiceSearch services={searchServices} />
          </div>
          <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm text-brand-200">
            Popular: Noorani Qaida · Quran Recitation · Hifdh · Tajweed
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-100 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-2.5 text-xs sm:text-sm text-slate-600">
          <span className="flex items-center gap-1.5 sm:gap-2">
            <Users size={16} className="text-brand-600 shrink-0" /> Female teachers available for sisters &amp; children
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <ShieldCheck size={16} className="text-brand-600 shrink-0" /> Every teacher reviewed and
            voice-checked before they meet a family
          </span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <Video size={16} className="text-brand-600 shrink-0" /> Online 1-to-1, parents welcome to sit in
          </span>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-slate-900">
          What would you like to learn?
        </h2>
        <p className="mt-2 text-center text-slate-500">
          Pick a course and answer a few quick questions — it takes under 2 minutes.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/request/${s.slug}`}
              className="group rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
            >
              <div className="text-3xl">{s.emoji}</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                {s.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Verified Teachers Showcase with Audio Samples */}
      {verifiedTutors.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200/70 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                  <Headphones size={13} /> Voice-Verified Tutors
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                  Listen to Our Verified Teachers
                </h2>
                <p className="mt-1 text-sm text-slate-600 max-w-xl">
                  Every teacher has had their Tajweed and identity reviewed. Listen to their audio samples below and start with a free trial class.
                </p>
              </div>
              <Link
                href="/tutors"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 shrink-0"
              >
                Browse all teachers <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {verifiedTutors.map((t) => {
                const languages: string[] = JSON.parse(t.languages || "[]");
                const hasAudio = !!(t.recitation || t.audioType || t.audioUrl);
                const firstCourse = t.services[0]?.service;
                const requestHref = firstCourse
                  ? `/request/${firstCourse.slug}?tutor=${t.id}&teacher=${encodeURIComponent(t.user.name)}`
                  : `/request/quran-recitation?tutor=${t.id}&teacher=${encodeURIComponent(t.user.name)}`;

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
                            {(t.user.name.charAt(0) || "Q").toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-semibold text-slate-900 leading-tight">
                                {t.user.name}
                              </h3>
                              <BadgeCheck size={16} className="text-emerald-600 shrink-0" />
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {t.country || "Online"}
                              {t.timezone ? ` · ${formatZone(t.timezone)}` : ""}
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
                          <span key={lang} className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                            {lang}
                          </span>
                        ))}
                      </div>

                      {/* Bio */}
                      <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
                        {t.bio || "Certified Quran & Tajweed teacher dedicated to helping students learn with proper pronunciation, patience, and care."}
                      </p>
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
                        <span className="text-xs text-slate-500 font-medium">
                          1st class free
                        </span>
                        <Link
                          href={requestHref}
                          className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
                        >
                          Book Free Trial
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: ClipboardList,
                title: "1. Tell us what you need",
                text: "Level, goal, timings and whether you need a male or female teacher.",
              },
              {
                icon: MessagesSquare,
                title: "2. Receive teacher quotes",
                text: "Verified teachers send their plan and availability; usually within hours.",
              },
              {
                icon: UserCheck,
                title: "3. Choose your teacher",
                text: "Compare their plans and credentials — many offer a free first class — then pick the one your family likes.",
              },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <step.icon size={24} />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-1 text-accent-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={22} fill="currentColor" />
          ))}
        </div>
        <p className="mt-4 text-xl font-medium text-slate-800">
          “We wanted a female teacher for our daughter in the same time zone. Three quotes came
          the same day — she finished Qaida in four months, alhamdulillah.”
        </p>
        <p className="mt-2 text-sm font-medium text-slate-500">— Sister Fatima H., Parent</p>
      </section>

      {/* Tutor CTA */}
      <section className="bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-14 text-center text-white">
        <h2 className="text-3xl font-bold">Are you a Quran teacher?</h2>
        <p className="mx-auto mt-2 max-w-xl text-accent-100">
          Families around the world are looking for teachers like you.
          Create your free profile, keep 100% of your fees — 20 free credits included.
        </p>
        <Link
          href="/register?role=TUTOR"
          className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-accent-600 shadow-lg transition hover:bg-accent-50"
        >
          Become a teacher
        </Link>
      </section>

      <footer className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} GetQuranTutor · Connecting families with verified Quran
        teachers ·{" "}
        <a href="https://getqurantutor.com" className="text-brand-600 hover:underline">
          getqurantutor.com
        </a>
      </footer>
    </>
  );
}
