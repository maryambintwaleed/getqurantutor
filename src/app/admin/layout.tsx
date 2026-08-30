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
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-100 bg-white px-3 py-5">
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
      <main className="ml-64 flex-1 bg-slate-50/60 px-8 py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
