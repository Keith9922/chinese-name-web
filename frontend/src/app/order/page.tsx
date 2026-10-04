"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  ImageOff,
  Frame,
  ScrollText,
  Stamp,
  Package,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { PodProductType } from "@/lib/server/pod-order";

interface ProductOption {
  id: PodProductType;
  icon: typeof Frame;
  name: string;
  tagline: string;
  description: string;
  physicalNote: string;
  priceUsd: number;
}

const PRODUCT_OPTIONS: ProductOption[] = [
  {
    id: "canvas_print",
    icon: Frame,
    name: "Canvas Print",
    tagline: "Framed art print",
    description:
      "Your calligraphy artwork printed on fine art canvas and mounted in a slim black frame — ready to hang.",
    physicalNote: "Looks like: a gallery-style framed print, ~12×16in, matte finish.",
    priceUsd: 68,
  },
  {
    id: "rice_paper_scroll",
    icon: ScrollText,
    name: "Rice-Paper Scroll",
    tagline: "Traditional hanging scroll",
    description:
      "Mounted the traditional way — 宣纸 rice paper backed with silk brocade borders and wooden dowels, the way calligraphy has been displayed for centuries.",
    physicalNote: "Looks like: a rolling hanging scroll (立轴), silk-bordered, wooden hanger rod.",
    priceUsd: 88,
  },
  {
    id: "carved_seal",
    icon: Stamp,
    name: "Carved Seal Stamp",
    tagline: "A real, usable stamp",
    description:
      "Your seal design hand-carved into an actual small stone or wood stamp — the same kind used to sign calligraphy and art for a thousand years. Ink it and press it yourself.",
    physicalNote: "Looks like: a ~1in square stone or boxwood stamp, carved in relief, in a small pouch.",
    priceUsd: 45,
  },
];

