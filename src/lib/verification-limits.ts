// Shared between the browser and the server action so the two never disagree
// about what counts as an acceptable upload.
//
// Both files travel in a single request, and the hosting platform rejects any
// request body over ~4.5MB before our code runs — so the combined ceiling is
// what actually matters. The per-file limits below leave room for that.
export const MAX_AUDIO = 3 * 1024 * 1024; // a 1–2 minute voice recording is well under this
export const MAX_DOC = 1.5 * 1024 * 1024; // photos are shrunk in the browser to reach this
export const MAX_TOTAL = 4 * 1024 * 1024;

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

export const mb = (bytes: number) => {
  const value = bytes / (1024 * 1024);
  return `${Number.isInteger(value) ? value : value.toFixed(1)}MB`;
};
