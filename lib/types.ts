export interface Influencer {
  id: string;
  channel_id: string;
  channel_name: string;
  subscriber_count?: number;
  avg_views?: number;
  engagement_rate?: number;
  niche?: string;
  description?: string;
  thumbnail_url?: string;
  video_count?: number;
  estimated_price_per_post?: number;
  similarity?: number;
}

export interface InfluencerSearchResult {
  id: string;
  channel_name: string;
  description: string;
  engagement_rate: number;
  estimated_price_per_post: number;
  similarity: number;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentResponse {
  content: string;
  reasoning?: string[];
  influencers?: InfluencerSearchResult[];
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

