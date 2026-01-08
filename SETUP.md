# Setup Guide for Viral Scout

## Quick Start

### 1. Environment Variables

Your `.env.local` file should already have your credentials. Verify it exists and has:
- Supabase URL and keys
- Groq API key
- Jina API key

### 2. Database Setup

Run the setup script to see the SQL schema:

```bash
npm run setup-db
```

Copy the SQL output and run it in your Supabase SQL Editor:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Paste and execute the SQL

### 3. Seed Database

Populate the database with mock influencer data:

```bash
npm run seed
```

This will:
- Generate embeddings for 16 mock influencers
- Insert them into your Supabase database
- Take about 1-2 minutes (generating embeddings)

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Test the Agent

Try queries like:
- "Find 5 fitness influencers with morning workout vibes under $500"
- "Show me gaming influencers with chill evening content"
- "Find luxury lifestyle creators under $2000"

## Important Notes

- **Database Schema**: Make sure to run the SQL schema in Supabase first
- **Embeddings**: The seed script uses Jina.ai to generate embeddings (takes ~1-2 min)
- **Vector Dimension**: The schema uses 768 dimensions (Jina embeddings v2)
- **Build**: The app builds successfully without env vars (lazy initialization)

## Troubleshooting

### Build succeeds but runtime errors?
- Check that `.env.local` has all required keys
- Verify Supabase SQL schema was run
- Check that database was seeded

### Embedding generation fails?
- Verify `JINA_API_KEY` is set in `.env.local`
- Check Jina.ai API quota/limits

### No influencers found?
- Make sure you ran `npm run seed`
- Check Supabase dashboard to verify data exists
- Verify the SQL function `match_influencers` was created

## Next Steps

1. ✅ Run database setup
2. ✅ Seed database
3. ✅ Test locally
4. ✅ Deploy to Vercel
5. Add more influencers (customize `scripts/generate-embeddings.ts`)

