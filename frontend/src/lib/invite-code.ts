// Tiny client-side helper for the invite-code field at checkout.
//
// Flow:
//   1. The visitor types a code into the "Have an invite code?" field
//      shown next to a "Get Keepsake / Get Signature" button.
//   2. We persist it in sessionStorage so the two checkout components
//      (PremiumUnlock + NameDownloads) stay in sync.
//   3. When they click checkout, we attach `offer_code` + path-style
//      `/l/PRODUCT/CODE` to the Gumroad URL so the discount auto-applies.
//
// Codes are NOT captured from the URL anymore — by design. They're shared
// privately (text / WeChat) and entered by hand, so they don't leak onto
// the page for everyone to see.

const STORAGE_KEY = "ink_name.invite_code";

// Allow letters/digits/dash/underscore, 2-32 chars. Conservative on purpose
// so a malformed input never injects something weird into Gumroad's params.
export const INVITE_CODE_PATTERN = /^[A-Za-z0-9_-]{2,32}$/;

export function isValidInviteCode(code: string): boolean {
  return INVITE_CODE_PATTERN.test(code);
}

export function getStoredInviteCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEY);
    return v && isValidInviteCode(v) ? v : null;
  } catch {
    return null;
  }
}

export function setStoredInviteCode(code: string): void {
  if (typeof window === "undefined") return;
  try {
    if (isValidInviteCode(code)) {
      window.sessionStorage.setItem(STORAGE_KEY, code.toUpperCase());
    }
  } catch {
    // sessionStorage can throw in private mode; ignore
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
 * pre-applied form (it survives every redirect).
 */
export function applyInviteCodeToCheckoutUrl(url: URL, code: string | null): URL {
  if (!code || !isValidInviteCode(code)) return url;
  url.searchParams.set("offer_code", code);
  const m = url.pathname.match(/^\/l\/([^/]+)\/?$/);
  if (m) {
    url.pathname = `/l/${m[1]}/${code}`;
  }
  return url;
}
