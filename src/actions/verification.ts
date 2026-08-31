"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyVerificationResult } from "@/lib/notify";
import { AUDIO_TYPES, DOC_TYPES, MAX_AUDIO, MAX_DOC, mb } from "@/lib/verification-limits";

export type VerificationState = { error?: string };

async function requireTutor() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TUTOR" || !user.tutorProfile) redirect("/login");
  return user.tutorProfile;
}

export async function submitVerification(
  _prev: VerificationState,
  formData: FormData
): Promise<VerificationState> {
  const profile = await requireTutor();

  const audio = formData.get("audio") as File | null;
  const doc = formData.get("idDoc") as File | null;

  const hasAudio = audio && audio.size > 0;
  const hasDoc = doc && doc.size > 0;

  // audioType is the marker that a recitation is on file; the bytes themselves
  // live in their own table so they are only read when an admin plays them.
  if (!hasAudio && !profile.audioType && !profile.audioUrl) {
    return { error: "Please add a recording of your recitation." };
  }
  if (!hasDoc && !profile.idDocType) {
    return { error: "Please add a photo of your ID." };
  }

  if (hasAudio) {
    if (audio.size > MAX_AUDIO) {
      return {
        error: `That recording is too large — please keep it under ${mb(MAX_AUDIO)}. A one to two minute recording is usually much smaller.`,
      };
    }
    if (audio.type && !AUDIO_TYPES.includes(audio.type)) {
      return { error: "Please upload an audio file (mp3, m4a, wav or ogg)." };
    }
  }
  if (hasDoc) {
    if (doc.size > MAX_DOC) {
      return { error: `That ID file is too large — please keep it under ${mb(MAX_DOC)}.` };
    }
    if (doc.type && !DOC_TYPES.includes(doc.type)) {
      return { error: "Please upload your ID as a photo (JPG or PNG) or a PDF." };
    }
  }

  const data: {
    status: string;
    submittedAt: Date;
    reviewNote: string;
    audioType?: string;
    idDocData?: Uint8Array<ArrayBuffer>;
    idDocType?: string;
  } = { status: "SUBMITTED", submittedAt: new Date(), reviewNote: "" };

  try {
    if (hasDoc) {
      // Identity documents deliberately do NOT go to public storage. They are
      // held in the database and only ever served to an admin.
      data.idDocData = new Uint8Array(await doc.arrayBuffer()).slice();
      data.idDocType = doc.type || "application/octet-stream";
    }

    if (hasAudio) {
      const bytes = new Uint8Array(await audio.arrayBuffer()).slice();
      const contentType = audio.type || "audio/mpeg";
      data.audioType = contentType;
      await db.recitation.upsert({
        where: { tutorId: profile.id },
        update: { data: bytes, contentType },
        create: { tutorId: profile.id, data: bytes, contentType },
      });
    }
  } catch (err) {
    console.error("[verification upload failed]", err);
    return { error: "That upload didn't go through. Please try again." };
  }

  await db.tutorProfile.update({ where: { id: profile.id }, data });

  revalidatePath("/pro", "layout");
  redirect("/pro/verification?submitted=1");
}

/* ---------- Admin ---------- */

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login?next=/admin/verification");
  return user;
}

export async function reviewTutor(formData: FormData) {
  await requireAdmin();
  const tutorId = String(formData.get("tutorId") ?? "");
  const decision = formData.get("decision") === "approve" ? "APPROVED" : "REJECTED";
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!tutorId) return;

  await db.tutorProfile.update({
    where: { id: tutorId },
    data: {
      status: decision,
      reviewNote: note,
      reviewedAt: new Date(),
      // An approved teacher's ID has served its purpose — don't keep it.
      ...(decision === "APPROVED" ? { idDocData: null, idDocType: "" } : {}),
    },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/pro", "layout");
  after(() => notifyVerificationResult(tutorId));
}
