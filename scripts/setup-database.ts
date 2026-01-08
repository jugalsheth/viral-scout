/**
 * Setup Supabase database schema for Viral Scout
 * Run this once: npm run setup-db
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Use process.cwd() which will be the project root when running via npm script
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nLoaded env vars:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  console.error('\nMake sure .env.local exists in the project root.');
  process.exit(1);
}

const schema = `
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Influencers table
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT UNIQUE NOT NULL,
  channel_name TEXT NOT NULL,
  subscriber_count INT,
  avg_views INT,
  engagement_rate FLOAT,
  niche TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_count INT,
  estimated_price_per_post FLOAT,
  embedding VECTOR(768),  -- Jina embeddings v2 base are 768 dimensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS influencers_embedding_idx 
ON influencers USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function for similarity search
CREATE OR REPLACE FUNCTION match_influencers(
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  max_budget FLOAT DEFAULT 10000
)
RETURNS TABLE(
  id UUID,
  channel_name TEXT,
  description TEXT,
  engagement_rate FLOAT,
  estimated_price_per_post FLOAT,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT
    influencers.id,
    influencers.channel_name,
    influencers.description,
    influencers.engagement_rate,
    influencers.estimated_price_per_post,
    1 - (influencers.embedding <=> query_embedding) as similarity
  FROM influencers
  WHERE 1 - (influencers.embedding <=> query_embedding) > match_threshold
    AND (estimated_price_per_post IS NULL OR estimated_price_per_post <= max_budget)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
`;

async function setupDatabase() {
  console.log('Setting up database schema...');
  console.log('Note: This script expects you to run the SQL in Supabase SQL Editor');
  console.log('\nPlease copy and paste the following SQL into your Supabase SQL Editor:\n');
  console.log('='.repeat(80));
  console.log(schema);
  console.log('='.repeat(80));
  console.log('\nAfter running the SQL, you can seed the database with: npm run seed');
}

setupDatabase();
