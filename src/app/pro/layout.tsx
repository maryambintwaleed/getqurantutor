import Link from "next/link";
import { redirect } from "next/navigation";
import {
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-100 bg-white px-3 py-5">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-8 flex-1 space-y-1">
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
          <ProNavLink href="/pro/services">
            <BriefcaseBusiness size={19} />
            My Courses
          </ProNavLink>
          <ProNavLink href="/pro/profile">
            <UserCog size={19} />
            My Profile
          </ProNavLink>
          <ProNavLink href="/pro/wallet">
            <Wallet size={19} />
            Balance: {profile.balance} credits
          </ProNavLink>

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
      <main className="ml-64 flex-1 bg-slate-50/60 px-8 py-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
