"use client";

import { useState } from "react";
import {
  COMMON_COUNTRIES,
  COUNTRIES,
  COUNTRY_DEFAULT_ZONE,
  TIME_ZONES,
  formatZone,
} from "@/lib/geo";
import SearchableSelect, { type SelectOption } from "./SearchableSelect";

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
  // vanish from a plain list, so keep it as an option until it is changed.
  const strayCountry = country && !COUNTRIES.includes(country) ? country : null;
  const strayZone = zone && !TIME_ZONES.some((z) => z.id === zone) ? zone : null;

  const countryOptions: SelectOption[] = [
    ...(strayCountry ? [{ value: strayCountry, label: strayCountry }] : []),
    // Common countries first, so the usual answer is one keystroke away.
    ...COMMON_COUNTRIES.map((c) => ({ value: c, label: c })),
    ...COUNTRIES.filter((c) => !COMMON_COUNTRIES.includes(c)).map((c) => ({
      value: c,
      label: c,
    })),
  ];

  const zoneOptions: SelectOption[] = [
    ...(strayZone ? [{ value: strayZone, label: strayZone }] : []),
    ...TIME_ZONES.map((z) => ({ value: z.id, label: `${z.label} — ${formatZone(z.id)}` })),
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Country</span>
        <SearchableSelect
          name="country"
          ariaLabel="Country"
          placeholder="Type to search countries"
          value={country}
          onChange={(next) => {
            setCountry(next);
            // Save a teacher the second lookup when the answer is obvious.
            const guess = COUNTRY_DEFAULT_ZONE[next];
            if (guess && !zone) setZone(guess);
          }}
          options={countryOptions}
          emptyText="No country matches that"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Time zone</span>
        <SearchableSelect
          name="timezone"
          ariaLabel="Time zone"
          placeholder="Type a city or zone"
          value={zone}
          onChange={setZone}
          options={zoneOptions}
          emptyText="No time zone matches that"
        />
        <span className="mt-1 block text-xs text-slate-400">
          Families see this so they know which hours you keep.
        </span>
      </label>
    </div>
  );
}
