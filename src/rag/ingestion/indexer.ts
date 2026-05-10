import { openai } from "../../config/openai";
import { redis } from "../../config/redis";
import { fetchHNStories } from "./sources/hn";
import { fetchRedditStories } from "./sources/reddit";
import { fetchGitHubStories } from "./sources/github";
import { chunkStories } from "./chunker";
import { embedChunks } from "./embedder";
import { upsertStory, fetchUnembeddedStories, markStoriesEmbedded } from "../../db/stories";
import { upsertTopic, linkStoryToTopic } from "../../db/topics";
import type { RawStory } from "../../types";

import { Story } from "../../../prisma/generated/prisma/client";

export interface IngestResult {
  fetched: number;
  inserted: number;
  embedded: number;
}

const TOPIC_CACHE_KEYS = [
  "feed:all:page:1",
  "feed:hn:page:1",
  "feed:reddit:page:1",
  "feed:github:page:1",
];

async function extractTopics(stories: Story[]): Promise<void> {
  if (stories.length === 0) return;

  const prompt = `Extract 1-3 topic tags from these stories. Return JSON: { "topics": ["topic1", "topic2"] }
Stories:
${stories.map((s, i) => `${i + 1}. ${s.title}`).join("\n")}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return;

  try {
    // Strip markdown code blocks if present
    const jsonString = content.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonString) as { topics: string[] };
    for (const story of stories) {
      for (const topicName of data.topics.slice(0, 3)) {
        const topic = await upsertTopic(topicName.trim());
        await linkStoryToTopic(story.id, topic.id);
      }
    }
  } catch (error) {
    console.warn("Failed to parse topics JSON:", error);
    // Skip topic extraction on parse failure
  }
}

export async function runIngest(): Promise<IngestResult> {
  // 1. Fetch all sources in parallel
  const results = await Promise.allSettled([
    fetchHNStories(30),
    fetchRedditStories(30).catch(() => []),
    fetchGitHubStories(30).catch(() => []),
  ]);

  const allStories: RawStory[] = results
    .filter((r): r is PromiseFulfilledResult<RawStory[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // 2. Upsert stories to Postgres (dedup by source + externalId)
  const savedStories: Story[] = [];
  let inserted = 0;
  for (const story of allStories) {
    try {
      const saved = await upsertStory(story);
      savedStories.push(saved as unknown as Story);
      inserted++;
    } catch {
      // Skip errors
    }
  }

  // 3. Extract topics for new stories
  await extractTopics(savedStories);

  // 4. Fetch unembedded stories
  const unembedded = await fetchUnembeddedStories();

  if (unembedded.length === 0) {
    return { fetched: allStories.length, inserted, embedded: 0 };
  }

  // 5. Chunk + embed to Upstash Vector (handles embedding automatically)
  const rawStories = unembedded.map((s) => ({
    source: s.source as RawStory["source"],
    externalId: s.id,
    url: s.url,
    title: s.title,
    publishedAt: s.fetchedAt,
  }));

  const chunks = chunkStories(rawStories as RawStory[]);
  await embedChunks(chunks);

  // 6. Mark as embedded
  const ids = unembedded.map((s) => s.id);
  await markStoriesEmbedded(ids);

  // 7. Invalidate Redis feed cache
  await Promise.all(TOPIC_CACHE_KEYS.map((key) => redis.del(key)));

  return { fetched: allStories.length, inserted, embedded: ids.length };
}