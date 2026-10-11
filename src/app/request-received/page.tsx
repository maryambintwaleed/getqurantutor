import Link from "next/link";
import { CheckCircle2, Headphones } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import TeacherCard from "@/components/TeacherCard";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getLatestPendingRequestId } from "@/lib/pending";

export default async function RequestReceived({
  searchParams,
}: {
  searchParams?: Promise<{ gender?: string }>;
}) {
  const user = await getCurrentUser();
  const { gender: queryGender } = (await searchParams) || {};

  let preferredGender =
    queryGender === "Female" || queryGender === "Male" ? queryGender : "";

  // If gender was not passed in query params:
  if (!preferredGender) {
    if (user) {
      const latestReq = await db.request.findFirst({
        where: { parentId: user.id },
        orderBy: { createdAt: "desc" },
        select: { tutorGender: true },
      });
      if (latestReq?.tutorGender === "Female" || latestReq?.tutorGender === "Male") {
        preferredGender = latestReq.tutorGender;
      }
    } else {
      const pendingId = await getLatestPendingRequestId();
      if (pendingId) {
        const pendingReq = await db.request.findUnique({
          where: { id: pendingId },
          select: { tutorGender: true },
        });
        if (pendingReq?.tutorGender === "Female" || pendingReq?.tutorGender === "Male") {
          preferredGender = pendingReq.tutorGender;
        }
      }
    }
  }

  // Filter tutors based on family's gender preference:
  // - Female -> only female teachers
  // - Male -> only male teachers
  // - No preference -> both female and male teachers
  const tutorWhere: any = {
    status: "APPROVED",
  };
  if (preferredGender) {
    tutorWhere.gender = preferredGender;
  }

  const verifiedTutors = await db.tutorProfile.findMany({
    where: tutorWhere,
    include: {
      user: { select: { name: true } },
      services: { include: { service: true } },
      recitation: { select: { tutorId: true } },
    },
    orderBy: { ranking: "desc" },
    take: 6,
  });

  const headingText =
    preferredGender === "Female"
      ? "Listen to Verified Female Teachers"
      : preferredGender === "Male"
        ? "Listen to Verified Male Teachers"
        : "Listen to Recitations While You Wait";

  const badgeText =
    preferredGender === "Female"
      ? "Voice-Verified Female Tutors"
      : preferredGender === "Male"
        ? "Voice-Verified Male Tutors"
        : "Voice-Verified Tutors";

  const descText = preferredGender
    ? `Here are verified ${preferredGender.toLowerCase()} teachers from our community matching your request. Listen to their recitations and Tajweed while quotes are prepared.`
    : "Here are verified teachers from our community. Listen to their recitations and Tajweed while quotes are prepared for your request.";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 py-12">
        <div className="max-w-xl text-center">
          <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
          <h1 className="mt-5 text-3xl font-bold text-slate-900">Request received!</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {user
              ? "Teachers who match your level, timings and gender preference have been notified, and we will email you as soon as quotes arrive — usually within a few hours. You can view your requests and quotes on your dashboard."
              : "Teachers who match your level, timings and gender preference have been notified, and we will email you as soon as quotes arrive — usually within a few hours. Create a free account to compare their quotes side by side."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {user ? (
              <Link
                href="/requests"
                className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm"
              >
                Go to my requests
              </Link>
            ) : (
              <Link
                href="/register"
                className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm"
              >
                Create account
              </Link>
            )}
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-600"
            >
              Back home
            </Link>
          </div>
        </div>

        {/* Teacher Cards: Gender-related, visible only after putting request, without Book Free Trial */}
        {verifiedTutors.length > 0 && (
          <div className="mt-16 w-full border-t border-slate-200 pt-12">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                <Headphones size={13} /> {badgeText}
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {headingText}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {descText}
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
