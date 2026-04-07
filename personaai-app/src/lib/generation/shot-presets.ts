import type { AppPlan, MotionLevel } from "@/lib/plans/capabilities";

export type ShotMotionBudget = "low" | "medium" | "extreme";

export type ShotPreset = {
  id: string;
  label: string;
  motionBudget: ShotMotionBudget;
  cameraMovement: string;
  faceCoverage: number;
  angle: "frontal" | "near_frontal" | "three_quarter" | "slight_side";
  allowedPlans: AppPlan[];
  videoPromptDirective: string;
  imagePromptAnchor: string;
};

export const SHOT_PRESETS: Record<string, ShotPreset> = {
  talking_selfie: {
    id: "talking_selfie",
    label: "Talking Selfie",
    motionBudget: "low",
    cameraMovement: "none",
    faceCoverage: 0.45,
    angle: "frontal",
    allowedPlans: ["pro", "creator", "agency"],
    videoPromptDirective:
      "slight natural lip movement, subtle blinking, minimal head sway",
    imagePromptAnchor:
      "close-up selfie angle, smartphone camera perspective",
  },
  luxury_room_glance: {
    id: "luxury_room_glance",
    label: "Luxury Room Glance",
    motionBudget: "low",
    cameraMovement: "very_slow_push_in",
    faceCoverage: 0.35,
    angle: "near_frontal",
    allowedPlans: ["pro", "creator", "agency"],
    videoPromptDirective:
      "camera slowly pushing in, subject glances naturally",
    imagePromptAnchor:
      "luxury hotel room interior, floor to ceiling windows, ocean view",
  },
  balcony_talk: {
    id: "balcony_talk",
    label: "Balcony Talk",
    motionBudget: "medium",
    cameraMovement: "slight_handheld",
    faceCoverage: 0.3,
    angle: "three_quarter",
    allowedPlans: ["creator", "agency"],
    videoPromptDirective:
      "outdoor breeze, hair slight movement, relaxed conversation energy",
    imagePromptAnchor:
      "luxury balcony, city or ocean background, golden hour",
  },
  soft_smile_closeup: {
    id: "soft_smile_closeup",
    label: "Soft Smile Closeup",
    motionBudget: "low",
    cameraMovement: "none",
    faceCoverage: 0.55,
    angle: "frontal",
    allowedPlans: ["pro", "creator", "agency"],
    videoPromptDirective:
      "gentle smile forming, natural eye contact, minimal movement",
    imagePromptAnchor:
      "studio-quality lighting, soft fill, shallow depth of field",
  },
  seated_cafe: {
    id: "seated_cafe",
    label: "Seated Cafe",
    motionBudget: "low",
    cameraMovement: "none",
    faceCoverage: 0.28,
    angle: "slight_side",
    allowedPlans: ["pro", "creator", "agency"],
    videoPromptDirective:
      "natural seated movement, coffee cup interaction, ambient cafe energy",
    imagePromptAnchor:
      "premium cafe setting, warm ambient light, marble table",
  },
};

export function getShotPreset(shotPresetId: string): ShotPreset | null {
  return SHOT_PRESETS[shotPresetId] ?? null;
}

export function isShotAllowedForPlan(
  shotPresetId: string,
  plan: AppPlan
): boolean {
  const preset = getShotPreset(shotPresetId);
  if (!preset) return false;
  return preset.allowedPlans.includes(plan);
}

export function resolveShotMotionLevel(
  shotPresetId: string,
  plan: AppPlan
): MotionLevel | "rejected" {
  const preset = getShotPreset(shotPresetId);
  if (!preset) return "rejected";

  if (!preset.allowedPlans.includes(plan)) {
    return "rejected";
  }

  if (preset.motionBudget === "extreme") {
    return "rejected";
  }

  if (preset.motionBudget === "medium" && plan === "pro") {
    return "low";
  }

  return preset.motionBudget;
}

export function buildVideoPromptFromPreset(
  shotPresetId: string,
  motionLevel: MotionLevel
): string {
  const preset = getShotPreset(shotPresetId);

  if (!preset) {
    return "Photorealistic vertical social video, natural movement, consistent face identity throughout the clip.";
  }

  const motionMap: Record<MotionLevel, string> = {
    low: "minimal camera movement, subtle natural motion only",
    medium: "gentle camera movement, natural subject motion",
  };

  return [
    preset.videoPromptDirective,
    motionMap[motionLevel],
    "Photorealistic quality",
    "no artificial look",
    "natural skin texture",
    "face identity must remain consistent throughout the clip",
    "vertical 9:16 format",
    "social media ready",
    "no jump cuts",
    "no scene changes",
    "single continuous shot",
  ].join(", ");
}
