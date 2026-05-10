import "dotenv/config";

if (!process.env.GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN is required");
}

export const githubConfig = {
  token: process.env.GITHUB_TOKEN,
};

export const GITHUB_SEARCH_URL = "https://api.github.com/search/code";