"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Download, Sparkles, Shield, Zap, Heart, Star, type LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { PAID_PLANS, type PaidPlanId } from "@/lib/pricing";
import {
  applyInviteCodeToCheckoutUrl,
  getStoredInviteCode,
} from "@/lib/invite-code";
import InviteCodeField from "@/components/shared/InviteCodeField";

interface PremiumUnlockProps {
  chineseName: string;
  pinyin: string;
  meaning: string;
  classicalAllusion?: string;
}

function PremiumFeature({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/90 p-3.5 text-left">
      <div className="flex items-center gap-3 text-sm">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(220, 38, 38, 0.08))",
            border: "1px solid rgba(245, 158, 11, 0.18)",
          }}
        >
          <Icon className="w-4 h-4 text-amber-600" />
        </div>
        <span className="text-sm leading-relaxed text-stone-600">{text}</span>
      </div>
    </div>
  );
}

function TestimonialBadge() {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-stone-400">
      <div className="flex -space-x-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-white"
            style={{
              background: `linear-gradient(135deg, hsl(${i * 30 + 20}, 70%, 60%), hsl(${i * 30 + 40}, 70%, 50%))`,
            }}
          />
        ))}
      </div>
      <span>2,847 people created theirs</span>
    </div>
  );
}

function CompactFeaturePill({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-500">
      {text}
    </span>
  );
}

