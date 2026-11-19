// Shared between the browser and the server so the two never disagree
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
  "audio/mpeg3",
  "audio/x-mpeg-3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/x-m4a",
  "audio/m4a",
  "audio/mp4",
  "audio/aac",
  "audio/x-aac",
  "audio/webm",
  "audio/ogg",
  "audio/opus",
  "audio/3gpp",
  "audio/3gpp2",
  "audio/amr",
  "audio/flac",
  "video/mp4",
  "video/3gpp",
  "video/webm",
];

export const AUDIO_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".wav",
  ".ogg",
  ".opus",
  ".aac",
  ".webm",
  ".3gp",
  ".3gpp",
  ".amr",
  ".flac",
  ".mp4",
];

export const DOC_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
export const DOC_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

export function isAllowedAudio(file: { type?: string; name?: string }): boolean {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  if (type && (AUDIO_TYPES.includes(type) || type.startsWith("audio/"))) return true;
  return AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function isAllowedDoc(file: { type?: string; name?: string }): boolean {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  if (type && DOC_TYPES.includes(type)) return true;
  return DOC_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export const mb = (bytes: number) => {
  const value = bytes / (1024 * 1024);
  return `${Number.isInteger(value) ? value : value.toFixed(1)}MB`;
};
