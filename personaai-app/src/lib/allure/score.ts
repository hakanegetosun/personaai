import { getAllurePreset } from "@/lib/allure/presets";
import type { AllureProfile } from "@/lib/plans/capabilities";

export type AllureHeuristicInput = {
  profile: AllureProfile;
  promptText?: string;
  hasLuxuryTerms?: boolean;
  hasBeautyTerms?: boolean;
  hasLifestyleTerms?: boolean;
  realismPreference?: boolean;
};

export function computeAllureHeuristicScore(
  input: AllureHeuristicInput
): number {
  const preset = getAllurePreset(input.profile);

  let score = 0.55;

  if (input.hasLuxuryTerms) score += 0.1;
  if (input.hasBeautyTerms) score += 0.08;
  if (input.hasLifestyleTerms) score += 0.06;
  if (input.realismPreference) score += 0.06;

  if (input.promptText) {
    const lowered = input.promptText.toLowerCase();

    if (lowered.includes("luxury")) score += 0.05;
    if (lowered.includes("soft")) score += 0.03;
    if (lowered.includes("editorial")) score += 0.04;
    if (lowered.includes("natural")) score += 0.04;
  }

  if (preset.id === "luxury_creator") score += 0.04;
  if (preset.id === "soft_creator") score += 0.02;
  if (preset.id === "intimate_lifestyle") score += 0.01;

  return clampScore(score);
}

export function clampScore(score: number): number {
  if (score < 0) return 0;
  if (score > 1) return 1;
  return Number(score.toFixed(3));
}
