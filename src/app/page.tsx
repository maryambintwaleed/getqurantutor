import Link from "next/link";
import { connection } from "next/server";
import { ClipboardList, MessagesSquare, UserCheck, Star, ShieldCheck, Video, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import ServiceSearch from "@/components/ServiceSearch";
import { db } from "@/lib/db";

export default async function Home() {
  await connection(); // render per request so admin category changes appear immediately
  const services = await db.service.findMany({ where: { active: true } });
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
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-brand-100">
            Online Quran and Islamic studies classes for families worldwide
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Verified Quran teachers,
            <span className="text-accent-400"> matched to your family</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Islamic studies, Arabic and more; tell us what you need and qualified male and
            female teachers send you their plan. Free for families.
          </p>
          <div className="mt-8">
            <ServiceSearch services={searchServices} />
          </div>
          <p className="mt-4 text-sm text-brand-200">
            Popular: Noorani Qaida · Quran Recitation · Hifdh · Tajweed
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-100 bg-white px-4 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-slate-600">
          <span className="flex items-center gap-2">
            <Users size={17} className="text-brand-600" /> Female teachers available for sisters &amp; children
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-brand-600" /> Every teacher reviewed and
            voice-checked before they meet a family
          </span>
          <span className="flex items-center gap-2">
            <Video size={17} className="text-brand-600" /> Online 1-to-1, parents welcome to sit in
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
                text: "Verified teachers send their plan and availability — usually within hours.",
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
        <p className="mt-2 text-sm text-slate-500">— Parent</p>
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
