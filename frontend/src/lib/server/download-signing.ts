// HMAC signing for downloadable artifact URLs.
//
// We use this to gate clean (non-watermarked) PNGs and the tattoo SVG
// behind a "did this URL come from a paid order email?" check. The
// signature lives in the email URL only — the result page on the website
// shows a watermarked / preview-only version.
//
// Implemented with Web Crypto so it runs on both Edge and Node runtimes.

const SIGN_FIELDS = ["name", "pinyin", "meaning", "allusion", "style"] as const;

function getSecret(): string {
  const secret = process.env.DOWNLOAD_SIGNING_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("DOWNLOAD_SIGNING_SECRET is not configured (or too short)");
  }
  return secret;
}

function canonical(params: Record<string, string | undefined>): string {
  // Always join the same fields in the same order so verifier and signer agree.
  return SIGN_FIELDS.map((k) => `${k}=${params[k] ?? ""}`).join("|");
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bufToHex(sig);
}

export async function signDownloadUrl(params: Record<string, string | undefined>): Promise<string> {
  const full = await hmacHex(getSecret(), canonical(params));
  return full.slice(0, 32);
}

/**
 * Returns true if `sig` was minted by us for these params.
 * Uses constant-time comparison so we don't leak signature bytes via timing.
 */
export async function verifyDownloadSig(
  sig: string | null | undefined,
  params: Record<string, string | undefined>,
): Promise<boolean> {
  if (!sig || sig.length !== 32) return false;
  let expected: string;
  try {
    expected = await signDownloadUrl(params);
  } catch {
    return false;
  }
  if (expected.length !== sig.length) return false;
  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}
