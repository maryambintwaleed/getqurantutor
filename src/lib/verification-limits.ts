// Shared between the browser, the blob-token route and the server action so the
// three never disagree about what counts as an acceptable upload.
export const MAX_AUDIO = 8 * 1024 * 1024; // 8MB — a 1–2 minute recitation is far smaller
export const MAX_DOC = 3 * 1024 * 1024; // 3MB — must survive Vercel's 4.5MB request cap

export const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/x-m4a",
  "audio/m4a",
  "audio/mp4",
  "audio/aac",
  "audio/webm",
  "audio/ogg",
];

export const DOC_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const mb = (bytes: number) => `${Math.round(bytes / (1024 * 1024))}MB`;
