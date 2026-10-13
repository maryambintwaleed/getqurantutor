import Link from "next/link";
import Logo from "./Logo";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Mission */}
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-slate-600 leading-relaxed">
              Connecting Muslim families worldwide with verified, background-checked Quran and
              Islamic studies teachers. Personalized 1-to-1 online lessons for children and adults.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-brand-600 transition">
                  Find a Teacher
                </Link>
              </li>
              <li>
                <Link
                  href="/register?role=TUTOR"
                  className="hover:text-brand-600 transition"
                >
                  Become a Teacher
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-600 transition">
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Legal & Support
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/terms" className="hover:text-brand-600 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@getqurantutor.com"
                  className="hover:text-brand-600 transition"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {currentYear} GetQuranTutor. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-700 transition">
              Terms
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/privacy" className="hover:text-slate-700 transition">
              Privacy
            </Link>
            <span className="text-slate-300">·</span>
            <a
              href="https://getqurantutor.com"
              className="text-brand-600 hover:underline"
            >
              getqurantutor.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
