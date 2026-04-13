export type BoostMode = "standard" | "allure_boost" | "extra_consistency";

export function resolveBoostMode(input: {
  allureBoost: boolean;
  extraConsistency: boolean;
}): BoostMode {
  if (input.extraConsistency) return "extra_consistency";
  if (input.allureBoost) return "allure_boost";
  return "standard";
}

export function getBoostPriceUsd(mode: BoostMode): number | null {
  if (mode === "allure_boost") return 8.99;
  if (mode === "extra_consistency") return 10.99;
  return null;
}
