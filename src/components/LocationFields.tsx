"use client";

import { useState } from "react";
import {
  COMMON_COUNTRIES,
  COUNTRIES,
  COUNTRY_DEFAULT_ZONE,
  TIME_ZONES,
  formatZone,
} from "@/lib/geo";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500";

export default function LocationFields({
  country: initialCountry,
  timezone: initialZone,
}: {
  country: string;
  timezone: string;
}) {
  const [country, setCountry] = useState(initialCountry);
  const [zone, setZone] = useState(initialZone);

  // Anything saved before these lists existed ("pak", "GMT+5") would silently
  // vanish from a plain <select>, so keep it as an option until it is changed.
  const strayCountry = country && !COUNTRIES.includes(country) ? country : null;
  const strayZone = zone && !TIME_ZONES.some((z) => z.id === zone) ? zone : null;

  const rest = COUNTRIES.filter((c) => !COMMON_COUNTRIES.includes(c));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Country</span>
        <select
          name="country"
          value={country}
          onChange={(e) => {
            const next = e.target.value;
            setCountry(next);
            // Save a teacher the second lookup when the answer is obvious.
            const guess = COUNTRY_DEFAULT_ZONE[next];
            if (guess && !zone) setZone(guess);
          }}
          className={selectClass}
        >
          <option value="">Select your country</option>
          {strayCountry && <option value={strayCountry}>{strayCountry}</option>}
          <optgroup label="Most common">
            {COMMON_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
          <optgroup label="All countries">
            {rest.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </optgroup>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Time zone</span>
        <select
          name="timezone"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className={selectClass}
        >
          <option value="">Select your time zone</option>
          {strayZone && <option value={strayZone}>{strayZone}</option>}
          {TIME_ZONES.map((z) => (
            <option key={z.id} value={z.id}>
              {z.label} — {formatZone(z.id)}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-slate-400">
          Families see this so they know which hours you keep.
        </span>
      </label>
    </div>
  );
}
