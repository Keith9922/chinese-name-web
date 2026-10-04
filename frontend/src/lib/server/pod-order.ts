import crypto from "node:crypto";

// Print-on-demand (POD) physical fulfillment — mirrors the "mock mode"
// convention established in ./stripe-service.ts: if real provider credentials
// are configured, a real API call would go out; otherwise we return a
// deterministic-but-realistic mock so the whole flow works end to end today
// without a Printful/Gelato account.

export type PodProductType = "canvas_print" | "rice_paper_scroll" | "carved_seal";

export interface PodOrderInput {
  productType: PodProductType;
  imageUrl: string;
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  email: string;
}

export interface PodOrderResult {
  source: "pod_live" | "pod_mock";
  orderId: string;
  estimatedDeliveryDays: [number, number];
  error?: string;
}

// Carving a wooden/stone seal takes longer than printing canvas or mounting a
// rice-paper scroll, so it gets a longer, later delivery window.
const DELIVERY_WINDOWS: Record<PodProductType, [number, number]> = {
  canvas_print: [7, 14],
  rice_paper_scroll: [7, 14],
  carved_seal: [10, 18],
};

function isPodConfigured(): boolean {
  const provider = process.env.POD_PROVIDER;
  const apiKey = process.env.POD_API_KEY;
  return Boolean(provider && provider.trim() && apiKey && apiKey.trim());
}

function generateMockOrderId(): string {
  // "POD-" + 10 random uppercase-alphanumeric chars, e.g. POD-7K3QZX9F2A
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid ambiguity
  let suffix = "";
  const bytes = crypto.randomBytes(10);
  for (let i = 0; i < 10; i++) {
    suffix += alphabet[bytes[i] % alphabet.length];
  }
  return `POD-${suffix}`;
}

export async function submitPodOrder(input: PodOrderInput): Promise<PodOrderResult> {
  const estimatedDeliveryDays = DELIVERY_WINDOWS[input.productType];

  if (isPodConfigured()) {
    // TODO: real POD_PROVIDER integration goes here.
    //
    // Once a real Printful or Gelato account exists, this branch should:
    //   1. Map `input.productType` to the provider's catalog/variant id
    //      (e.g. Printful "Canvas (in)" product id, or a Gelato SKU for a
    //      framed print / hanging scroll mount / custom carved item).
    //   2. POST to the provider's order-creation endpoint with:
    //        - recipient: { name, address1, address2, city, state, zip, country }
    //        - a print file reference built from `input.imageUrl` (Printful/Gelato
    //          both accept a public HTTPS image URL for print files)
    //        - the account's `POD_API_KEY` as Bearer/Basic auth per provider docs
    //   3. Read back the provider's real order id + its own estimated
    //      ship/delivery window (providers usually return this directly)
    //      and return { source: "pod_live", orderId, estimatedDeliveryDays }.
    //   4. On any failure, catch it and fall through to the mock response
    //      below (with `error` set) rather than surfacing a raw provider
    //      error to the customer — the order UI must never hard-fail here.
    //
    // Example (illustrative only, not wired up — no credentials to test against):
    //
    //   const res = await fetch(`https://api.printful.com/orders`, {
    //     method: "POST",
    //     headers: {
    //       Authorization: `Bearer ${process.env.POD_API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ recipient: {...}, items: [{...}] }),
    //   });
    //
    // Since we have no real credentials yet, fall back to the mock path so
    // the product still works. This keeps "configured but not yet actually
    // wired up" from crashing the order flow.
    console.warn(
      "[pod-order] POD_PROVIDER/POD_API_KEY are set, but no real provider integration is implemented yet — falling back to mock order.",
    );
  }

  return {
    source: "pod_mock",
    orderId: generateMockOrderId(),
    estimatedDeliveryDays,
  };
}
