"use client";

import { useActionState } from "react";
import { Mic, IdCard } from "lucide-react";
import { submitVerification, type VerificationState } from "@/actions/verification";
import SubmitButton from "@/components/SubmitButton";
import { prepareAudio } from "@/lib/prepare-audio";
import {
  AUDIO_TYPES,
  DOC_TYPES,
  MAX_AUDIO,
  MAX_DOC,
  MAX_TOTAL,
  mb,
} from "@/lib/verification-limits";

/**
 * Phone cameras produce 4–6MB photos, which would push the request past the
 * size the server accepts. Redrawing the image keeps the ID perfectly readable
 * while making it small enough to send. Anything that isn't an image is left
 * alone — a PDF cannot be shrunk this way.
 */
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= MAX_DOC) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82)
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file; // an unreadable image is caught by the checks below
  }
}

export default function VerificationForm({
  hasAudio,
  hasDoc,
  rejected,
}: {
  hasAudio: boolean;
  hasDoc: boolean;
  rejected: boolean;
}) {
  // Everything is checked here first so a file that is too big reads as a
  // sentence in the form, instead of the browser reporting a failed request.
  const [state, action, pending] = useActionState<VerificationState, FormData>(
    async (prev, formData) => {
      let audio = formData.get("audio") as File | null;
      let doc = formData.get("idDoc") as File | null;

      if (audio && audio.size > 0) {
        if (audio.type && !AUDIO_TYPES.includes(audio.type)) {
          return { error: "Please upload an audio file (mp3, m4a, wav or ogg)." };
        }
        // .wav recordings are uncompressed and run to tens of megabytes, so
        // shrink before complaining about the size.
        audio = await prepareAudio(audio);
        if (audio.size > MAX_AUDIO) {
          return {
            error: `That recording is ${mb(audio.size)}, which is more than we can accept. Please record a shorter clip — one minute of Surah Al-Fatiha is plenty.`,
          };
        }
        formData.set("audio", audio);
      }

      if (doc && doc.size > 0) {
        if (doc.type && !DOC_TYPES.includes(doc.type)) {
          return { error: "Please upload your ID as a photo (JPG or PNG) or a PDF." };
        }
        doc = await shrinkImage(doc);
        if (doc.size > MAX_DOC) {
          return {
            error:
              doc.type === "application/pdf"
                ? `That PDF is ${mb(doc.size)} — please keep it under ${mb(MAX_DOC)}, or simply take a photo of your ID instead.`
                : `That ID photo is ${mb(doc.size)} — please keep it under ${mb(MAX_DOC)}.`,
          };
        }
        formData.set("idDoc", doc);
      }

      const total = (audio?.size ?? 0) + (doc?.size ?? 0);
      if (total > MAX_TOTAL) {
        return {
          error: `Those two files come to ${mb(total)} together, which is more than we can accept at once. Please send a shorter recording, then add your ID afterwards.`,
        };
      }

      return submitVerification(prev, formData);
    },
    {}
  );

  return (
    <form action={action} className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="flex items-center gap-2 font-bold text-slate-900">
          <Mic size={18} className="text-brand-600" /> Recitation recording
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            Required
          </span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Record yourself reciting any passage for one to two minutes — Surah Al-Fatiha is
          perfect. We listen to check your tajweed and confirm your voice matches the gender on
          your profile, because many families ask specifically for a male or female teacher.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Any phone voice recorder works — mp3, m4a, wav or ogg. Long or uncompressed
          recordings are shortened and compressed automatically, so don&apos;t worry about the
          file size.
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
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            Optional
          </span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A photo of your passport, national ID or driving licence, with the name matching your
          profile. You can be approved without it, but adding it gets you reviewed faster and
          shows families you are fully checked.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Only our review team can open this, it is never shown to families, and we delete it as
          soon as you are approved. JPG, PNG or PDF — large photos are shrunk automatically.
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

      <SubmitButton pendingLabel="Sending…">
        {rejected ? "Submit again" : "Send for review"}
      </SubmitButton>
      {pending && (
        <p className="text-xs text-slate-400">
          This can take a moment — please don&apos;t close this page.
        </p>
      )}
    </form>
  );
}
