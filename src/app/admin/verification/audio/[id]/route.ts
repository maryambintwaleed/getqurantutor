import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * Streams a teacher's recitation to an admin so it can be played on the review
 * page. Like the identity document, it is never placed in public storage.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new Response("Not found", { status: 404 });
  }

  const { id } = await params;
  const recitation = await db.recitation.findUnique({ where: { tutorId: id } });
  if (!recitation) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(recitation.data), {
    headers: {
      "Content-Type": recitation.contentType || "audio/mpeg",
      "Cache-Control": "no-store",
      "Content-Disposition": "inline",
      "Accept-Ranges": "none",
    },
  });
}
