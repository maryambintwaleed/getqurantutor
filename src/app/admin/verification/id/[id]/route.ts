import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * Streams a teacher's identity document to an admin. This is the only way the
 * file can be read — it is never placed in public storage and never given a
 * guessable public URL.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new Response("Not found", { status: 404 });
  }

  const { id } = await params;
  const profile = await db.tutorProfile.findUnique({
    where: { id },
    select: { idDocData: true, idDocType: true },
  });
  if (!profile?.idDocData) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(profile.idDocData), {
    headers: {
      "Content-Type": profile.idDocType || "application/octet-stream",
      "Cache-Control": "no-store",
      "Content-Disposition": "inline",
    },
  });
}
