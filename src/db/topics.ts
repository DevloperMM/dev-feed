import prisma from "../config/prisma";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function upsertTopic(name: string) {
  const slug = slugify(name);
  return prisma.topic.upsert({
    where: { name },
    update: {},
    create: { name, slug },
  });
}

export async function linkStoryToTopic(storyId: string, topicId: string) {
  return prisma.storyTopic.upsert({
    where: {
      storyId_topicId: { storyId, topicId },
    },
    update: {},
    create: { storyId, topicId },
  });
}

export async function getTrendingTopics(limit = 10) {
  return prisma.topic.findMany({
    orderBy: {
      stories: {
        _count: "desc",
      },
    },
    take: limit,
    include: {
      _count: {
        select: { stories: true },
      },
    },
  });
}