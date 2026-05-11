import type OpenAI from 'openai'

export type AIMessage =
  | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
  | { role: 'user'; content: string }
  | { role: 'tool'; content: string; tool_call_id: string }

export type ChatMessage = AIMessage

export interface ToolFn<A = unknown, T = unknown> {
  (input: { userMessage: string; toolArgs: A }): Promise<T>
}

export type Source = 'HN' | 'REDDIT' | 'GITHUB'

export interface RawStory {
  source: Source
  externalId: string
  url: string | null
  title: string
  content?: string
  author?: string | null
  publishedAt: Date
  score: number
  commentCount: number
}

export interface VectorMetadata {
  storyId: string
  source: Source
  title: string
  url: string
  score: number
  chunkIndex: number
}

export interface RetrievedChunk {
  id: string
  score: number
  metadata: VectorMetadata
}

export interface Topic {
  id: string
  name: string
  slug: string
}

export interface StoryWithTopics {
  id: string
  source: Source
  externalId: string
  url: string | null
  title: string
  content?: string
  author?: string | null
  publishedAt: Date
  createdAt: Date
  embeddedAt: Date | null
  score: number
  commentCount: number
  topics: Topic[]
}

export interface IngestResponse {
  fetched: number
  inserted: number
  embedded: number
}

export interface StoriesQuery {
  source?: Source
  page: number
  limit: number
}

export interface Chunk {
  storyId: string
  text: string
  index: number
}