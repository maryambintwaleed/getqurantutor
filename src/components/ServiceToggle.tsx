"use client";

import { useTransition } from "react";
import { toggleService } from "@/actions/tutor";

export default function ServiceToggle({
  serviceId,
  enabled,
}: {
  serviceId: string;
  enabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => toggleService(serviceId, !enabled))}
      disabled={pending}
      role="switch"
      aria-checked={enabled}
      className={`relative h-7 w-12 rounded-full transition ${
        enabled ? "bg-brand-600" : "bg-slate-200"
      } ${pending ? "opacity-60" : ""}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
