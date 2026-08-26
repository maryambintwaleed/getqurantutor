"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProNavLink({
  href,
  badge = false,
  children,
}: {
  href: string;
  badge?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-brand-50 text-brand-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {children}
      {badge && (
        <span className="absolute left-6 top-1.5 h-2 w-2 rounded-full bg-red-500" />
      )}
    </Link>
  );
}
