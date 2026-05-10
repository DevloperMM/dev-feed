import type { RawStory } from "../../../types";

// TODO: Implement GitHub Trending using search API
// - Use GITHUB_TOKEN from env for authentication
// - Query: https://api.github.com/search/repositories?q=created:>=2024-01-01&sort=stars&order=desc
// - Filter for popular repositories (stars > 100)
// - Convert to RawStory format

export async function fetchGitHubStories(_limit = 30): Promise<RawStory[]> {
  throw new Error("Not implemented: GitHub API required");
}