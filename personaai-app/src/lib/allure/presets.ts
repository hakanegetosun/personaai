import type { AllureProfile } from "@/lib/plans/capabilities";

export type AllurePreset = {
  id: AllureProfile;
  label: string;
  description: string;
  lighting: string[];
  framing: string[];
  skinFinish: string[];
  vibe: string[];
  negativeDirectives: string[];
};

export const ALLURE_PRESETS: Record<AllureProfile, AllurePreset> = {
  soft_creator: {
    id: "soft_creator",
    label: "Soft Creator",
    description:
      "Natural creator beauty, soft light, believable premium social aesthetic.",
    lighting: [
      "soft window light",
      "gentle facial highlights",
      "balanced exposure",
    ],
    framing: [
      "phone-native framing",
      "clean close-up composition",
      "social-first portrait balance",
    ],
    skinFinish: [
      "natural skin texture",
      "light polish",
      "realistic detail retention",
    ],
    vibe: [
      "approachable",
      "premium",
      "modern creator energy",
    ],
    negativeDirectives: [
      "avoid plastic skin",
      "avoid uncanny facial symmetry",
      "avoid over-airbrushed beauty look",
    ],
  },
  luxury_creator: {
    id: "luxury_creator",
    label: "Luxury Creator",
    description:
      "Higher-end premium beauty, polished framing, upscale aspirational look.",
    lighting: [
      "editorial soft glam lighting",
      "luxury ambient highlights",
      "clean premium contrast",
    ],
    framing: [
      "premium portrait framing",
      "luxury lifestyle composition",
      "elevated close-medium shot balance",
    ],
    skinFinish: [
      "refined skin rendering",
      "premium polish",
      "high-end beauty realism",
    ],
    vibe: [
      "aspirational",
      "magnetic",
      "confident premium creator presence",
    ],
    negativeDirectives: [
      "avoid fashion-doll face",
      "avoid identity drift toward generic beauty model",
      "avoid exaggerated glamour makeup unless explicitly requested",
    ],
  },
  intimate_lifestyle: {
    id: "intimate_lifestyle",
    label: "Intimate Lifestyle",
    description:
      "Warm, close, believable lifestyle beauty with relaxed social intimacy.",
    lighting: [
      "warm natural interior light",
      "soft depth and warmth",
      "subtle lifestyle realism",
    ],
    framing: [
      "casual close framing",
      "natural handheld feel",
      "personal social perspective",
    ],
    skinFinish: [
      "real skin detail",
      "gentle softness",
      "non-artificial facial rendering",
    ],
    vibe: [
      "personal",
      "warm",
      "emotionally engaging",
    ],
    negativeDirectives: [
      "avoid artificial studio stiffness",
      "avoid over-sharpened facial features",
      "avoid identity drift caused by over-stylization",
    ],
  },
};

export function getAllurePreset(profile: AllureProfile): AllurePreset {
  return ALLURE_PRESETS[profile];
}

export function getDefaultAllureProfile(): AllureProfile {
  return "soft_creator";
}
