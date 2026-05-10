import "dotenv/config";

if (!process.env.REDDIT_CLIENT_ID) {
  throw new Error("REDDIT_CLIENT_ID is required");
}
if (!process.env.REDDIT_CLIENT_SECRET) {
  throw new Error("REDDIT_CLIENT_SECRET is required");
}

export const redditConfig = {
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
  userAgent: process.env.REDDIT_USER_AGENT || "dev-feed/1.0",
};