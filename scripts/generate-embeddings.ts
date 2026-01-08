/**
 * Generate embeddings for influencer descriptions
 * This runs LOCALLY, not on Vercel
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Use process.cwd() which will be the project root when running via npm script
config({ path: resolve(process.cwd(), '.env.local') });

import { createQueryEmbedding } from '../src/lib/groq';

// Mock influencers - Expanded dataset with diverse niches
// Optimized to stay within Supabase free tier (500 MB storage)
// Each influencer ~3.5 KB (embedding + metadata), so ~100 influencers = ~350 KB (safe for free tier)

export const mockInfluencers = [
  // Music & Metal Genre (Expanded for metal/rock queries)
  {
    channel_id: "UC_MUSIC_METAL_001",
    channel_name: "ThrashMetalCore",
    subscriber_count: 320000,
    avg_views: 120000,
    engagement_rate: 6.2,
    niche: "music",
    description: "Heavy metal, thrash metal, aggressive guitar riffs, headbanging, mosh pit energy, hard rock",
    estimated_price_per_post: 950,
  },
  {
    channel_id: "UC_MUSIC_METAL_002",
    channel_name: "BlackMetalNights",
    subscriber_count: 180000,
    avg_views: 65000,
    engagement_rate: 5.8,
    niche: "music",
    description: "Black metal, extreme metal, dark atmospheric music, aggressive vocals, intense drumming",
    estimated_price_per_post: 680,
  },
  {
    channel_id: "UC_MUSIC_ROCK_001",
    channel_name: "ClassicRockRevival",
    subscriber_count: 450000,
    avg_views: 180000,
    engagement_rate: 5.5,
    niche: "music",
    description: "Classic rock, classic rock covers, guitar solos, rock anthems, arena rock",
    estimated_price_per_post: 1400,
  },
  {
    channel_id: "UC_MUSIC_ROCK_002",
    channel_name: "HardRockNation",
    subscriber_count: 280000,
    avg_views: 95000,
    engagement_rate: 5.3,
    niche: "music",
    description: "Hard rock, heavy riffs, powerful vocals, stadium rock, energetic performances",
    estimated_price_per_post: 880,
  },
  {
    channel_id: "UC_MUSIC_POP_001",
    channel_name: "PopStarCentral",
    subscriber_count: 1200000,
    avg_views: 450000,
    engagement_rate: 7.1,
    niche: "music",
    description: "Pop music, catchy melodies, dance beats, mainstream hits, chart-topping songs",
    estimated_price_per_post: 3200,
  },
  {
    channel_id: "UC_MUSIC_LATIN_001",
    channel_name: "LatinVibesOfficial",
    subscriber_count: 850000,
    avg_views: 320000,
    engagement_rate: 6.8,
    niche: "music",
    description: "Latin pop, reggaeton, salsa, bachata, Spanish music, Latin American culture, dance music",
    estimated_price_per_post: 2800,
  },
  {
    channel_id: "UC_MUSIC_EDM_001",
    channel_name: "EDMFestivalLife",
    subscriber_count: 520000,
    avg_views: 200000,
    engagement_rate: 6.0,
    niche: "music",
    description: "Electronic dance music, EDM festivals, DJ sets, house music, trance, electronic beats",
    estimated_price_per_post: 1650,
  },
  {
    channel_id: "UC_MUSIC_HIPHOP_001",
    channel_name: "HipHopLegacy",
    subscriber_count: 680000,
    avg_views: 250000,
    engagement_rate: 6.4,
    niche: "music",
    description: "Hip hop, rap music, urban culture, beats, freestyle, hip hop lifestyle",
    estimated_price_per_post: 2100,
  },
  // Fitness (Expanded)
  {
    channel_id: "UC_FITNESS_001",
    channel_name: "FitLife Sarah",
    subscriber_count: 150000,
    avg_views: 50000,
    engagement_rate: 4.5,
    niche: "fitness",
    description: "Morning workout routines, healthy lifestyle, motivational fitness content for early risers",
    estimated_price_per_post: 450,
  },
  {
    channel_id: "UC_FITNESS_002",
    channel_name: "GymBro Mike",
    subscriber_count: 250000,
    avg_views: 80000,
    engagement_rate: 3.8,
    niche: "fitness",
    description: "Weightlifting, bodybuilding tips, muscle building content, workout splits",
    estimated_price_per_post: 650,
  },
  {
    channel_id: "UC_FITNESS_003",
    channel_name: "YogaFlow Maya",
    subscriber_count: 100000,
    avg_views: 35000,
    engagement_rate: 4.7,
    niche: "fitness",
    description: "Yoga classes, meditation, mindfulness, flexibility training, peaceful movement",
    estimated_price_per_post: 320,
  },
  {
    channel_id: "UC_FITNESS_004",
    channel_name: "CrossFit Warrior",
    subscriber_count: 220000,
    avg_views: 75000,
    engagement_rate: 4.9,
    niche: "fitness",
    description: "CrossFit workouts, high-intensity training, functional fitness, competitive training",
    estimated_price_per_post: 720,
  },
  {
    channel_id: "UC_FITNESS_005",
    channel_name: "RunningMarathonPro",
    subscriber_count: 130000,
    avg_views: 42000,
    engagement_rate: 4.6,
    niche: "fitness",
    description: "Marathon training, running tips, endurance running, race preparation, running gear",
    estimated_price_per_post: 410,
  },
  {
    channel_id: "UC_FITNESS_006",
    channel_name: "DanceFitnessQueen",
    subscriber_count: 190000,
    avg_views: 68000,
    engagement_rate: 5.1,
    niche: "fitness",
    description: "Dance fitness, Zumba, cardio dance, fun workouts, dance routines, energetic movement",
    estimated_price_per_post: 580,
  },
  // Gaming (Expanded)
  {
    channel_id: "UC_GAMING_001",
    channel_name: "ProGamer Alex",
    subscriber_count: 500000,
    avg_views: 200000,
    engagement_rate: 5.2,
    niche: "gaming",
    description: "First-person shooter gameplay, competitive gaming, tips and tricks for FPS games",
    estimated_price_per_post: 1200,
  },
  {
    channel_id: "UC_GAMING_002",
    channel_name: "ChillGamer Zoe",
    subscriber_count: 120000,
    avg_views: 40000,
    engagement_rate: 4.8,
    niche: "gaming",
    description: "Relaxed evening gaming sessions, indie game reviews, cozy gaming vibes",
    estimated_price_per_post: 350,
  },
  {
    channel_id: "UC_GAMING_003",
    channel_name: "SpeedRunner Max",
    subscriber_count: 280000,
    avg_views: 100000,
    engagement_rate: 5.0,
    niche: "gaming",
    description: "Game speedruns, record attempts, competitive gaming, intense gameplay",
    estimated_price_per_post: 750,
  },
  {
    channel_id: "UC_GAMING_004",
    channel_name: "MobileGamingMaster",
    subscriber_count: 350000,
    avg_views: 130000,
    engagement_rate: 5.4,
    niche: "gaming",
    description: "Mobile gaming, iOS games, Android gaming, mobile strategy games, on-the-go gaming",
    estimated_price_per_post: 920,
  },
  {
    channel_id: "UC_GAMING_005",
    channel_name: "RetroGamingTime",
    subscriber_count: 160000,
    avg_views: 55000,
    engagement_rate: 4.9,
    niche: "gaming",
    description: "Retro games, classic gaming, nostalgia gaming, old school games, vintage consoles",
    estimated_price_per_post: 480,
  },
  // Lifestyle (Expanded)
  {
    channel_id: "UC_LIFESTYLE_001",
    channel_name: "LuxuryLifestyle Emma",
    subscriber_count: 800000,
    avg_views: 300000,
    engagement_rate: 6.1,
    niche: "lifestyle",
    description: "High-end fashion, luxury travel, premium lifestyle content, expensive taste",
    estimated_price_per_post: 2500,
  },
  {
    channel_id: "UC_LIFESTYLE_002",
    channel_name: "MinimalistLife James",
    subscriber_count: 180000,
    avg_views: 55000,
    engagement_rate: 4.2,
    niche: "lifestyle",
    description: "Simple living, minimalism, sustainable lifestyle, decluttering tips",
    estimated_price_per_post: 480,
  },
  {
    channel_id: "UC_LIFESTYLE_003",
    channel_name: "VanLifeAdventure",
    subscriber_count: 240000,
    avg_views: 88000,
    engagement_rate: 5.2,
    niche: "lifestyle",
    description: "Van life, nomad lifestyle, off-grid living, adventure travel, mobile living",
    estimated_price_per_post: 720,
  },
  // Technology (Expanded)
  {
    channel_id: "UC_TECH_001",
    channel_name: "TechReview Pro",
    subscriber_count: 600000,
    avg_views: 250000,
    engagement_rate: 5.5,
    niche: "technology",
    description: "Latest tech reviews, gadget unboxing, smartphone comparisons, tech news",
    estimated_price_per_post: 1800,
  },
  {
    channel_id: "UC_TECH_002",
    channel_name: "CodeWizard Dev",
    subscriber_count: 200000,
    avg_views: 60000,
    engagement_rate: 4.9,
    niche: "technology",
    description: "Programming tutorials, coding challenges, software development tips, tech career advice",
    estimated_price_per_post: 520,
  },
  {
    channel_id: "UC_TECH_003",
    channel_name: "AITechExplained",
    subscriber_count: 420000,
    avg_views: 165000,
    engagement_rate: 5.8,
    niche: "technology",
    description: "Artificial intelligence, machine learning, AI tools, tech innovation, future tech",
    estimated_price_per_post: 1450,
  },
  // Food (Expanded)
  {
    channel_id: "UC_FOOD_001",
    channel_name: "ChefMaster Lisa",
    subscriber_count: 350000,
    avg_views: 120000,
    engagement_rate: 5.8,
    niche: "food",
    description: "Gourmet cooking, restaurant recipes, fine dining experiences, culinary skills",
    estimated_price_per_post: 950,
  },
  {
    channel_id: "UC_FOOD_002",
    channel_name: "BudgetEats Tom",
    subscriber_count: 140000,
    avg_views: 45000,
    engagement_rate: 4.4,
    niche: "food",
    description: "Affordable meal prep, budget-friendly recipes, quick cooking tips, college meals",
    estimated_price_per_post: 380,
  },
  {
    channel_id: "UC_FOOD_003",
    channel_name: "VeganChefMaya",
    subscriber_count: 270000,
    avg_views: 95000,
    engagement_rate: 5.5,
    niche: "food",
    description: "Vegan recipes, plant-based cooking, healthy vegan meals, cruelty-free food",
    estimated_price_per_post: 820,
  },
  {
    channel_id: "UC_FOOD_004",
    channel_name: "StreetFoodExplorer",
    subscriber_count: 380000,
    avg_views: 140000,
    engagement_rate: 6.0,
    niche: "food",
    description: "Street food, authentic cuisine, food trucks, local food culture, food adventures",
    estimated_price_per_post: 1150,
  },
  // Beauty (Expanded)
  {
    channel_id: "UC_BEAUTY_001",
    channel_name: "BeautyGuru Mia",
    subscriber_count: 750000,
    avg_views: 280000,
    engagement_rate: 6.3,
    niche: "beauty",
    description: "Makeup tutorials, skincare routines, beauty product reviews, glam looks",
    estimated_price_per_post: 2200,
  },
  {
    channel_id: "UC_BEAUTY_002",
    channel_name: "NaturalBeauty Sam",
    subscriber_count: 160000,
    avg_views: 50000,
    engagement_rate: 4.6,
    niche: "beauty",
    description: "Clean beauty, natural skincare, minimal makeup, organic products",
    estimated_price_per_post: 420,
  },
  {
    channel_id: "UC_BEAUTY_003",
    channel_name: "MakeupArtistPro",
    subscriber_count: 520000,
    avg_views: 195000,
    engagement_rate: 6.0,
    niche: "beauty",
    description: "Professional makeup, bridal makeup, special effects makeup, makeup artistry",
    estimated_price_per_post: 1650,
  },
  // Travel (Expanded)
  {
    channel_id: "UC_TRAVEL_001",
    channel_name: "Wanderlust Kate",
    subscriber_count: 420000,
    avg_views: 150000,
    engagement_rate: 5.4,
    niche: "travel",
    description: "Exotic destinations, travel vlogs, adventure tourism, bucket list locations",
    estimated_price_per_post: 1400,
  },
  {
    channel_id: "UC_TRAVEL_002",
    channel_name: "BudgetTraveler Dan",
    subscriber_count: 130000,
    avg_views: 40000,
    engagement_rate: 4.3,
    niche: "travel",
    description: "Affordable travel tips, backpacking guides, cheap destinations, travel hacks",
    estimated_price_per_post: 370,
  },
  {
    channel_id: "UC_TRAVEL_003",
    channel_name: "LuxuryTraveler",
    subscriber_count: 580000,
    avg_views: 220000,
    engagement_rate: 6.2,
    niche: "travel",
    description: "Luxury hotels, first-class travel, premium destinations, exclusive experiences",
    estimated_price_per_post: 1950,
  },
  // Fashion (New)
  {
    channel_id: "UC_FASHION_001",
    channel_name: "FashionForward",
    subscriber_count: 460000,
    avg_views: 175000,
    engagement_rate: 6.0,
    niche: "fashion",
    description: "Latest fashion trends, outfit ideas, style inspiration, fashion week coverage",
    estimated_price_per_post: 1550,
  },
  {
    channel_id: "UC_FASHION_002",
    channel_name: "SustainableFashion",
    subscriber_count: 210000,
    avg_views: 78000,
    engagement_rate: 5.2,
    niche: "fashion",
    description: "Sustainable fashion, ethical clothing, eco-friendly style, conscious fashion",
    estimated_price_per_post: 680,
  },
  // Comedy (New)
  {
    channel_id: "UC_COMEDY_001",
    channel_name: "ComedyCentral",
    subscriber_count: 890000,
    avg_views: 350000,
    engagement_rate: 7.0,
    niche: "comedy",
    description: "Funny skits, comedy sketches, humor, entertainment, viral comedy content",
    estimated_price_per_post: 2800,
  },
  {
    channel_id: "UC_COMEDY_002",
    channel_name: "StandUpComedy",
    subscriber_count: 340000,
    avg_views: 125000,
    engagement_rate: 5.9,
    niche: "comedy",
    description: "Stand-up comedy, comedy specials, joke routines, live comedy performances",
    estimated_price_per_post: 1100,
  },
  // Education (New)
  {
    channel_id: "UC_EDUCATION_001",
    channel_name: "StudySmart",
    subscriber_count: 380000,
    avg_views: 140000,
    engagement_rate: 5.7,
    niche: "education",
    description: "Study tips, exam preparation, learning strategies, academic success, student life",
    estimated_price_per_post: 1200,
  },
  {
    channel_id: "UC_EDUCATION_002",
    channel_name: "LanguageLearningPro",
    subscriber_count: 290000,
    avg_views: 105000,
    engagement_rate: 5.4,
    niche: "education",
    description: "Language learning, foreign languages, language tips, multilingual content",
    estimated_price_per_post: 850,
  },
  // Business (New)
  {
    channel_id: "UC_BUSINESS_001",
    channel_name: "EntrepreneurHub",
    subscriber_count: 510000,
    avg_views: 190000,
    engagement_rate: 6.1,
    niche: "business",
    description: "Entrepreneurship, business tips, startup advice, business strategy, success mindset",
    estimated_price_per_post: 1600,
  },
  {
    channel_id: "UC_BUSINESS_002",
    channel_name: "FinanceGuru",
    subscriber_count: 410000,
    avg_views: 155000,
    engagement_rate: 5.8,
    niche: "business",
    description: "Personal finance, investing tips, financial planning, money management, wealth building",
    estimated_price_per_post: 1350,
  },
];

async function generateEmbeddings() {
  console.log('Generating embeddings for', mockInfluencers.length, 'influencers...');
  console.log('Note: Jina.ai free tier has rate limits. Processing will pause between batches.\n');
  
  const influencersWithEmbeddings = [];
  const batchSize = 5; // Smaller batches to respect rate limits
  const delayMs = 1000; // 1 second delay between batches

  for (let i = 0; i < mockInfluencers.length; i++) {
    const influencer = mockInfluencers[i];
    try {
      console.log(`[${i + 1}/${mockInfluencers.length}] Processing ${influencer.channel_name}...`);
      const embedding = await createQueryEmbedding(influencer.description);
      influencersWithEmbeddings.push({
        ...influencer,
        embedding,
      });
      
      // Rate limiting: add delay every batchSize requests
      if ((i + 1) % batchSize === 0 && i < mockInfluencers.length - 1) {
        console.log(`  ⏸ Pausing ${delayMs}ms to respect rate limits...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error: any) {
      console.error(`  ✗ Error processing ${influencer.channel_name}:`, error.message);
      // Continue with next influencer instead of failing completely
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        console.log('  ⏸ Rate limit hit, waiting 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  return influencersWithEmbeddings;
}

// Export for use in seed script
export { generateEmbeddings };

// If run directly
if (require.main === module) {
  generateEmbeddings()
    .then((results) => {
      console.log('\n✅ Generated embeddings for', results.length, 'influencers');
      console.log('Example embedding length:', results[0]?.embedding?.length);
    })
    .catch(console.error);
}

