"use client";

import { useActionState } from "react";
import { upload } from "@vercel/blob/client";
import { Mic, IdCard } from "lucide-react";
import { submitVerification, type VerificationState } from "@/actions/verification";
import SubmitButton from "@/components/SubmitButton";
import { AUDIO_TYPES, DOC_TYPES, MAX_AUDIO, MAX_DOC, mb } from "@/lib/verification-limits";

/**
 * Phone cameras produce 4–6MB photos, which would blow past the request size
 * cap. Redrawing the image at a sensible size keeps the ID readable while
 * making it small enough to send. Anything that isn't an image is left alone.
 */
async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= MAX_DOC) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85)
  );
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
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
  // Runs in the browser first: the recitation goes straight to blob storage and
  // only its URL is handed to the server action.
  const [state, action, pending] = useActionState<VerificationState, FormData>(
    async (prev, formData) => {
      const audio = formData.get("audio") as File | null;
      let doc = formData.get("idDoc") as File | null;

      if (audio && audio.size > 0) {
        if (audio.size > MAX_AUDIO) {
          return { error: `That recording is too large — please keep it under ${mb(MAX_AUDIO)}.` };
        }
        if (audio.type && !AUDIO_TYPES.includes(audio.type)) {
          return { error: "Please upload an audio file (mp3, m4a, wav or ogg)." };
        }
        try {
          const blob = await upload(`recitations/${Date.now()}-${audio.name}`, audio, {
            access: "public",
            handleUploadUrl: "/api/verification/audio",
            contentType: audio.type,
          });
          formData.set("audioUrl", blob.url);
        } catch {
          return { error: "That recording didn't upload. Please check your connection and try again." };
        }
        formData.delete("audio");
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
                ? `That PDF is too large — please keep it under ${mb(MAX_DOC)}, or send a photo of your ID instead.`
                : `That ID photo is too large — please keep it under ${mb(MAX_DOC)}.`,
          };
        }
        formData.set("idDoc", doc);
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
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Record yourself reciting any passage for one to two minutes — Surah Al-Fatiha is
          perfect. We listen to check your tajweed and confirm your voice matches the gender on
          your profile, because many families ask specifically for a male or female teacher.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Any phone voice recorder works. mp3, m4a, wav or ogg, up to {mb(MAX_AUDIO)}.
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
