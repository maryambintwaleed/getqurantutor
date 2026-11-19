"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, IdCard, Square, CheckCircle2, Trash2, UploadCloud } from "lucide-react";
import { prepareAudio } from "@/lib/prepare-audio";
import {
  MAX_AUDIO,
  MAX_DOC,
  MAX_TOTAL,
  isAllowedAudio,
  isAllowedDoc,
  mb,
} from "@/lib/verification-limits";

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
    return file;
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
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");

  // In-browser voice recorder state
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!audioFile) {
      setAudioPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(audioFile);
    setAudioPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        const type = recorder.mimeType || "audio/webm";
        const ext = type.includes("mp4") ? "m4a" : "webm";
        const blob = new Blob(chunks, { type });
        const recordedFile = new File([blob], `Recitation.${ext}`, { type });
        setAudioFile(recordedFile);
        setRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 90) {
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Could not access microphone. Please allow microphone permission or choose an audio file below.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!audioFile && !hasAudio) {
      setError("Please select your recitation audio file (or record your voice above) first.");
      return;
    }

    setPending(true);
    setStatusText("Preparing your files…");

    try {
      const formData = new FormData();

      if (audioFile && audioFile.size > 0) {
        if (!isAllowedAudio(audioFile)) {
          setPending(false);
          setStatusText("");
          setError("Please upload an audio file (mp3, m4a, wav, ogg or aac).");
          return;
        }
        const preparedAudio = await prepareAudio(audioFile);
        if (preparedAudio.size > MAX_AUDIO) {
          setPending(false);
          setStatusText("");
          setError(
            `That recording is ${mb(preparedAudio.size)}, which is more than we can accept (${mb(MAX_AUDIO)}). Please choose an MP3 file or record a 1-minute sample straight on this page.`
          );
          return;
        }
        formData.set("audio", preparedAudio);
      }

      if (docFile && docFile.size > 0) {
        if (!isAllowedDoc(docFile)) {
          setPending(false);
          setStatusText("");
          setError("Please upload your ID as a photo (JPG or PNG) or a PDF.");
          return;
        }
        const preparedDoc = await shrinkImage(docFile);
        if (preparedDoc.size > MAX_DOC) {
          setPending(false);
          setStatusText("");
          setError(
            preparedDoc.type === "application/pdf"
              ? `That PDF is ${mb(preparedDoc.size)} — please keep it under ${mb(MAX_DOC)}, or take a photo of your ID instead.`
              : `That ID photo is ${mb(preparedDoc.size)} — please keep it under ${mb(MAX_DOC)}.`
          );
          return;
        }
        formData.set("idDoc", preparedDoc);
      }

      const sentAudio = formData.get("audio") as File | null;
      const sentDoc = formData.get("idDoc") as File | null;
      const total = (sentAudio?.size ?? 0) + (sentDoc?.size ?? 0);
      if (total > MAX_TOTAL) {
        setPending(false);
        setStatusText("");
        setError(
          `Those two files come to ${mb(total)} together. Please send your recitation first, or upload a smaller ID photo.`
        );
        return;
      }

      setStatusText("Uploading your application…");
      const res = await fetch("/api/pro/verification", {
        method: "POST",
        body: formData,
      });

      let payload: { ok?: boolean; error?: string } = {};
      try {
        payload = await res.json();
      } catch {
        // Non-JSON response (e.g. 413 from gateway)
      }

      if (!res.ok || !payload.ok) {
        setPending(false);
        setStatusText("");
        setError(
          payload.error ||
            (res.status === 413
              ? "Your file was slightly too large for a single upload. Please record a 1-minute clip using the Record button above."
              : "Upload could not be completed. Your selected file is still attached — please tap Send for review again.")
        );
        return;
      }

      router.push("/pro/verification?submitted=1");
      router.refresh();
    } catch {
      setPending(false);
      setStatusText("");
      setError(
        "Network connection interrupted during upload. Your chosen file is still attached below — please tap Send for review to try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          Choose an existing audio file (mp3, m4a, wav, ogg) OR record your voice directly on this page.
          Long MP3 recordings are automatically trimmed to the first ~2 minutes so they upload smoothly.
        </p>

        {/* Option 1: Choose file OR Option 2: Record directly in browser */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition">
            <UploadCloud size={16} />
            <span>{audioFile ? "Change audio file" : "Choose audio file (MP3 / M4A / WAV)"}</span>
            <input
              type="file"
              accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.opus,.3gp"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) {
                  setAudioFile(file);
                  setError("");
                }
              }}
              className="hidden"
            />
          </label>

          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-700 transition"
            >
              <Mic size={16} className="text-red-500" />
              Record voice on this page
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white animate-pulse"
            >
              <Square size={14} />
              Stop recording ({recordSeconds}s / 90s)
            </button>
          )}
        </div>

        {/* Attached audio preview — persists across retries! */}
        {audioFile && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-900 truncate">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="truncate">{audioFile.name}</span>
                <span className="text-xs font-normal text-emerald-700 shrink-0">
                  ({mb(audioFile.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAudioFile(null)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
            {audioPreviewUrl && (
              <audio controls src={audioPreviewUrl} className="mt-2.5 h-9 w-full" />
            )}
          </div>
        )}

        {hasAudio && !audioFile && (
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

        <div className="mt-4">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">
            <UploadCloud size={16} />
            <span>{docFile ? "Change ID file" : "Choose ID photo or PDF (Optional)"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) {
                  setDocFile(file);
                  setError("");
                }
              }}
              className="hidden"
            />
          </label>
        </div>

        {docFile && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm">
            <span className="font-medium text-slate-800 truncate">
              Attached: {docFile.name} ({mb(docFile.size)})
            </span>
            <button
              type="button"
              onClick={() => setDocFile(null)}
              className="ml-2 text-xs font-medium text-red-600 hover:underline shrink-0"
            >
              Remove
            </button>
          </div>
        )}

        {hasDoc && !docFile && (
          <p className="mt-2 text-xs text-green-700">
            An ID is already on file — only add one to replace it.
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || recording}
        className="rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? statusText || "Sending…" : rejected ? "Submit again" : "Send for review"}
      </button>

      {pending && (
        <p className="text-xs text-slate-500">
          Uploading your recording — please keep this page open for a few seconds.
        </p>
      )}
    </form>
  );
}
