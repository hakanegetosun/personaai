export type AppPlan = "pro" | "creator" | "agency";
export type ContentType = "post" | "story" | "reel";
export type MotionLevel = "low" | "medium";
export type AllureProfile =
  | "soft_creator"
  | "luxury_creator"
  | "intimate_lifestyle";

export type PlanCapabilities = {
  plan: AppPlan;
  canUseAllureMode: boolean;
  canUseIdentityLock: boolean;
  canUseRepairPipeline: boolean;
  candidateCountImage: number;
  candidateCountVideoStill: number;
  imageIdentityThreshold: number | null;
  videoIdentityThreshold: number | null;
  driftAuditThreshold: number | null;
  maxRepairAttempts: number;
  allowedMotionLevels: MotionLevel[];
  traceRetentionDays: number | null;
};

const PLAN_CAPABILITIES: Record<AppPlan, PlanCapabilities> = {
  pro: {
    plan: "pro",
    canUseAllureMode: true,
    canUseIdentityLock: false,
    canUseRepairPipeline: false,
    candidateCountImage: 2,
    candidateCountVideoStill: 2,
    imageIdentityThreshold: null,
    videoIdentityThreshold: null,
    driftAuditThreshold: null,
    maxRepairAttempts: 0,
    allowedMotionLevels: ["low"],
    traceRetentionDays: null,
  },
  creator: {
    plan: "creator",
    canUseAllureMode: true,
    canUseIdentityLock: true,
    canUseRepairPipeline: false,
    candidateCountImage: 4,
    candidateCountVideoStill: 4,
    imageIdentityThreshold: 0.78,
    videoIdentityThreshold: 0.72,
    driftAuditThreshold: 0.68,
    maxRepairAttempts: 0,
    allowedMotionLevels: ["low", "medium"],
    traceRetentionDays: 7,
  },
  agency: {
    plan: "agency",
    canUseAllureMode: true,
    canUseIdentityLock: true,
    canUseRepairPipeline: true,
    candidateCountImage: 6,
    candidateCountVideoStill: 6,
    imageIdentityThreshold: 0.82,
    videoIdentityThreshold: 0.76,
    driftAuditThreshold: 0.72,
    maxRepairAttempts: 2,
    allowedMotionLevels: ["low", "medium"],
    traceRetentionDays: 30,
  },
};

export function resolvePlanCapabilities(plan: AppPlan): PlanCapabilities {
  return PLAN_CAPABILITIES[plan];
}

export function canUseAllureMode(plan: AppPlan): boolean {
  return PLAN_CAPABILITIES[plan].canUseAllureMode;
}

export function canUseIdentityLock(plan: AppPlan): boolean {
  return PLAN_CAPABILITIES[plan].canUseIdentityLock;
}

export function canUseRepairPipeline(plan: AppPlan): boolean {
  return PLAN_CAPABILITIES[plan].canUseRepairPipeline;
}

export function resolveCandidateCount(
  plan: AppPlan,
  contentType: ContentType
): number {
  const capabilities = PLAN_CAPABILITIES[plan];
  return contentType === "reel"
    ? capabilities.candidateCountVideoStill
    : capabilities.candidateCountImage;
}

export function resolveIdentityThreshold(
  plan: AppPlan,
  contentType: ContentType
): number | null {
  const capabilities = PLAN_CAPABILITIES[plan];
  return contentType === "reel"
    ? capabilities.videoIdentityThreshold
    : capabilities.imageIdentityThreshold;
}

export function resolveDriftAuditThreshold(plan: AppPlan): number | null {
  return PLAN_CAPABILITIES[plan].driftAuditThreshold;
}

export function resolveMaxRepairAttempts(plan: AppPlan): number {
  return PLAN_CAPABILITIES[plan].maxRepairAttempts;
}

export function resolveTraceRetentionDays(plan: AppPlan): number | null {
  return PLAN_CAPABILITIES[plan].traceRetentionDays;
}

export function canUseMotionLevel(
  plan: AppPlan,
  motionLevel: MotionLevel
): boolean {
  return PLAN_CAPABILITIES[plan].allowedMotionLevels.includes(motionLevel);
}

export function resolveMotionLevel(
  plan: AppPlan,
  requested: "low" | "medium" | "extreme"
): MotionLevel | "rejected" {
  if (requested === "extreme") return "rejected";
  if (PLAN_CAPABILITIES[plan].allowedMotionLevels.includes(requested)) {
    return requested;
  }
  return "low";
}
