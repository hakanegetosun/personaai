export type EmbeddingStatus = "pending" | "processing" | "ready" | "failed";

export type EmbeddingModelInfo = {
  model: string;
  version: string;
  dimensions: number;
};

export type GeneratedEmbedding = {
  vector: number[];
  status: EmbeddingStatus;
  modelInfo: EmbeddingModelInfo;
};

export const DEFAULT_EMBEDDING_MODEL: EmbeddingModelInfo = {
  model: "arcface-r100",
  version: "v1",
  dimensions: 512,
};

export function validateEmbeddingVector(
  vector: number[],
  expectedDimensions = DEFAULT_EMBEDDING_MODEL.dimensions
): boolean {
  if (!Array.isArray(vector)) return false;
  if (vector.length !== expectedDimensions) return false;

  return vector.every((value) => Number.isFinite(value));
}

export function normalizeEmbeddingVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

  if (norm === 0) {
    return vector.map(() => 0);
  }

  return vector.map((value) => value / norm);
}

/**
 * Placeholder embedding generator.
 * Gerçek model entegrasyonu gelene kadar contract sabit kalsın diye var.
 */
export async function generateEmbeddingFromImage(
  _imageUrl: string
): Promise<GeneratedEmbedding> {
  const zeroVector = Array.from(
    { length: DEFAULT_EMBEDDING_MODEL.dimensions },
    () => 0
  );

  return {
    vector: zeroVector,
    status: "ready",
    modelInfo: DEFAULT_EMBEDDING_MODEL,
  };
}
