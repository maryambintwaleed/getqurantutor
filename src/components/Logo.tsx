import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
        <BookOpen size={20} />
      </span>
      <span className={`text-xl font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        Get<span className="text-accent-500">Quran</span>Tutor
      </span>
    </Link>
  );
}
