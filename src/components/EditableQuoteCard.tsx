"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { FileText, Phone, Pencil, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { editQuote, type EditQuoteState } from "@/actions/tutor";
import { QUOTE_EDIT_FEE } from "@/lib/services";
import { timeAgo } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  SENT: "bg-brand-50 text-brand-700",
  WON: "bg-green-50 text-green-700",
  DECLINED: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS: Record<string, string> = {
  SENT: "Sent",
  WON: "Won",
  DECLINED: "Not selected",
};

export interface QuoteItem {
  id: string;
  price: number;
  message: string;
  sharePhone: boolean;
  status: string;
  createdAt: Date | string;
  request: {
    parentName: string;
    city: string | null;
    mode: string;
    service: {
      name: string;
    };
  };
}

export default function EditableQuoteCard({
  quote,
  tutorBalance,
}: {
  quote: QuoteItem;
  tutorBalance: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, pending] = useActionState<EditQuoteState, FormData>(
    editQuote,
    {}
  );

  const canEdit = quote.status === "SENT";
  const hasEnoughCredits = tutorBalance >= QUOTE_EDIT_FEE;

  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
    }
  }, [state.success]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 transition shadow-xs">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-bold text-slate-900 text-base">
            {quote.request.parentName}
          </span>
          <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700">
            {quote.request.service.name}
            {quote.request.city ? ` — ${quote.request.city}` : ""} — {quote.request.mode}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-xs text-slate-400">
            {timeAgo(new Date(quote.createdAt))}
          </span>
          <span
            className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold ${
              STATUS_STYLES[quote.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {STATUS_LABELS[quote.status] || quote.status}
          </span>
        </div>
      </div>

      {/* Quote Meta & Edit Trigger */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <FileText size={15} className="text-brand-600" /> ${quote.price} / session
          </span>
          {quote.sharePhone && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Phone size={13} className="text-emerald-600" /> Phone shared
            </span>
          )}
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700 transition"
          >
            {isEditing ? (
              <>
                <X size={13} /> Cancel
              </>
            ) : (
              <>
                <Pencil size={13} className="text-brand-600" /> Edit quote ({QUOTE_EDIT_FEE} credits)
              </>
            )}
          </button>
        )}
      </div>

      {/* Current Message */}
      {!isEditing && (
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs sm:text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
          {quote.message}
        </p>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="mt-4 border-t border-slate-100 pt-4 animate-in fade-in duration-150">
          <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3 mb-4 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Editing this quote costs {QUOTE_EDIT_FEE} credits.</p>
              <p className="mt-0.5 text-amber-800">
                The updated pricing and message will immediately be sent to the family. Your current balance:{" "}
                <strong>{tutorBalance} credits</strong>.
              </p>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="quoteId" value={quote.id} />

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Your price per session ($)
              </label>
              <input
                name="price"
                type="number"
                min={1}
                step="0.5"
                defaultValue={quote.price}
                required
                className="w-36 rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-brand-500 bg-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Message to the family
              </label>
              <textarea
                name="message"
                rows={4}
                defaultValue={quote.message}
                required
                placeholder="Update your intro, qualifications, trial offer or schedule details..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-brand-500 bg-white"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                name="sharePhone"
                defaultChecked={quote.sharePhone}
                className="h-4 w-4 accent-brand-600 rounded"
              />
              Share my WhatsApp number with the family
            </label>

            {state.error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center justify-between gap-2">
                <span>{state.error}</span>
                {state.error.includes("wallet") && (
                  <Link href="/pro/wallet" className="font-bold underline shrink-0">
                    Go to wallet →
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={pending || !hasEnoughCredits}
                className="rounded-full bg-brand-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {pending ? "Saving & Deducting 5 credits..." : `Save Changes (${QUOTE_EDIT_FEE} credits)`}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={pending}
                className="rounded-full border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
