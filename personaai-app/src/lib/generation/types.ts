import type {
  AppPlan,
  ContentType,
  AllureProfile,
} from "@/lib/plans/capabilities";

export type GenerationStatus =
  | "queued"
  | "reference_resolving"
  | "generating"
  | "scoring"
  | "selecting"
  | "video_generating"
  | "drift_auditing"
  | "repairing"
  | "completed"
  | "failed"
  | "rejected";

export type GenerationRequestInput = {
  personaId: string;
  userId: string;
  plan: AppPlan;
  contentType: ContentType;
  shotPresetId: string;
  prompt?: string;
  allureMode: boolean;
  identityLock: boolean;
  allureProfile?: AllureProfile;
};

export type CandidateScore = {
  identityScore: number | null;
  allureScore: number | null;
  qualityScore: number | null;
  finalScore: number | null;
};

export type GeneratedCandidate = {
  candidateIndex: number;
  assetUrl: string;
  selected: boolean;
  rejectionReason?: string | null;
  scores: CandidateScore;
};

export type GenerationSelectionResult = {
  selectedCandidate: GenerationCandidate | null;
  candidates: GenerationCandidate[];
  rejectionReason: string | null;
};

export type ReferenceSet = {
  primaryReferenceImageUrl: string;
  secondaryReferenceImageUrl?: string | null;
  videoSafeReferenceImageUrl?: string | null;
  referenceSetVersion: string;
};

export type CanonicalIdentityProfile = {
  personaId: string;
  canonicalFaceImageUrl?: string | null;
  canonicalFaceCropUrl?: string | null;
  canonicalFaceAlignedUrl?: string | null;
  embeddingStatus: "pending" | "processing" | "ready" | "failed";
  embeddingVector?: number[] | null;
};

export type GenerationCandidate = {
  index: number;
  assetUrl: string;
  identityScore: number | null;
  allureScore: number | null;
  qualityScore: number | null;
  finalScore: number | null;
  passedIdentityGate: boolean;
  rejectionReason: string | null;
};
