import { createClient } from '@supabase/supabase-js';
import type { InfluencerSearchResult } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// For server-side operations that need service role
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
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
  const { data, error } = await supabase
    .from('influencers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

