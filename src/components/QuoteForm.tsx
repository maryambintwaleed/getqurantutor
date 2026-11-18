"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { sendQuote, type QuoteState } from "@/actions/tutor";

export default function QuoteForm({
  requestId,
  defaultMode = "Online",
}: {
  requestId: string;
  defaultMode?: string;
}) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(sendQuote, {});
  const [mode, setMode] = useState<"Online" | "Offline">(
    defaultMode === "Offline" ? "Offline" : "Online"
  );

  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="mode" value={mode} />
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Your price per class ($)
          </label>
          <input
            name="price"
            type="number"
            min={1}
            step="0.5"
            required
            placeholder="e.g. 15"
            className="w-40 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Class format sign
          </label>
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(["Online", "Offline"] as const).map((option) => {
              const active = mode === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
                    active
                      ? option === "Online"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      active
                        ? "bg-white"
                        : option === "Online"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                    }`}
                  />
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Message to the family
        </label>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Introduce yourself — your qualification (ijazah, hifdh), teaching experience, the plan you suggest, and whether you offer a free trial class…"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" name="sharePhone" defaultChecked className="h-4 w-4 accent-brand-600" />
        Share my WhatsApp number with the family
      </label>
      {state.error && (
        <p className="text-sm text-red-600">
          {state.error}{" "}
          {state.error.includes("Top up") && (
            <Link href="/pro/wallet" className="font-semibold underline">
              Go to wallet
            </Link>
          )}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-accent-500 py-3.5 font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send quote"}
      </button>
    </form>
  );
}
