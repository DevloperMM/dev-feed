import OpenAI from 'openai'

export type ChatMessage =
  | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
  | { role: 'user'; content: string }
  | { role: 'tool'; content: string; tool_call_id: string }

export interface ChatRequest {
  messages: ChatMessage[];
}

export type Source = "HN" | "REDDIT" | "GITHUB";

export interface RawStory {
  source: Source;
  externalId: string;
  url: string;
  title: string;
  content?: string;
  author?: string;
  publishedAt: Date;
}

export interface VectorMetadata {
  storyId: number;
  source: Source;
  title: string;
  url: string;
  author?: string;
  publishedAt: Date;
}

export interface RetrievedChunk {
  id: string;
  score: number;
  metadata: VectorMetadata;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
}

export interface StoryWithTopics {
  id: number;
  source: Source;
  externalId: string;
  url: string;
  title: string;
  content?: string;
  author?: string;
  publishedAt: Date;
  createdAt: Date;
  embeddedAt: Date | null;
  topics: Topic[];
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface IngestResponse {
  fetched: number;
  inserted: number;
  embedded: number;
}

export interface StoriesQuery {
  source?: Source;
  page: number;
  limit: number;
}

