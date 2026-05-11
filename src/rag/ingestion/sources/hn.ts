import type { RawStory } from "../../../types";

const HN_API_URL = "https://hacker-news.firebaseio.com/v0";

interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  descendants: number;
  by: string;
  time: number;
}

export async function fetchHNStories(limit = 30): Promise<RawStory[]> {
  const response = await fetch(`${HN_API_URL}/topstories.json`)

  if (!response.ok) {
    throw new Error(`HN API failed: ${response.status}`);
  }

  const ids: number[] = await response.json();
  const storyIds = ids.slice(0, limit);

  const stories = await Promise.allSettled(
    storyIds.map((id) => fetchHNStory(id))
  );

  return stories
    .filter((r): r is PromiseFulfilledResult<HNStory> => r.status === "fulfilled")
    .map((r) => ({
      source: "HN" as const,
      externalId: String(r.value.id),
      url: r.value.url || `https://news.ycombinator.com/item?id=${r.value.id}`,
      title: r.value.title,
      author: r.value.by,
      publishedAt: new Date(r.value.time * 1000),
      score: r.value.score,
      commentCount: r.value.descendants ?? 0,
    })) as RawStory[];
}

async function fetchHNStory(id: number): Promise<HNStory> {
  const response = await fetch(`${HN_API_URL}/item/${id}.json`);

  if (!response.ok) {
    throw new Error(`HN story ${id} failed: ${response.status}`);
  }

  return response.json();
}