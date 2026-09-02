"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type SelectOption = { value: string; label: string; group?: string };

/**
 * A dropdown you can type into. With 200 countries a plain <select> means
 * scrolling a wall of options — worse on a phone, where the native list has no
 * search at all.
 *
 * The value is mirrored into a hidden input so this drops into an ordinary
 * form action with no extra wiring.
 */
export default function SearchableSelect({
  name,
  value,
  onChange,
  options,
  placeholder = "Select…",
  ariaLabel,
  emptyText = "No matches",
}: {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;

    // The value is searched as well as the label, so a time zone shown as
    // "Pakistan — GMT+5" is still found by typing "karachi" — its value is
    // Asia/Karachi. Slashes and underscores count as spaces so each part of
    // the value is a word of its own.
    const haystack = (o: SelectOption) =>
      `${o.label} ${o.value.replace(/[/_]/g, " ")}`.toLowerCase();

    const rank = (o: SelectOption) => {
      if (o.label.toLowerCase().startsWith(q)) return 0; // "ind" → India before Finland
      if (haystack(o).split(/\s+/).some((word) => word.startsWith(q))) return 1;
      if (haystack(o).includes(q)) return 2;
      return 3;
    };

    return options
      .map((option, i) => ({ option, i, rank: rank(option) }))
      .filter((entry) => entry.rank < 3)
      .sort((a, b) => a.rank - b.rank || a.i - b.i)
      .map((entry) => entry.option);
  }, [options, query]);

  useEffect(() => setActive(0), [query]);

  // Close when the click lands anywhere else on the page.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    // Tabbing away must close it too, or a keyboard user leaves an open list
    // floating over the next field.
    const onFocusOut = (event: FocusEvent) => {
      if (!rootRef.current?.contains(event.relatedTarget as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    rootRef.current?.addEventListener("focusout", onFocusOut);
    const root = rootRef.current;
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      root?.removeEventListener("focusout", onFocusOut);
    };
  }, [open]);

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return setOpen(true);
      setActive((i) => {
        const next = event.key === "ArrowDown" ? i + 1 : i - 1;
        return (next + matches.length) % Math.max(matches.length, 1);
      });
    } else if (event.key === "Enter") {
      if (open && matches[active]) {
        event.preventDefault();
        choose(matches[active]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {name && <input type="hidden" name={name} value={value} />}

      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-4 py-3 ${
          open ? "border-brand-500" : "border-slate-200"
        }`}
      >
        {open && <Search size={15} className="shrink-0 text-slate-400" />}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          autoComplete="off"
          value={open ? query : selected?.label ?? ""}
          placeholder={selected ? selected.label : placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={`w-full bg-transparent text-sm outline-none ${
            selected ? "text-slate-900" : "text-slate-400"
          } placeholder:text-slate-400`}
        />
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {matches.length === 0 && (
            <li className="px-4 py-3 text-sm text-slate-500">{emptyText}</li>
          )}
          {matches.map((option, i) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onPointerDown={(e) => e.preventDefault()} // keep focus in the input
                  onClick={() => choose(option)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm ${
                    i === active ? "bg-brand-50 text-brand-900" : "text-slate-700"
                  }`}
                >
                  <span>
                    {option.label}
                    {option.group && (
                      <span className="ml-2 text-xs text-slate-400">{option.group}</span>
                    )}
                  </span>
                  {isSelected && <Check size={15} className="shrink-0 text-brand-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
