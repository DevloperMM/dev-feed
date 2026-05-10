import { vector } from "../../config/vector";
import type { Chunk } from "./chunker";

const BATCH_SIZE = 100;

export interface EmbeddingResult {
  chunk: Chunk;
}

export async function embedChunks(chunks: Chunk[]): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    // Upstash Vector handles embedding automatically when passing data
    await Promise.all(
      batch.map((chunk) =>
        vector.upsert({
          id: `story:${chunk.storyId}`,
          data: chunk.text,
          metadata: {
            storyId: chunk.storyId,
            chunkIndex: chunk.index,
          },
        })
      )
    );

    results.push(...batch.map((chunk) => ({ chunk })));
  }

  return results;
}