import { NextRequest, NextResponse } from "next/server";
import { redis } from "../../../config/redis";
import { fetchStories } from "../../../db/stories";
import type { Source } from "../../../types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get("source") as Source | null;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const cacheKey = source
    ? `feed:${source.toLowerCase()}:page:${page}`
    : `feed:all:page:${page}`;

  try {
    // Check Redis cache first
    const cached = await redis.get(cacheKey) as string | null;
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // On cache miss, query Postgres
    const stories = await fetchStories({ source: source ?? undefined, page, limit });

    // Cache the result (30 min TTL)
    await redis.set(cacheKey, JSON.stringify(stories), { ex: 1800 });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Stories fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}