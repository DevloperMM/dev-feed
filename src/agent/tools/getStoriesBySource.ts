import { fetchStories } from "../../db/stories";
import type { Source } from "../../types";

export const getStoriesBySourceSchema = {
  type: "function",
  function: {
    name: "getStoriesBySource",
    description: "Get stories from a specific source (Hacker News, Reddit, or GitHub). Use this when the user wants stories from a particular platform.",
    parameters: {
      type: "object",
      properties: {
        source: {
          type: "string",
          enum: ["HN", "REDDIT", "GITHUB"],
          description: "The source to filter by",
        },
        page: {
          type: "number",
          description: "Page number (default: 1)",
        },
        limit: {
          type: "number",
          description: "Number of stories per page (default: 10)",
        },
      },
      required: ["source"],
    },
  },
};

export async function getStoriesBySourceTool(args: {
  source: "HN" | "REDDIT" | "GITHUB";
  page?: number;
  limit?: number;
}) {
  const stories = await fetchStories({
    source: args.source.toLowerCase() as Source,
    page: args.page ?? 1,
    limit: args.limit ?? 10,
  });

  return {
    success: true,
    stories: stories.map((s) => ({
      title: s.title,
      url: s.url,
      source: s.source,
      publishedAt: s.publishedAt,
    })),
  };
}