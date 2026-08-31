import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AUDIO_TYPES, MAX_AUDIO } from "@/lib/verification-limits";

/**
 * Hands the browser a short-lived token so the recitation goes straight to blob
 * storage. Routing it through a server action instead would hit the platform's
 * 4.5MB request cap and fail with a bare 413 that the form cannot explain.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const user = await getCurrentUser();
        if (!user || user.role !== "TUTOR" || !user.tutorProfile) {
          throw new Error("Only a signed-in teacher can upload a recitation.");
        }
        return {
          allowedContentTypes: AUDIO_TYPES,
          maximumSizeInBytes: MAX_AUDIO,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ tutorId: user.tutorProfile.id }),
        };
      },
      // The profile is updated by the server action once the form is submitted,
      // so there is nothing to do when the file lands.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
