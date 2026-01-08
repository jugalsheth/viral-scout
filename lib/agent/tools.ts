import { searchInfluencers } from '../supabase';
import { createQueryEmbedding } from '../groq';

export const tools = [
  {
    type: "function" as const,
    function: {
      name: "search_influencers",
      description: "Search for influencers by vibe/description and budget. Returns semantically similar creators based on content style and audience.",
      parameters: {
        type: "object",
        properties: {
          vibe_description: {
            type: "string",
            description: "Natural language description of desired influencer style/content (e.g., 'energetic morning workout vibes', 'chill evening gaming content', 'luxury lifestyle fashion')",
          },
          max_budget: {
            type: "number",
            description: "Maximum price per post in USD",
          },
          min_engagement: {
            type: "number",
            description: "Minimum engagement rate percentage (0-100)",
            default: 2.0,
          },
        },
        required: ["vibe_description", "max_budget"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "filter_by_metrics",
      description: "Filter existing influencer results by specific metrics like subscriber count or niche",
      parameters: {
        type: "object",
        properties: {
          min_subscribers: { 
            type: "number",
            description: "Minimum subscriber count" 
          },
          min_engagement: { 
            type: "number",
            description: "Minimum engagement rate percentage" 
          },
          niche: { 
            type: "string",
            description: "Content niche/category (e.g., 'fitness', 'gaming', 'lifestyle')" 
          },
        },
      },
    },
  },
];

// Tool execution (must be FAST - <2s total)
export async function executeTool(toolName: string, args: any) {
  switch (toolName) {
    case "search_influencers": {
      // Generate embedding (fast with Jina.ai - ~200ms)
      const embedding = await createQueryEmbedding(args.vibe_description);
      
      // Search database (fast with pgvector - ~300ms)
      const results = await searchInfluencers(
        embedding,
        args.max_budget,
        0.7, // min similarity
        10   // limit
      );

      // Filter by engagement if specified
      let filtered = results;
      if (args.min_engagement) {
        filtered = results.filter(
          (r) => (r.engagement_rate || 0) >= args.min_engagement
        );
      }

      return {
        success: true,
        count: filtered.length,
        influencers: filtered,
      };
    }

    case "filter_by_metrics": {
      // This would filter client-side results
      // For now, return criteria to be applied
      return {
        success: true,
        criteria: args,
        message: "Filters will be applied to search results",
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