export default function PremiumUnlock({
  chineseName,
  pinyin,
  meaning,
  classicalAllusion,
}: PremiumUnlockProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<PaidPlanId>("signature");
  const [loadingPlanId, setLoadingPlanId] = useState<PaidPlanId | null>(null);
  const [error, setError] = useState("");

  const selectedPlan = PAID_PLANS.find((plan) => plan.id === selectedPlanId) ?? PAID_PLANS[0];

  const handleCheckout = () => {
    setError("");
    if (!selectedPlan.checkoutUrl) {
      setError("Checkout link is not configured for this plan yet.");
      return;
    }
    setLoadingPlanId(selectedPlanId);
    // External Gumroad checkout — keep a tiny delay so the spinner is visible
    // and the user doesn't think nothing happened on slower devices.
    window.setTimeout(() => {
      // Carry the generated name through Gumroad's custom-fields query so it
      // appears on the receipt and lets us match purchases to results later.
      const url = new URL(selectedPlan.checkoutUrl!);
      url.searchParams.set("chinese_name", chineseName);
      url.searchParams.set("pinyin", pinyin);
      url.searchParams.set("meaning", meaning);
      if (classicalAllusion) url.searchParams.set("classical_allusion", classicalAllusion);
      applyInviteCodeToCheckoutUrl(url, getStoredInviteCode());
      window.location.href = url.toString();
    }, 120);
  };

  return (
    <div id="premium-upgrade" className="relative w-full">
      {/* Background glow */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-15 blur-xl"
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(220, 38, 38, 0.12))",
        }}
      />

      {/* Main card */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 248, 244, 0.98))",
          border: "1px solid rgba(217, 119, 6, 0.14)",
          boxShadow: "0 24px 80px -40px rgba(146, 64, 14, 0.18)",
        }}
      >
        {/* Top decorative line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.35), rgba(185, 28, 28, 0.28), transparent)",
          }}
        />

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative p-6 md:p-7">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="relative mb-3 inline-block">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(220, 38, 38, 0.08))",
                  border: "1px solid rgba(245, 158, 11, 0.18)",
                }}
              >
                <Crown className="h-7 w-7 text-amber-600" />
              </div>
              <div
                className="absolute inset-0 rounded-2xl animate-ping"
                style={{
                  background: "rgba(245, 158, 11, 0.08)",
                  animationDuration: "3s",
                }}
              />
            </div>

            <h3 className="mb-2 text-2xl font-bold text-stone-900">
              Keep This Name as a{" "}
              <span className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
                Keepsake Card
              </span>
            </h3>

            <p className="mx-auto max-w-2xl text-sm text-stone-500">
              If this result feels right, you can turn it into a polished card without changing the main experience above.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {PAID_PLANS.map((plan) => {
              const selected = plan.id === selectedPlanId;
              return (
                <motion.button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative h-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                    selected
                      ? "border-amber-300 bg-white shadow-[0_16px_40px_-30px_rgba(245,158,11,0.3)]"
                      : "border-stone-200 bg-stone-50/95 hover:border-stone-300"
                  }`}
                >
                  {plan.badge ? (
                    <div className="mb-3 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-3 py-1 text-[11px] font-semibold text-white">
                      {plan.badge}
                    </div>
                  ) : (
                    <div className="mb-3 h-6" />
                  )}

                  <div className="mb-2 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-stone-900">{plan.name}</p>
                      <p className="mt-1 text-sm text-stone-500">{plan.tagline}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-2xl font-bold text-transparent">
                        {plan.priceLabel}
                      </div>
                      <div className="text-xs text-stone-400">one-time</div>
                    </div>
                  </div>

                  <p className="mb-3 text-sm leading-relaxed text-stone-500">
                    {plan.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {plan.features.slice(0, 3).map((feature) => (
                      <CompactFeaturePill key={feature} text={feature} />
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
                    <span>{plan.resolutionLabel}</span>
                    <span>{selected ? "Selected" : "Tap to choose"}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <PremiumFeature icon={Download} text={selectedPlan.resolutionLabel} />
            <PremiumFeature icon={Zap} text="Instant unlock after payment" />
            <PremiumFeature icon={Shield} text="Secure card payment and lifetime access" />
            <PremiumFeature
              icon={Star}
              text={
                selectedPlan.id === "signature"
                  ? "All three visual styles unlocked"
                  : "Curated single-style keepsake"
              }
            />
          </div>

          <div className="mb-5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/80 to-white p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-amber-700/80">
                  Selected Plan
                </p>
                <p className="text-lg font-semibold text-stone-900">{selectedPlan.name}</p>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-500">
                  {selectedPlan.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-500">
                  {selectedPlan.availableStyles.length} style{selectedPlan.availableStyles.length > 1 ? "s" : ""}
                </span>
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-500">
                  {selectedPlan.resolutionLabel}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-3xl font-bold text-transparent">
                    {selectedPlan.priceLabel}
                  </span>
                  <span className="text-sm text-stone-400">one-time</span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-stone-200 bg-white/90 p-3 text-sm text-stone-600">
                Your generated name <span className="font-medium text-stone-900">{chineseName}</span> will be attached to this purchase.
              </div>
              <div className="rounded-xl border border-stone-200 bg-white/90 p-3 text-sm text-stone-600">
                Includes {selectedPlan.availableStyles.join(", ")} presentation style{selectedPlan.availableStyles.length > 1 ? "s" : ""}.
              </div>
            </div>
          </div>

          <motion.button
            className="w-full md:max-w-xl md:mx-auto h-11 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-700 hover:via-red-600 hover:to-amber-600 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group relative overflow-hidden"
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleCheckout}
            disabled={loadingPlanId !== null}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            />
            {loadingPlanId ? (
              <>
                <Loader2 className="w-5 h-5 relative z-10 animate-spin" />
                <span className="relative z-10">Preparing checkout...</span>
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
                <span className="relative z-10">
                  {selectedPlan.ctaLabel} for {selectedPlan.priceLabel}
                </span>
              </>
            )}
          </motion.button>

          {error && (
            <p className="text-sm text-red-500 mt-3 text-center">{error}</p>
          )}

          {/* Invite code — collapsed by default, expands to a small input */}
          <div className="mt-4 flex justify-center">
            <InviteCodeField />
          </div>

          {/* Social proof */}
          <div className="mt-6">
            <TestimonialBadge />
          </div>

          <div className="mt-4 flex items-center justify-center gap-5 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Secure checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-500" />
              One-time purchase
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Instant unlock
            </span>
          </div>

          {/* Bottom decorative line */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.18), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
