"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export type SearchService = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
};

export default function ServiceSearch({ services }: { services: SearchService[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [query, services]);

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="flex overflow-hidden rounded-2xl bg-white shadow-xl shadow-brand-900/20">
        <div className="flex items-center pl-4 text-slate-400">
          <Search size={20} />
        </div>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="What does your child need help with?"
          className="w-full px-3 py-4 text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          onClick={() => matches[0] && router.push(`/request/${matches[0].slug}`)}
          className="bg-accent-500 px-6 font-semibold text-white transition hover:bg-accent-600"
        >
          Search
        </button>
      </div>
      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-white text-left shadow-xl">
          {matches.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">
              No match — try “reading”, “phonics”, “English”…
            </div>
          )}
          {matches.map((s) => (
            <button
              key={s.slug}
              onMouseDown={() => router.push(`/request/${s.slug}`)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50"
            >
              <span className="text-xl">{s.emoji}</span>
              <span>
                <span className="block font-medium text-slate-900">{s.name}</span>
                <span className="block truncate text-xs text-slate-500">{s.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
