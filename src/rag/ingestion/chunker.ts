import type { RawStory } from "../../types";

export interface Chunk {
  storyId: string;
  index: number;
  text: string;
}

export function chunkStory(story: RawStory): Chunk[] {
  // Single chunk per story - extensible design for future multi-chunk
  const text = `${story.title}${story.url ? ` ${story.url}` : ""}`;
  return [
    {
      storyId: story.externalId,
      index: 0,
      text,
    },
  ];
}

export function chunkStories(stories: RawStory[]): Chunk[] {
  return stories.flatMap(chunkStory);
}