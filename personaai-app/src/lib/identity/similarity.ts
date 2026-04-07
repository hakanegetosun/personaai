export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) {
    throw new Error("Embedding vectors must be non-empty and the same length.");
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function isBelowIdentityThreshold(
  identityScore: number | null,
  threshold: number | null
): boolean {
  if (identityScore === null) return true;
  if (threshold === null) return false;
  return identityScore < threshold;
}

export function computeFinalCandidateScore(params: {
  identityScore: number | null;
  allureScore: number | null;
  qualityScore: number | null;
  threshold: number | null;
}): number | null {
  const {
    identityScore,
    allureScore,
    qualityScore,
    threshold,
  } = params;

  if (identityScore === null || allureScore === null || qualityScore === null) {
    return null;
  }

  if (threshold !== null && identityScore < threshold) {
    return null;
  }

  return (
    identityScore * 0.6 +
    allureScore * 0.25 +
    qualityScore * 0.15
  );
}
