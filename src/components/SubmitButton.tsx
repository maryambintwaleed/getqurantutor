"use client";

import { useFormStatus } from "react-dom";

/**
 * A save button that shows it is working. Without this the form looks frozen
 * while the action runs, and a slow save is indistinguishable from a dead
 * button.
 */
export default function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "rounded-full bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
