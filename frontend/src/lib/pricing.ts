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
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Discovery",
    tagline: "Start the journey",
    description: "Generate one personalized Chinese name and understand the story behind it.",
    priceLabel: "$0",
    amountUsd: 0,
    features: [
      "AI-generated Chinese name",
      "Meaning and cultural explanation",
      "Character breakdown",
      "Perfect for first-time visitors",
    ],
    ctaLabel: "Try It Free",
    availableStyles: [],
    resolutionLabel: "Web preview",
  },
  {
    id: "keepsake",
    name: "Keepsake Card",
    tagline: "A polished first purchase",
    description: "A refined single-style card for your first keepsake.",
    priceLabel: "$2.99",
    amountUsd: 2.99,
    features: [
      "1 premium calligraphy card",
      "Classical scroll-style composition",
      "HD PNG download",
      "Instant access after payment",
    ],
    ctaLabel: "Unlock Keepsake",
    availableStyles: ["classical"],
    resolutionLabel: "2400 × 1600 PNG",
  },
  {
    id: "signature",
    name: "Signature Collection",
    tagline: "Best for sharing and gifting",
    description: "The fuller presentation pack with all styles and sharper export quality.",
    priceLabel: "$6.99",
    amountUsd: 6.99,
    badge: "Most Popular",
    highlight: true,
    features: [
      "Everything in Keepsake",
      "3 visual styles: Classical, Modern, Seal",
      "Higher-resolution export",
      "Premium ceremonial presentation",
    ],
    ctaLabel: "Unlock Signature",
    availableStyles: ["classical", "modern", "seal"],
    resolutionLabel: "3200 × 2133 PNG",
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
