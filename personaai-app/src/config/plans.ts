export type PlanId = "free" | "pro" | "creator" | "agency";
export type GenerationType = "video" | "post" | "story";

export interface PlanLimits {
  video: number;
  post: number;
  story: number;
}

export interface OnDemandPricing {
  enabled: boolean;
  extraVideoPriceUsd: number;
  extraVideoPack5PriceUsd: number;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number;
  canCreatePersona: boolean;
  limits: PlanLimits;
  label: string;
  onDemand: OnDemandPricing;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    canCreatePersona: false,
    limits: { video: 0, post: 2, story: 2 },
    label: "Free Plan",
    onDemand: {
      enabled: false,
      extraVideoPriceUsd: 0,
      extraVideoPack5PriceUsd: 0,
    },
  },

  pro: {
    id: "pro",
    name: "Pro",
    price: 29,
    canCreatePersona: false,
    limits: { video: 3, post: 12, story: 12 },
    label: "Pro Plan",
    onDemand: {
      enabled: true,
      extraVideoPriceUsd: 3.79,
      extraVideoPack5PriceUsd: 16.99,
    },
  },

  creator: {
    id: "creator",
    name: "Creator",
    price: 89,
    canCreatePersona: true,
    limits: { video: 8, post: 24, story: 24 },
    label: "Creator Plan",
    onDemand: {
      enabled: true,
      extraVideoPriceUsd: 3.49,
      extraVideoPack5PriceUsd: 15.99,
    },
  },

  agency: {
    id: "agency",
    name: "Agency",
    price: 229,
    canCreatePersona: true,
    limits: { video: 20, post: 60, story: 60 },
    label: "Agency Plan",
    onDemand: {
      enabled: true,
      extraVideoPriceUsd: 3.19,
      extraVideoPack5PriceUsd: 14.99,
    },
  },
};

export function resolvePlan(planId?: string | null): PlanConfig {
  if (!planId) return PLANS.free;

  const key = planId.toLowerCase();
  if (key.includes("agency")) return PLANS.agency;
  if (key.includes("creator")) return PLANS.creator;
  if (key.includes("pro")) return PLANS.pro;

  return PLANS.free;
}