interface ShippingForm {
  recipientName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

const EMPTY_FORM: ShippingForm = {
  recipientName: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "",
};

interface PodOrderResponse {
  source: "pod_live" | "pod_mock";
  orderId: string;
  estimatedDeliveryDays: [number, number];
  error?: string;
}

function formatDeliveryWindow(days: [number, number]): string {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const start = new Date(now + days[0] * dayMs);
  const end = new Date(now + days[1] * dayMs);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function OrderPageInner() {
  const searchParams = useSearchParams();
  const queryImage = searchParams.get("image") || "";
  const queryProduct = searchParams.get("product") as PodProductType | null;

  // Fallback hand-off: CalligraphyCard / SealDesign hold their generated
  // image as an in-memory data URL, which is far too large to put in a URL
  // query string. When they link here without a query param, they stash the
  // image + intended product in sessionStorage first — read it once on
  // mount (client-only; guarded for SSR) so this page still works without
  // requiring a query param plumbed all the way through.
  const [stored, setStored] = useState<{ url: string; product: PodProductType | null } | null>(null);
  useEffect(() => {
    if (queryImage || typeof window === "undefined") return;
    try {
      const url = window.sessionStorage.getItem("inkname_order_image");
      const product = window.sessionStorage.getItem("inkname_order_product") as PodProductType | null;
      if (url) setStored({ url, product });
    } catch {
      // sessionStorage unavailable (private mode etc.) — fall through to placeholder state
    }
  }, [queryImage]);

  const imageUrl = queryImage || stored?.url || "";
  const initialProduct = queryProduct || stored?.product || null;

  const [productType, setProductType] = useState<PodProductType>(
    initialProduct && PRODUCT_OPTIONS.some((p) => p.id === initialProduct)
      ? initialProduct
      : "canvas_print",
  );

  // If the sessionStorage hand-off resolves after the initial render (it's
  // read in an effect), sync the product selector to it once.
  useEffect(() => {
    if (stored?.product && PRODUCT_OPTIONS.some((p) => p.id === stored.product)) {
      setProductType(stored.product);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored]);
  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PodOrderResponse | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const selected = PRODUCT_OPTIONS.find((p) => p.id === productType)!;

  function updateField<K extends keyof ShippingForm>(key: K, value: ShippingForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/pod-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType,
          imageUrl,
          recipientName: form.recipientName,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || undefined,
          city: form.city,
          region: form.region || undefined,
          postalCode: form.postalCode,
          country: form.country,
          email: form.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit order");
      }
      setResult(data as PodOrderResponse);
      window.setTimeout(() => {
        document.getElementById("order-confirmation")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong submitting your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // No image param — graceful placeholder explaining how to get here.
  if (!imageUrl) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-20"
        style={{ background: "#fbf6ee" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white/85 px-8 py-12 text-center shadow-[0_30px_80px_-40px_rgba(60,38,22,0.18)] backdrop-blur"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <ImageOff className="h-6 w-6" aria-hidden />
          </div>
          <span
            className="text-[10px] uppercase tracking-[0.4em] text-stone-500"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Nothing to print yet
          </span>
          <h1
            className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Your name comes first.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">
            To order a physical print or a carved seal, we need the calligraphy
            artwork to put on it. Generate your Chinese name first — you can order
            the physical version from the result page afterward.
          </p>
          <Link
            href="/generate"
            className="group mt-8 inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-sm font-medium text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
              boxShadow: "0 14px 40px -16px rgba(162, 36, 25, 0.55)",
            }}
          >
            <span>Generate my name</span>
            <span
              className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            >
              →
            </span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-14" style={{ background: "#fbf6ee" }}>
      <div className="mx-auto max-w-5xl">
        <Link
          href="/generate"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>

        <div className="text-center">
          <span
            className="text-[10px] uppercase tracking-[0.4em] text-stone-500"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            From Screen to Silk and Stone
          </span>
          <h1
            className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Bring your name into the world.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-600 md:text-base">
            Order your calligraphy as a real, physical piece — shipped globally,
            made to last.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"
            >
              {/* Preview */}
              <div className="lg:sticky lg:top-14 lg:self-start">
                <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_30px_80px_-40px_rgba(60,38,22,0.18)]">
                  <div className="relative aspect-square w-full bg-stone-100">
                    {!imgFailed ? (
                      // Artwork URL is either a same-origin generated asset or
                      // an external AI-image URL — use a plain <img> so we
                      // don't fight next/image's remote-pattern allowlist for
                      // a preview-only thumbnail.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt="Your calligraphy artwork"
                        className="h-full w-full object-contain"
                        onError={() => setImgFailed(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-400">
                        <ImageOff className="h-8 w-8" aria-hidden />
                        <span className="text-xs">Preview unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-stone-100 px-6 py-5">
                    <div className="text-xs uppercase tracking-[0.3em] text-stone-400">
                      Selected product
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-lg font-semibold text-stone-900">
                        {selected.name}
                      </span>
                      <span className="text-lg font-semibold text-stone-900">
                        ${selected.priceUsd}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-stone-500">{selected.physicalNote}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <section>
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Choose a product
                  </h2>
                  <div className="space-y-3">
                    {PRODUCT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const active = opt.id === productType;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setProductType(opt.id)}
                          className={`w-full rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                            active
                              ? "border-red-800/40 bg-white shadow-[0_18px_40px_-24px_rgba(162,36,25,0.45)]"
                              : "border-stone-200 bg-white/60 hover:border-stone-300 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                active
                                  ? "bg-gradient-to-br from-red-700 to-red-900 text-white"
                                  : "bg-stone-100 text-stone-500"
                              }`}
                            >
                              <Icon className="h-5 w-5" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-stone-900">
                                  {opt.name}
                                  <span className="ml-2 text-xs font-normal text-stone-400">
                                    {opt.tagline}
                                  </span>
                                </span>
                                <span className="shrink-0 text-sm font-semibold text-stone-800">
                                  ${opt.priceUsd}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                                {opt.description}
                              </p>
                              <p className="mt-1.5 text-xs italic text-stone-400">
                                {opt.physicalNote}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Shipping details
                  </h2>
                  <div className="space-y-4 rounded-2xl border border-stone-200/80 bg-white/70 p-6">
                    <Field label="Full name">
                      <Input
                        required
                        placeholder="e.g. Emma Carter"
                        value={form.recipientName}
                        onChange={(e) => updateField("recipientName", e.target.value)}
                        className="h-11 rounded-xl border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200"
                      />
                    </Field>
                    <Field label="Email">
                      <Input
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="h-11 rounded-xl border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200"
                      />
                    </Field>
                    <Field label="Address line 1">
                      <Input
                        required
                        placeholder="Street address"
                        value={form.addressLine1}
                        onChange={(e) => updateField("addressLine1", e.target.value)}
                        className="h-11 rounded-xl border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200"
                      />
                    </Field>
                    <Field label="Address line 2" optional>
                      <Input
                        placeholder="Apartment, suite, etc."
                        value={form.addressLine2}
                        onChange={(e) => updateField("addressLine2", e.target.value)}
                        className="h-11 rounded-xl border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200"
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="City">
                        <Input
                          required
                          value={form.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          className="h-11 rounded-xl border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200"
                        />
                      </Field>
                      <Field label="State / Region" optional>
                        <Input
                          value={form.region}
                          onChange={(e) => updateField("region", e.target.value)}
                          className="h-11 rounded-xl border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Postal code">
                        <Input
                          required
                          value={form.postalCode}
                          onChange={(e) => updateField("postalCode", e.target.value)}
                          className="h-11 rounded-xl border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200"
                        />
                      </Field>
                      <Field label="Country">
                        <Input
                          required
                          placeholder="e.g. United States"
                          value={form.country}
                          onChange={(e) => updateField("country", e.target.value)}
                          className="h-11 rounded-xl border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-amber-200"
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group flex h-13 w-full items-center justify-center gap-2.5 rounded-full py-4 text-base font-medium text-white shadow-lg transition-all duration-300 disabled:opacity-70"
                  style={{
                    background: "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
                    boxShadow: "0 14px 40px -16px rgba(162, 36, 25, 0.55)",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      <span>Placing your order…</span>
                    </>
                  ) : (
                    <>
                      <span>Order the {selected.name} — ${selected.priceUsd}</span>
                      <span
                        className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden
                      >
                        →
                      </span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-stone-400">
                  Ships worldwide · production begins after order confirmation
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              id="order-confirmation"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-14 max-w-lg"
            >
              <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_30px_80px_-40px_rgba(60,38,22,0.18)]">
                <div
                  className="relative flex flex-col items-center px-8 py-12 text-center"
                  style={{
                    background: "radial-gradient(circle at 30% 20%, #2a1a14 0%, #15110e 100%)",
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none text-[14rem] font-bold leading-none text-white/[0.05]"
                    style={{ fontFamily: "'Noto Serif SC', serif" }}
                  >
                    印
                  </span>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    <CheckCircle2 className="h-7 w-7" aria-hidden />
                  </div>
                  <span className="relative mt-5 text-xs uppercase tracking-[0.4em] text-amber-300/80">
                    Order confirmed
                  </span>
                  <h2
                    className="relative mt-3 text-2xl font-semibold text-white md:text-3xl"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Your {selected.name.toLowerCase()} is in production.
                  </h2>
                  <p className="relative mt-3 max-w-sm text-sm text-stone-300/80">
                    A confirmation has been noted for {form.email}. We&apos;ll begin
                    preparing your piece right away.
                  </p>
                </div>

                <div className="grid grid-cols-2 divide-x divide-stone-100 border-b border-stone-100">
                  <div className="px-6 py-5 text-center">
                    <div className="text-xs uppercase tracking-[0.25em] text-stone-400">
                      Order ID
                    </div>
                    <div className="mt-1.5 font-mono text-sm font-medium text-stone-800">
                      {result.orderId}
                    </div>
                  </div>
                  <div className="px-6 py-5 text-center">
                    <div className="text-xs uppercase tracking-[0.25em] text-stone-400">
                      Estimated delivery
                    </div>
                    <div className="mt-1.5 text-sm font-medium text-stone-800">
                      {formatDeliveryWindow(result.estimatedDeliveryDays)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 px-8 py-6">
                  <Package className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" aria-hidden />
                  <p className="text-sm leading-relaxed text-stone-500">
                    {selected.name} · shipping to {form.city}, {form.country}.{" "}
                    {result.source === "pod_mock"
                      ? "This is a demo order recorded in our system — no charge has been made."
                      : "Your order has been sent to our fulfillment partner."}
                  </p>
                </div>

                <div className="flex flex-col gap-3 px-8 pb-8 sm:flex-row">
                  <Link
                    href="/generate"
                    className="flex-1 rounded-full border border-stone-300 px-6 py-3 text-center text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                  >
                    Generate another name
                  </Link>
                  <Link
                    href="/"
                    className="flex-1 rounded-full px-6 py-3 text-center text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg, #c2392c 0%, #a32419 50%, #7e1810 100%)",
                    }}
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-stone-700">{label}</label>
        {optional && (
          <span className="text-[11px] uppercase tracking-wider text-stone-400">optional</span>
        )}
      </div>
      {children}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "#fbf6ee" }}>
      <div className="flex items-center gap-3 text-stone-600">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
        <span>Loading…</span>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderPageInner />
    </Suspense>
  );
}
