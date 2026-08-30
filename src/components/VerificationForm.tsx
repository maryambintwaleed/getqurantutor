"use client";

import { useActionState } from "react";
import { Mic, IdCard } from "lucide-react";
import { submitVerification, type VerificationState } from "@/actions/verification";
import SubmitButton from "@/components/SubmitButton";

export default function VerificationForm({
  hasAudio,
  hasDoc,
  rejected,
}: {
  hasAudio: boolean;
  hasDoc: boolean;
  rejected: boolean;
}) {
  const [state, action, pending] = useActionState<VerificationState, FormData>(
    submitVerification,
    {}
  );

  return (
    <form action={action} className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="flex items-center gap-2 font-bold text-slate-900">
          <Mic size={18} className="text-brand-600" /> Recitation recording
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Record yourself reciting any passage for one to two minutes — Surah Al-Fatiha is
          perfect. We listen to check your tajweed and confirm your voice matches the gender on
          your profile, because many families ask specifically for a male or female teacher.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Any phone voice recorder works. mp3, m4a, wav or ogg, up to 8MB.
        </p>
        <input
          type="file"
          name="audio"
          accept="audio/*"
          className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
        />
        {hasAudio && (
          <p className="mt-2 text-xs text-green-700">
            A recording is already on file — only add one to replace it.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="flex items-center gap-2 font-bold text-slate-900">
          <IdCard size={18} className="text-brand-600" /> Proof of identity
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A photo of your passport, national ID or driving licence. The name must match the name
          on your profile.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Only our review team can open this, it is never shown to families, and we delete it as
          soon as you are approved. JPG, PNG or PDF, up to 6MB.
        </p>
        <input
          type="file"
          name="idDoc"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
        />
        {hasDoc && (
          <p className="mt-2 text-xs text-green-700">
            An ID is already on file — only add one to replace it.
          </p>
        )}
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <SubmitButton pendingLabel="Uploading…">
        {rejected ? "Submit again" : "Send for review"}
      </SubmitButton>
      {pending && (
        <p className="text-xs text-slate-400">
          Large recordings can take a moment — please don&apos;t close this page.
        </p>
      )}
    </form>
  );
}
