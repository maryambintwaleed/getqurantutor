import Link from "next/link";

/**
 * The mark is an open mushaf resting on a rihal. It is drawn inline rather
 * than loaded as an image so it stays crisp at any size and matches the
 * favicon in src/app/icon.svg exactly — the two must never drift apart.
 */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#047857" />
      <path
        d="M32 18C25.4 13.4 17.4 11.9 9.5 13.6V36.4C17.4 34.7 25.4 36.2 32 40.8V18Z"
        fill="#FFFFFF"
      />
      <path
        d="M32 18C38.6 13.4 46.6 11.9 54.5 13.6V36.4C46.6 34.7 38.6 36.2 32 40.8V18Z"
        fill="#A7F3D0"
      />
      <path
        d="M13 46.5L32 52.5L51 46.5"
        stroke="#F59E0B"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LogoMark />
      <span
        className={`text-xl font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`}
      >
        Get<span className="text-accent-500">Quran</span>Tutor
      </span>
    </Link>
  );
}
