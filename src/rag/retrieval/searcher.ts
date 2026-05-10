import { vector } from "../../config/vector";
import type { RetrievedChunk } from "../../types";

export async function searchVector(query: string, topK = 10): Promise<RetrievedChunk[]> {
  const results = await vector.query({
    data: query,
    topK,
    includeMetadata: true,
  });

  return results.map((r) => ({
    id: String(r.id),
    score: r.score,
    metadata: r.metadata as unknown as RetrievedChunk["metadata"],
  }));
}