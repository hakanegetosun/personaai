export type ProviderRoute = "standard" | "allure_boost" | "extra_consistency";

export function isStandardRoute(route: string | null | undefined): route is "standard" {
  return route === "standard";
}

export function isAllureBoostRoute(route: string | null | undefined): route is "allure_boost" {
  return route === "allure_boost";
}

export function isExtraConsistencyRoute(
  route: string | null | undefined
): route is "extra_consistency" {
  return route === "extra_consistency";
}

export function normalizeProviderRoute(route: string | null | undefined): ProviderRoute {
  if (route === "extra_consistency") return "extra_consistency";
  if (route === "allure_boost") return "allure_boost";
  return "standard";
}
