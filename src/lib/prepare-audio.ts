import { MAX_AUDIO } from "@/lib/verification-limits";

// Voice stays perfectly clear at these settings, and tajweed is still easy to
// judge — but the file becomes small enough to send and to store.
const TARGET_RATE = 16000;
const FIRST_PASS_SECONDS = 90;
const SECOND_PASS_SECONDS = 60;

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const text = (offset: string, at: number) =>
    [...offset].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));

  text("RIFF", 0);
  view.setUint32(4, 36 + samples.length * 2, true);
  text("WAVE", 8);
  text("fmt ", 12);
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // format: PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  text("data", 36);
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

async function toMono(file: File, seconds: number): Promise<Blob> {
  const AudioCtx: typeof AudioContext =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  const context = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await context.decodeAudioData(await file.arrayBuffer());
  } finally {
    await context.close();
  }

  const wanted = Math.min(decoded.duration, seconds);
  const offline = new OfflineAudioContext(1, Math.ceil(wanted * TARGET_RATE), TARGET_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start(0, 0, wanted);

  const rendered = await offline.startRendering();
  return encodeWav(rendered.getChannelData(0), TARGET_RATE);
}

/**
 * Phone recorders often save uncompressed .wav, where a couple of minutes runs
 * to twenty megabytes. Rather than telling the teacher their recording is too
 * big — which they can do nothing useful about — convert it to a small mono
 * clip. A shorter sample is all a reviewer needs.
 *
 * Returns the original file when it is already small enough, or when the
 * browser cannot decode it; the size check in the form then has the last word.
 */
export async function prepareAudio(file: File): Promise<File> {
  if (file.size <= MAX_AUDIO) return file;

  try {
    let blob = await toMono(file, FIRST_PASS_SECONDS);
    if (blob.size > MAX_AUDIO) blob = await toMono(file, SECOND_PASS_SECONDS);
    if (blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".wav", { type: "audio/wav" });
  } catch {
    return file;
  }
}
