import Link from "next/link";
import Logo from "./Logo";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/actions/auth";

export default async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              {user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600"
                >
                  Admin dashboard
                </Link>
              ) : user.role === "TUTOR" ? (
                <Link
                  href="/pro/opportunities"
                  className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Teacher dashboard
                </Link>
              ) : (
                <Link
                  href="/requests"
                  className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  My requests
                </Link>
              )}
              <span className="hidden text-sm text-slate-500 sm:inline">{user.name}</span>
              <form action={logout}>
                <button className="text-sm font-medium text-slate-500 hover:text-slate-900">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/register?role=TUTOR"
                className="hidden text-sm font-semibold text-slate-600 hover:text-brand-700 sm:inline"
              >
                Become a teacher
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-600 hover:text-brand-700"
              >
                Log in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
