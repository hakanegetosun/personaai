import {
  getDefaultAllureProfile,
  getAllurePreset,
} from "@/lib/allure/presets";
import type {
  GenerationRequestInput,
  GeneratedCandidate,
  GenerationSelectionResult,
} from "@/lib/generation/types";
import {
  resolveCandidateCount,
  resolveIdentityThreshold,
  resolvePlanCapabilities,
  canUseAllureMode,
  canUseIdentityLock,
  canUseRepairPipeline,
} from "@/lib/plans/capabilities";
import { computeFinalCandidateScore } from "@/lib/identity/similarity";

import {
  getShotPreset,
  resolveShotMotionLevel,
  buildVideoPromptFromPreset,
} from "@/lib/generation/shot-presets";

export type ResolvedGenerationConfig = {
  plan: GenerationRequestInput["plan"];
  contentType: GenerationRequestInput["contentType"];
  allureMode: boolean;
  identityLock: boolean;
  candidateCount: number;
  identityThreshold: number | null;
  driftAuditThreshold: number | null;
  maxRepairAttempts: number;
  allowedMotionLevels: string[];
  allureProfile: string;
  allurePresetLabel: string;
  shotPresetId: string;
  motionLevel: string;
  repairEnabled: boolean;
};

export function resolveGenerationConfig(
  input: GenerationRequestInput
): ResolvedGenerationConfig {
  const capabilities = resolvePlanCapabilities(input.plan);
  const candidateCount = resolveCandidateCount(input.plan, input.contentType);
  const identityThreshold = resolveIdentityThreshold(
    input.plan,
    input.contentType
  );

const allureEnabled = canUseAllureMode(input.plan);
const identityLockEnabled = canUseIdentityLock(input.plan);
const repairEnabled = canUseRepairPipeline(input.plan);

const shotPresetId =
  input.contentType === "reel" ? input.shotPresetId ?? "talking_selfie" : "none";

const shotPreset =
  input.contentType === "reel" ? getShotPreset(shotPresetId) : null;

const motionLevel =
  input.contentType === "reel"
    ? resolveShotMotionLevel(shotPresetId, input.plan)
    : "low";

if (input.contentType === "reel" && motionLevel === "rejected") {
  throw new Error("SHOT_NOT_ALLOWED_FOR_PLAN");
}

const videoPrompt =
  input.contentType === "reel" && motionLevel !== "rejected"
    ? buildVideoPromptFromPreset(shotPresetId, motionLevel)
    : null;

  const allureProfile = input.allureProfile ?? getDefaultAllureProfile();
  const allurePreset = getAllurePreset(allureProfile);

  return {
    plan: input.plan,
    contentType: input.contentType,
    allureMode: capabilities.canUseAllureMode && input.allureMode,
    identityLock: capabilities.canUseIdentityLock && input.identityLock,
    candidateCount,
    identityThreshold,
    driftAuditThreshold: capabilities.driftAuditThreshold,
    maxRepairAttempts: capabilities.maxRepairAttempts,
    allowedMotionLevels: capabilities.allowedMotionLevels,
    allureProfile,
    allurePresetLabel: allurePreset.label,
shotPresetId: input.shotPresetId,
    motionLevel,
    repairEnabled,
  };
}

export function scoreCandidate(params: {
  identityScore: number | null;
  allureScore: number | null;
  qualityScore: number | null;
  threshold: number | null;
}) {
  const finalScore = computeFinalCandidateScore(params);

  return {
    identityScore: params.identityScore,
    allureScore: params.allureScore,
    qualityScore: params.qualityScore,
    finalScore,
  };
}

export function selectBestCandidate(params: {
  candidates: GeneratedCandidate[];
  threshold: number | null;
}): GenerationSelectionResult {
  const { candidates, threshold } = params;

  const eligibleCandidates = candidates
    .map((candidate) => {
      const finalScore = computeFinalCandidateScore({
        identityScore: candidate.scores.identityScore,
        allureScore: candidate.scores.allureScore,
        qualityScore: candidate.scores.qualityScore,
        threshold,
      });

      return {
        ...candidate,
        scores: {
          ...candidate.scores,
          finalScore,
        },
      };
    })
    .filter((candidate) => candidate.scores.finalScore !== null)
    .sort(
      (a, b) =>
        (b.scores.finalScore ?? -1) - (a.scores.finalScore ?? -1)
    );

if (!eligibleCandidates.length) {
  return {
    selectedCandidate: null,
    candidates: candidates.map((candidate) => ({
      index: candidate.candidateIndex,
      assetUrl: candidate.assetUrl,
      identityScore: candidate.scores.identityScore,
      allureScore: candidate.scores.allureScore,
      qualityScore: candidate.scores.qualityScore,
      finalScore: candidate.scores.finalScore,
      passedIdentityGate: candidate.rejectionReason !== "BELOW_IDENTITY_THRESHOLD",
      rejectionReason: candidate.rejectionReason ?? null,
    })),
    rejectionReason: "NO_VALID_CANDIDATE",
  };
}

  const best = eligibleCandidates[0];

return {
  selectedCandidate: {
    index: best.candidateIndex,
    assetUrl: best.assetUrl,
    identityScore: best.scores.identityScore,
    allureScore: best.scores.allureScore,
    qualityScore: best.scores.qualityScore,
    finalScore: best.scores.finalScore,
    passedIdentityGate: true,
    rejectionReason: null,
  },
  candidates: candidates.map((candidate) => ({
    index: candidate.candidateIndex,
    assetUrl: candidate.assetUrl,
    identityScore: candidate.scores.identityScore,
    allureScore: candidate.scores.allureScore,
    qualityScore: candidate.scores.qualityScore,
    finalScore: candidate.scores.finalScore,
    passedIdentityGate:
      candidate.rejectionReason !== "BELOW_IDENTITY_THRESHOLD",
    rejectionReason: candidate.rejectionReason ?? null,
  })),
  rejectionReason: null,
};
}
