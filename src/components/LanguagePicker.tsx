"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { ALL_LANGUAGES, COMMON_LANGUAGES } from "@/lib/services";

/**
 * Fifty languages is too many to scan, so the twelve asked for most often are
 * shown first and the rest sit behind a toggle. Typing searches all fifty at
 * once, which is faster than hunting through either group.
 *
 * Selection is tracked here rather than left to the DOM: a checkbox filtered
 * off screen is no longer part of the form, so hiding one would silently untick
 * it. Anything selected but not currently shown is submitted through a hidden
 * input instead.
 */
export default function LanguagePicker({ selected }: { selected: string[] }) {
  const [chosen, setChosen] = useState<string[]>(selected);
  const [query, setQuery] = useState("");

  const others = useMemo(
    () => ALL_LANGUAGES.filter((l) => !COMMON_LANGUAGES.includes(l)),
    []
  );
  // Keep a saved language visible even when it lives in the collapsed group.
  const [showAll, setShowAll] = useState(() => others.some((l) => selected.includes(l)));

  const q = query.trim().toLowerCase();
  const matches = q ? ALL_LANGUAGES.filter((l) => l.toLowerCase().includes(q)) : null;

  const visible = matches ?? (showAll ? ALL_LANGUAGES : COMMON_LANGUAGES);
  const hiddenButChosen = chosen.filter((l) => !visible.includes(l));

  const toggle = (lang: string) =>
    setChosen((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );

  const grid = (languages: string[]) => (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {languages.map((lang) => (
        <label
          key={lang}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm hover:border-brand-400"
        >
          <input
            type="checkbox"
            name="languages"
            value={lang}
            checked={chosen.includes(lang)}
            onChange={() => toggle(lang)}
            className="h-4 w-4 accent-brand-600"
          />
          {lang}
        </label>
      ))}
    </div>
  );

  return (
    <>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
        <Search size={15} className="shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search languages"
          aria-label="Search languages"
          className="w-full bg-transparent text-sm outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="shrink-0 text-xs font-semibold text-slate-400 hover:text-slate-700"
          >
            Clear
          </button>
        )}
      </div>

      {matches ? (
        matches.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No language matches “{query}”.
          </p>
        ) : (
          grid(matches)
        )
      ) : (
        <>
          {grid(COMMON_LANGUAGES)}
          {showAll && grid(others)}
          {/* The button stays put whether the list is open or closed, so it can
              always be closed again. */}
          <button
            type="button"
            onClick={() => setShowAll((open) => !open)}
            aria-expanded={showAll}
            className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
          >
            {showAll ? "Show fewer languages" : `More languages (${others.length})`}
            <ChevronDown size={15} className={showAll ? "rotate-180" : ""} />
          </button>
        </>
      )}

      {hiddenButChosen.map((lang) => (
        <input key={lang} type="hidden" name="languages" value={lang} />
      ))}

      {chosen.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          Selected: {chosen.join(", ")}
        </p>
      )}
    </>
  );
}
