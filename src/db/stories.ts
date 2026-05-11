import prisma from "../config/prisma";
import type { Source, RawStory, StoryWithTopics } from "../types";

export async function upsertStory(story: RawStory) {
  return prisma.story.upsert({
    where: {
      source_externalId: {
        source: story.source.toUpperCase() as Source,
        externalId: story.externalId,
      },
    },
    update: {
      url: story.url,
      title: story.title,
      author: story.author ?? null,
      score: story.score,
      commentCount: story.commentCount,
      fetchedAt: story.publishedAt,
    },
    create: {
      externalId: story.externalId,
      source: story.source.toUpperCase() as Source,
      title: story.title,
      url: story.url,
      author: story.author ?? null,
      score: story.score,
      commentCount: story.commentCount,
      fetchedAt: story.publishedAt,
    },
  });
}

export async function fetchStories(options: {
  source?: Source;
  page: number;
  limit: number;
}): Promise<StoryWithTopics[]> {
  const { source, page, limit } = options;
  const skip = (page - 1) * limit;

  const stories = await prisma.story.findMany({
    where: source ? { source: source.toUpperCase() as Source } : undefined,
    skip,
    take: limit,
    orderBy: { fetchedAt: "desc" },
    include: {
      topics: {
        include: { topic: true },
      },
    },
  });

  return stories.map((s) => ({
    ...s,
    publishedAt: s.fetchedAt,
    topics: s.topics.map((t) => t.topic),
  }));
}

export async function fetchStoryById(id: string): Promise<StoryWithTopics | null> {
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      topics: {
        include: { topic: true },
      },
    },
  });

  if (!story) return null;

  return {
    ...story,
    publishedAt: story.fetchedAt,
    topics: story.topics.map((t) => t.topic),
  };
}

export async function markStoriesEmbedded(ids: string[]) {
  return prisma.story.updateMany({
    where: { id: { in: ids } },
    data: { embeddedAt: new Date() },
  });
}

export async function fetchUnembeddedStories() {
  return prisma.story.findMany({
    where: { embeddedAt: null },
    orderBy: { fetchedAt: "desc" },
    take: 100,
  });
}