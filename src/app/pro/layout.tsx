import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  UserCog,
  Inbox,
  FileText,
  Trophy,
  BriefcaseBusiness,
  Wallet,
  Star,
  Info,
} from "lucide-react";
import Logo from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "@/actions/auth";
import { gradeWhere, genderWhere } from "@/lib/matching";
import ProNavLink from "@/components/ProNavLink";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/pro/opportunities");
  if (user.role !== "TUTOR" || !user.tutorProfile) redirect("/");

  const profile = user.tutorProfile;

  // Family requests contain children's details — nobody sees them until an
  // admin has checked who the teacher is.
  const approved = profile.status === "APPROVED";

  const serviceIds = (
    await db.tutorService.findMany({ where: { tutorId: profile.id } })
  ).map((ts) => ts.serviceId);

  const openCount = await db.request.count({
    where: {
      status: "OPEN",
      serviceId: { in: serviceIds },
      quotes: { none: { tutorId: profile.id } },
      AND: [gradeWhere(profile.grades), genderWhere(profile.gender)],
    },
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Top Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
            {user.name.charAt(0)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {approved && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
              {profile.balance} cr
            </span>
          )}
          <form action={logout}>
            <button className="font-semibold text-slate-500 hover:text-slate-900">Log out</button>
          </form>
        </div>
      </header>

      {/* Mobile Horizontal Navigation */}
      <nav className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 text-xs md:hidden scrollbar-none">
        {approved ? (
          <>
            <Link
              href="/pro/opportunities"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium shrink-0 whitespace-nowrap"
            >
              <Inbox size={15} />
              Opportunities
              {openCount > 0 && <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />}
            </Link>
            <Link
              href="/pro/quotes"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium shrink-0 whitespace-nowrap"
            >
              <FileText size={15} />
              Quotes
            </Link>
            <Link
              href="/pro/wins"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium shrink-0 whitespace-nowrap"
            >
              <Trophy size={15} />
              Wins
            </Link>
          </>
        ) : (
          <Link
            href="/pro/verification"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-50 text-accent-700 font-medium shrink-0 whitespace-nowrap"
          >
            <ShieldCheck size={15} />
            Get verified
          </Link>
        )}
        <Link
          href="/pro/services"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 font-semibold shrink-0 whitespace-nowrap"
        >
          <BriefcaseBusiness size={15} />
          My Courses
        </Link>
        <Link
          href="/pro/profile"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium shrink-0 whitespace-nowrap"
        >
          <UserCog size={15} />
          Profile
        </Link>
        {approved && (
          <Link
            href="/pro/wallet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium shrink-0 whitespace-nowrap"
          >
            <Wallet size={15} />
            Wallet
          </Link>
        )}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-slate-100 bg-white px-3 py-5">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-8 flex-1 space-y-1">
          {approved ? (
            <>
              <ProNavLink href="/pro/opportunities" badge={openCount > 0}>
                <Inbox size={19} />
                Opportunities
              </ProNavLink>
              <ProNavLink href="/pro/quotes">
                <FileText size={19} />
                My Quotes
              </ProNavLink>
              <ProNavLink href="/pro/wins">
                <Trophy size={19} />
                My Wins
              </ProNavLink>
            </>
          ) : (
            <ProNavLink href="/pro/verification">
              <ShieldCheck size={19} />
              Get verified
            </ProNavLink>
          )}
          <ProNavLink href="/pro/services">
            <BriefcaseBusiness size={19} />
            My Courses
          </ProNavLink>
          <ProNavLink href="/pro/profile">
            <UserCog size={19} />
            My Profile
          </ProNavLink>
          {approved && (
            <ProNavLink href="/pro/wallet">
              <Wallet size={19} />
              Balance: {profile.balance} credits
            </ProNavLink>
          )}

          <div className="!mt-6 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600">
              <Star size={18} className="text-accent-500" />
              My ranking: {profile.ranking}
              <Info size={14} className="text-slate-300" />
            </div>
          </div>
        </nav>

        <div className="border-t border-slate-100 px-2 pt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {user.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <form action={logout}>
                <button className="text-xs text-slate-400 hover:text-slate-700">Log out</button>
              </form>
            </div>
          </div>
          <Link
            href="/"
            className="mt-3 block text-center text-xs text-slate-400 hover:text-brand-600"
          >
            ← Back to main site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 md:ml-64 bg-slate-50/60 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <div className="mx-auto max-w-3xl w-full">{children}</div>
      </main>
    </div>
  );
}
