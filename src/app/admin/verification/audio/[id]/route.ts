import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * Streams a teacher's recitation to an admin so it can be played on the review
 * page. Like the identity document, it is never placed in public storage.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new Response("Not found", { status: 404 });
  }

  const { id } = await params;
  const recitation = await db.recitation.findUnique({
    where: { tutorId: id },
    include: { tutor: { include: { user: true } } },
  });
  if (!recitation) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const isDownload = url.searchParams.get("download") === "1";
  const safeName = (recitation.tutor?.user?.name || "teacher")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const ext = recitation.contentType?.includes("wav")
    ? "wav"
    : recitation.contentType?.includes("ogg")
      ? "ogg"
      : recitation.contentType?.includes("mp4") || recitation.contentType?.includes("m4a")
        ? "m4a"
        : "mp3";
  const filename = `${safeName}_recitation.${ext}`;

  return new Response(new Uint8Array(recitation.data), {
    headers: {
      "Content-Type": recitation.contentType || "audio/mpeg",
      "Cache-Control": "no-store",
      "Content-Disposition": isDownload ? `attachment; filename="${filename}"` : "inline",
      "Accept-Ranges": "none",
    },
  });
}

