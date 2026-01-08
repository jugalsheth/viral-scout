import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { InfluencerSearchResult } from './types';

// Lazy initialization to avoid build-time errors
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});

// For server-side operations that need service role
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}

// Fast vector search (completes in <500ms)
export async function searchInfluencers(
  queryEmbedding: number[],
  maxBudget: number = 10000,
  minSimilarity: number = 0.7,
  limit: number = 10
): Promise<InfluencerSearchResult[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('match_influencers', {
    query_embedding: queryEmbedding,
    match_threshold: minSimilarity,
    match_count: limit,
    max_budget: maxBudget,
  });

  if (error) {
    console.error('Supabase search error:', error);
    throw error;
  }

  return (data || []) as InfluencerSearchResult[];
}

// Get influencer details by ID
export async function getInfluencerById(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('influencers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

