import type { RawStory } from "../../../types";

// TODO: Implement Reddit OAuth2 with Redis token caching (key: `reddit:token`, TTL 55 min)
// - Use REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET from env
// - Fetch access token from https://www.reddit.com/api/v1/access_token
// - Store token in Redis with 55 min TTL
// - Use token in Authorization: Bearer <token> header
// - Fetch from r/programming hot posts

export async function fetchRedditStories(_limit = 30): Promise<RawStory[]> {
  throw new Error("Not implemented: Reddit OAuth2 required");
}