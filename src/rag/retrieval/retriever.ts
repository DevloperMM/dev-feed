import { searchVector } from "./searcher";
import { rerankResults } from "./reranker";
import { fetchStoryById } from "../../db/stories";
import type { StoryWithTopics } from "../../types";

export interface RetrievalResult {
  context: string;
  stories: StoryWithTopics[];
}

export async function retrieve(query: string, topK = 5): Promise<RetrievalResult> {
  // 1. Search vector store
  const searchResults = await searchVector(query, topK * 2);

  if (searchResults.length === 0) {
    return { context: "", stories: [] };
  }

  // 2. Rerank (deduplicate by storyId)
  const reranked = rerankResults(searchResults, topK);

  // 3. Fetch full story data from Postgres
  const storyIds = reranked.map((r) => String(r.metadata.storyId)).filter(Boolean);
  const stories: StoryWithTopics[] = [];

  for (const id of storyIds) {
    try {
      const story = await fetchStoryById(id);
      if (story) stories.push(story);
    } catch {
      // Skip missing stories
    }
  }

  // 4. Format context string
  const context = stories
    .map((s, i) => `${i + 1}. ${s.title} (${s.source}) - ${s.url || "no URL"}`)
    .join("\n");

  return { context, stories };
}