import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MAX_AUDIO, MAX_DOC, isAllowedAudio, isAllowedDoc, mb } from "@/lib/verification-limits";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "TUTOR" || !user.tutorProfile) {
      return NextResponse.json({ error: "Please log in to your teacher account." }, { status: 401 });
    }
    const profile = user.tutorProfile;

    const formData = await req.formData();
    const audio = formData.get("audio") as File | null;
    const doc = formData.get("idDoc") as File | null;

    const hasAudio = Boolean(audio && audio.size > 0);
    const hasDoc = Boolean(doc && doc.size > 0);

    if (!hasAudio && !profile.audioType && !profile.audioUrl) {
      return NextResponse.json(
        { error: "Please attach or record a recitation sample before sending." },
        { status: 400 }
      );
    }

    if (hasAudio && audio) {
      if (audio.size > MAX_AUDIO) {
        return NextResponse.json(
          {
            error: `That recording is too large (${mb(audio.size)}) — please keep it under ${mb(MAX_AUDIO)}.`,
          },
          { status: 400 }
        );
      }
      if (!isAllowedAudio(audio)) {
        return NextResponse.json(
          { error: "Please upload an audio file (mp3, m4a, wav, ogg or aac)." },
          { status: 400 }
        );
      }
    }

    if (hasDoc && doc) {
      if (doc.size > MAX_DOC) {
        return NextResponse.json(
          { error: `That ID file is too large — please keep it under ${mb(MAX_DOC)}.` },
          { status: 400 }
        );
      }
      if (!isAllowedDoc(doc)) {
        return NextResponse.json(
          { error: "Please upload your ID as a photo (JPG or PNG) or a PDF." },
          { status: 400 }
        );
      }
    }

    const data: {
      status: string;
      submittedAt: Date;
      reviewNote: string;
      audioType?: string;
      idDocData?: Uint8Array<ArrayBuffer>;
      idDocType?: string;
    } = {
      status: "SUBMITTED",
      submittedAt: new Date(),
      reviewNote: "",
    };

    if (hasDoc && doc) {
      data.idDocData = new Uint8Array(await doc.arrayBuffer()).slice();
      data.idDocType = doc.type || "application/octet-stream";
    }

    if (hasAudio && audio) {
      const bytes = new Uint8Array(await audio.arrayBuffer()).slice();
      const contentType =
        audio.type && audio.type.startsWith("audio/") ? audio.type : "audio/mpeg";
      data.audioType = contentType;
      await db.recitation.upsert({
        where: { tutorId: profile.id },
        update: { data: bytes, contentType },
        create: { tutorId: profile.id, data: bytes, contentType },
      });
    }

    await db.tutorProfile.update({
      where: { id: profile.id },
      data,
    });

    revalidatePath("/pro", "layout");
    revalidatePath("/pro/verification");
    revalidatePath("/admin/verification");
    revalidatePath("/admin/tutors");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/pro/verification error]", err);
    return NextResponse.json(
      { error: "Upload could not be completed. Please try again." },
      { status: 500 }
    );
  }
}
