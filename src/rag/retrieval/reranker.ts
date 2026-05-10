import type { RetrievedChunk } from "../../types";

export function rerankResults(results: RetrievedChunk[], topK = 5): RetrievedChunk[] {
  const seen = new Map<string, RetrievedChunk>();

  // Deduplicate by storyId, keep highest score
  for (const chunk of results) {
    const storyId = String(chunk.metadata.storyId);
    const existing = seen.get(storyId);

    if (!existing || chunk.score > existing.score) {
      seen.set(storyId, chunk);
    }
  }

  // Sort by score descending and take topK
  return Array.from(seen.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}