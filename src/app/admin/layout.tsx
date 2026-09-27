import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Shapes,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/components/Logo";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/actions/auth";
import ProNavLink from "@/components/ProNavLink";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pendingReviews = await db.tutorProfile.count({ where: { status: "SUBMITTED" } });
  const openSupportCount = await db.supportConversation.count({ where: { status: "OPEN" } });
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Top Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="flex items-center gap-1 rounded bg-accent-50 px-1.5 py-0.5 text-[10px] font-bold text-accent-700">
            <ShieldCheck size={11} /> Admin
          </span>
        </div>
        <form action={logout}>
          <button className="text-xs font-semibold text-slate-500">Log out</button>
        </form>
      </header>

      {/* Mobile Horizontal Navigation */}
      <nav className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 text-xs md:hidden scrollbar-none">
        <Link href="/admin/overview" className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium shrink-0">Overview</Link>
        <Link href="/admin/verification" className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium shrink-0 flex items-center gap-1">
          Verification {pendingReviews > 0 && <span className="h-2 w-2 rounded-full bg-accent-500 inline-block" />}
        </Link>
        <Link href="/admin/support" className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium shrink-0 flex items-center gap-1">
          Support {openSupportCount > 0 && <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />}
        </Link>
        <Link href="/admin/tutors" className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium shrink-0">Teachers</Link>
        <Link href="/admin/parents" className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium shrink-0">Families</Link>
        <Link href="/admin/categories" className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium shrink-0">Categories</Link>
        <Link href="/admin/requests" className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium shrink-0">Requests</Link>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-slate-100 bg-white px-3 py-5">
        <div className="px-2">
          <Logo />
          <p className="mt-1 flex items-center gap-1 px-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
            <ShieldCheck size={13} /> Admin
          </p>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          <ProNavLink href="/admin/overview">
            <LayoutDashboard size={19} />
            Overview
          </ProNavLink>
          <ProNavLink href="/admin/verification" badge={pendingReviews > 0}>
            <ShieldCheck size={19} />
            Verification
          </ProNavLink>
          <ProNavLink href="/admin/support" badge={openSupportCount > 0}>
            <Inbox size={19} />
            Support Chat
          </ProNavLink>
          <ProNavLink href="/admin/tutors">
            <GraduationCap size={19} />
            Teachers
          </ProNavLink>
          <ProNavLink href="/admin/parents">
            <Users size={19} />
            Families
          </ProNavLink>
          <ProNavLink href="/admin/categories">
            <Shapes size={19} />
            Categories
          </ProNavLink>
          <ProNavLink href="/admin/requests">
            <Inbox size={19} />
            Requests
          </ProNavLink>
        </nav>
        <div className="border-t border-slate-100 px-2 pt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 font-semibold text-accent-700">
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
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 bg-slate-50/60 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
