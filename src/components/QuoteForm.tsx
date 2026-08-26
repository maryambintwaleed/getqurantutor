"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sendQuote, type QuoteState } from "@/actions/tutor";

export default function QuoteForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(sendQuote, {});

  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="requestId" value={requestId} />
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
