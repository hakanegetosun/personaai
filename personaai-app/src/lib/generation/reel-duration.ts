export type BoostMode = "allure" | "consistency" | null;
export type ReelDurationSeconds = 5 | 10 | 15;

export function isReelDurationAllowed(
  boost: BoostMode,
  duration: ReelDurationSeconds
): boolean {
  if (boost === "consistency" && duration === 15) {
    return false;
  }

  return true;
}

export function getSafeReelDuration(
  boost: BoostMode,
  duration: ReelDurationSeconds
): ReelDurationSeconds {
  if (!isReelDurationAllowed(boost, duration)) {
    return 10;
  }

  return duration;
}

export function shouldShow15SecWarning(
  boost: BoostMode,
  duration: ReelDurationSeconds
): boolean {
  return boost !== "consistency" && duration === 15;
}
