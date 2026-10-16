import { db } from "@/lib/db";

/**
 * Public route that streams an approved teacher's Quran recitation sample
 * so prospective families and students can listen to their tajweed before booking.
 * Only recitations of teachers with status "APPROVED" are publicly served.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const profile = await db.tutorProfile.findFirst({
    where: {
      id,
      status: "APPROVED",
    },
    include: {
      recitation: true,
    },
  });

  if (!profile || !profile.recitation) {
    return new Response("Recitation sample not found", { status: 404 });
  }

  return new Response(new Uint8Array(profile.recitation.data), {
    headers: {
      "Content-Type": profile.recitation.contentType || "audio/mpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Disposition": "inline",
      "Accept-Ranges": "none",
    },
  });
}
