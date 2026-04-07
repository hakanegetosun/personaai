import {
  DEFAULT_EMBEDDING_MODEL,
  generateEmbeddingFromImage,
  normalizeEmbeddingVector,
  validateEmbeddingVector,
  type EmbeddingStatus,
} from "@/lib/identity/embedding";

export type FaceBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FaceLandmarks = {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouthLeft: { x: number; y: number };
  mouthRight: { x: number; y: number };
};

export type ReferenceSetInput = {
  primaryReferenceImageUrl: string;
  secondaryReferenceImageUrl?: string | null;
  videoSafeReferenceImageUrl?: string | null;
};

export type CanonicalProfileBuildResult = {
  canonicalFaceImageUrl: string | null;
  canonicalFaceCropUrl: string | null;
  canonicalFaceAlignedUrl: string | null;
  faceBBox: FaceBoundingBox | null;
  landmarks: FaceLandmarks | null;
  embeddingVector: number[] | null;
  embeddingStatus: EmbeddingStatus;
  embeddingModel: string;
  embeddingModelVersion: string;
  faceQualityScore: number | null;
};

export function validateReferenceSet(input: ReferenceSetInput): {
  valid: boolean;
  reason: string | null;
} {
  if (!input.primaryReferenceImageUrl) {
    return {
      valid: false,
      reason: "PRIMARY_REFERENCE_MISSING",
    };
  }

  return {
    valid: true,
    reason: null,
  };
}

/**
 * Placeholder canonical builder.
 * Gerçek yüz detect/crop/align servisleri eklenene kadar
 * veri kontratını sabit tutar.
 */
export async function buildCanonicalProfile(
  input: ReferenceSetInput
): Promise<CanonicalProfileBuildResult> {
  const validation = validateReferenceSet(input);

  if (!validation.valid) {
    return {
      canonicalFaceImageUrl: null,
      canonicalFaceCropUrl: null,
      canonicalFaceAlignedUrl: null,
      faceBBox: null,
      landmarks: null,
      embeddingVector: null,
      embeddingStatus: "failed",
      embeddingModel: DEFAULT_EMBEDDING_MODEL.model,
      embeddingModelVersion: DEFAULT_EMBEDDING_MODEL.version,
      faceQualityScore: null,
    };
  }

  const embeddingResult = await generateEmbeddingFromImage(
    input.primaryReferenceImageUrl
  );

  const vectorIsValid = validateEmbeddingVector(embeddingResult.vector);

  return {
    canonicalFaceImageUrl: input.primaryReferenceImageUrl,
    canonicalFaceCropUrl: input.primaryReferenceImageUrl,
    canonicalFaceAlignedUrl: input.primaryReferenceImageUrl,
    faceBBox: null,
    landmarks: null,
    embeddingVector: vectorIsValid
      ? normalizeEmbeddingVector(embeddingResult.vector)
      : null,
    embeddingStatus: vectorIsValid ? embeddingResult.status : "failed",
    embeddingModel: embeddingResult.modelInfo.model,
    embeddingModelVersion: embeddingResult.modelInfo.version,
    faceQualityScore: null,
  };
}
