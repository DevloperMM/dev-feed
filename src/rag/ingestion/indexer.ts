import { openai } from "../../config/openai";
import { redis } from "../../config/redis";
import { vector } from "../../config/vector";
import { fetchHNStories } from "./sources/hn";
import { fetchRedditStories } from "./sources/reddit";
import { fetchGitHubStories } from "./sources/github";
import { chunkStories, type Chunk } from "./chunker";
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
  }
}

async function embedChunks(chunks: Chunk[]): Promise<void> {
  // Upstash Vector handles embedding automatically via data: field
  await Promise.all(
    chunks.map((chunk) =>
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
}

export async function runIngest(): Promise<IngestResult> {
  const results = await Promise.allSettled([
    fetchHNStories(30),
    fetchRedditStories().catch(() => []),
    fetchGitHubStories().catch(() => []),
  ]);

  const allStories: RawStory[] = results
    .filter((r): r is PromiseFulfilledResult<RawStory[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

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

  await extractTopics(savedStories);

  const unembedded = await fetchUnembeddedStories();

  if (unembedded.length === 0) {
    return { fetched: allStories.length, inserted, embedded: 0 };
  }

  const rawStories = unembedded.map((s) => ({
    source: s.source as RawStory["source"],
    externalId: s.id,
    url: s.url,
    title: s.title,
    publishedAt: s.fetchedAt,
  }));

  const chunks = chunkStories(rawStories as RawStory[]);
  await embedChunks(chunks);

  const ids = unembedded.map((s) => s.id);
  await markStoriesEmbedded(ids);

  await Promise.all(TOPIC_CACHE_KEYS.map((key) => redis.del(key)));

  return { fetched: allStories.length, inserted, embedded: ids.length };
}