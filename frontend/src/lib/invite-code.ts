// Tiny client-side helper for sticky invite / offer codes.
//
// Flow:
//   1. Someone shares https://ink-name.vercel.app/?invite=LAUNCH50
//   2. The visitor lands, we read `?invite=` and stash it in
//      sessionStorage so it survives page navigation within the SPA.
//   3. When they reach a "Get Keepsake / Get Signature" button, we
//      append `&offer_code=<code>` to the Gumroad URL so the checkout
//      auto-applies the discount.
//
// We accept either ?invite= or ?code= for friendly URL aesthetics.

const STORAGE_KEY = "ink_name.invite_code";
const QUERY_KEYS = ["invite", "code", "offer_code"];

// Allow letters/digits/dash/underscore, 2-32 chars. Conservative on purpose
// so a malformed URL never injects something weird into Gumroad's params.
const VALID_CODE = /^[A-Za-z0-9_-]{2,32}$/;

export function captureInviteCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  for (const key of QUERY_KEYS) {
    const v = url.searchParams.get(key);
    if (v && VALID_CODE.test(v)) {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, v.toUpperCase());
      } catch {
        // sessionStorage can throw in private mode; ignore
      }
      return v.toUpperCase();
    }
  }
  return getStoredInviteCode();
}

export function getStoredInviteCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return v && VALID_CODE.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function clearInviteCode(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Mutate a Gumroad checkout URL to attach the offer_code.
 *
 * Gumroad accepts both `?offer_code=X` and the path-style `/l/PRODUCT/X`.
 * We set both: query-param for compatibility, path-style as the canonical
 * pre-applied form (it survives every redirect and is what Gumroad's own
 * "share with discount" buttons emit).
 */
export function applyInviteCodeToCheckoutUrl(url: URL, code: string | null): URL {
  if (!code || !VALID_CODE.test(code)) return url;
  url.searchParams.set("offer_code", code);
  // Rewrite /l/PRODUCT to /l/PRODUCT/CODE if the path matches.
  const m = url.pathname.match(/^\/l\/([^/]+)\/?$/);
  if (m) {
    url.pathname = `/l/${m[1]}/${code}`;
  }
  return url;
}
