export type PaidPlanId = "keepsake" | "signature";
export type PlanId = "free" | PaidPlanId;
export type CardStyle = "classical" | "modern" | "seal";

export type PricingPlan = {
  id: PlanId;
  name: string;
  tagline: string;
  description: string;
  priceLabel: string;
  amountUsd: number;
  badge?: string;
  highlight?: boolean;
  features: string[];
  ctaLabel: string;
  availableStyles: CardStyle[];
  resolutionLabel: string;
  /** Where clicking "Unlock" should send the user. External Gumroad URL. */
  checkoutUrl?: string;
};

// Centralised so adding a new plan only touches one place. Build with
// `?wanted=true` so Gumroad jumps straight to the checkout view rather
// than the product description page.
const GUMROAD_KEEPSAKE = "https://6419390574794.gumroad.com/l/jaqhrg?wanted=true";
const GUMROAD_SIGNATURE = "https://6419390574794.gumroad.com/l/kidcrz?wanted=true";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Discovery",
    tagline: "Start the journey",
    description: "AI-composed Chinese name with 信达雅 reasoning, 5 calligraphy preview styles, and a stroke-by-stroke brush animation.",
    priceLabel: "$0",
    amountUsd: 0,
    features: [
      "AI-generated Chinese name (信达雅 standard)",
      "Cultural explanation + classical allusion",
      "5 calligraphy styles preview",
      "Watch the name written stroke by stroke",
    ],
    ctaLabel: "Try It Free",
    availableStyles: [],
    resolutionLabel: "Web preview",
  },
  {
    id: "keepsake",
    name: "Keepsake Card",
    tagline: "A polished first keepsake",
    description: "An HD calligraphy card you can keep, print, or set as a wallpaper. The pronunciation audio comes as a downloadable MP3.",
    priceLabel: "$2.99",
    amountUsd: 2.99,
    features: [
      "HD calligraphy card (PNG)",
      "Downloadable pronunciation audio",
      "Includes the classical allusion",
      "Instant unlock after payment",
    ],
    ctaLabel: "Get Keepsake",
    availableStyles: ["classical"],
    resolutionLabel: "2400 × 1600 PNG",
    checkoutUrl: GUMROAD_KEEPSAKE,
  },
  {
    id: "signature",
    name: "Signature Collection",
    tagline: "Best for sharing and gifting",
    description: "Every calligraphy style — including 篆书 and 甲骨文 — plus a downloadable MP4 of the brushstroke animation, ready for social.",
    priceLabel: "$6.99",
    amountUsd: 6.99,
    badge: "Most Popular",
    highlight: true,
    features: [
      "Everything in Keepsake",
      "All 7 calligraphy styles (incl. 篆 / 甲骨文)",
      "Brushstroke MP4 — share-ready for TikTok / IG",
      "Tattoo-ready SVG of your name",
      "Higher-resolution exports",
    ],
    ctaLabel: "Get Signature",
    availableStyles: ["classical", "modern", "seal"],
    resolutionLabel: "3200 × 2133 PNG",
    checkoutUrl: GUMROAD_SIGNATURE,
  },
];

export const PAID_PLANS = PRICING_PLANS.filter(
  (plan): plan is PricingPlan & { id: PaidPlanId } => plan.id !== "free"
);

export function getPlan(planId: string | null | undefined) {
  return PRICING_PLANS.find((plan) => plan.id === planId);
}

export function getPaidPlan(planId: string | null | undefined) {
  return PAID_PLANS.find((plan) => plan.id === planId);
}
