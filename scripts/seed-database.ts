/**
 * Seed database with mock influencer data
 * Run this once: npm run seed
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Use process.cwd() which will be the project root when running via npm script
config({ path: resolve(process.cwd(), '.env.local') });

import { getSupabaseAdmin } from '../src/lib/supabase';
import { mockInfluencers, generateEmbeddings } from './generate-embeddings';

async function seedDatabase() {
  const supabase = getSupabaseAdmin();
  
  console.log('Generating embeddings...');
  console.log('This may take a few minutes due to API rate limits...\n');
  
  const influencersWithEmbeddings = await generateEmbeddings();

  console.log(`\nSeeding database with ${influencersWithEmbeddings.length} influencers...`);
  console.log(`Estimated storage: ~${Math.round((influencersWithEmbeddings.length * 3.5) / 1024)} KB (${Math.round((influencersWithEmbeddings.length * 3.5) / 1024 / 1024 * 100) / 100} MB)`);
  console.log('Free tier limit: 500 MB, so this is well within limits!\n');

  let successCount = 0;
  let errorCount = 0;

  // Batch inserts for better performance (10 at a time)
  const batchSize = 10;
  for (let i = 0; i < influencersWithEmbeddings.length; i += batchSize) {
    const batch = influencersWithEmbeddings.slice(i, i + batchSize);
    
    try {
      const batchData = batch.map(influencer => ({
        channel_id: influencer.channel_id,
        channel_name: influencer.channel_name,
        subscriber_count: influencer.subscriber_count,
        avg_views: influencer.avg_views,
        engagement_rate: influencer.engagement_rate,
        niche: influencer.niche,
        description: influencer.description,
        estimated_price_per_post: influencer.estimated_price_per_post,
        embedding: influencer.embedding,
        video_count: Math.floor((influencer.avg_views || 0) / 10000) || 100,
      }));

      const { error } = await supabase
        .from('influencers')
        .upsert(batchData, {
          onConflict: 'channel_id',
        });

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        errorCount += batch.length;
        // Try individual inserts if batch fails
        for (const influencer of batch) {
          try {
            const { error: individualError } = await supabase
              .from('influencers')
              .upsert({
                channel_id: influencer.channel_id,
                channel_name: influencer.channel_name,
                subscriber_count: influencer.subscriber_count,
                avg_views: influencer.avg_views,
                engagement_rate: influencer.engagement_rate,
                niche: influencer.niche,
                description: influencer.description,
                estimated_price_per_post: influencer.estimated_price_per_post,
                embedding: influencer.embedding,
                video_count: Math.floor((influencer.avg_views || 0) / 10000) || 100,
              }, {
                onConflict: 'channel_id',
              });
            if (!individualError) {
              successCount++;
              errorCount--;
              console.log(`  ✓ Inserted ${influencer.channel_name}`);
            }
          } catch (err: any) {
            console.error(`  ✗ Failed ${influencer.channel_name}:`, err.message);
          }
        }
      } else {
        successCount += batch.length;
        console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(influencersWithEmbeddings.length / batchSize)} (${batch.length} influencers)`);
      }
    } catch (error: any) {
      console.error(`Error with batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errorCount += batch.length;
    }
  }

  console.log('\n✅ Seeding complete!');
  console.log(`Success: ${successCount}, Errors: ${errorCount}`);
  console.log(`\nTotal influencers in database: ${successCount}`);
  console.log(`Storage used: ~${Math.round((successCount * 3.5) / 1024)} KB`);
  console.log(`Remaining free tier storage: ~${500 - Math.round((successCount * 3.5) / 1024 / 1024 * 100) / 100} MB`);
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!process.env.JINA_API_KEY) {
  console.error('Missing JINA_API_KEY for generating embeddings');
  process.exit(1);
}

seedDatabase().catch(console.error);

