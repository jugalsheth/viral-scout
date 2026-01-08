# 🚀 Viral Scout - AI Agent for Influencer Discovery

> *"I build because I'm curious. I make mistakes because I'm human. And I keep building because that's where the magic happens."*

## ✨ What is This?

Viral Scout is my exploration into the world of AI agents—a semantic search engine that finds influencers not by keywords, but by *vibe*. It's built with curiosity, fueled by late-night coding sessions, and refined through countless iterations (and yes, plenty of mistakes along the way).

This project represents my passion for pushing boundaries: combining vector embeddings, real-time streaming, and agent orchestration to create something that feels almost magical when it works.

## 🎯 Why I Built This

I've always been fascinated by how AI can understand *intent* rather than just matching words. When you ask for "fitness influencers with morning workout vibes," you're not looking for someone who literally says "morning workout"—you're looking for a *feeling*, a *style*, a *vibe*.

That curiosity led me down a rabbit hole:
- How do we make semantic search fast enough for real-time use?
- Can we build an AI agent that reasons through queries like a human?
- What happens when we combine streaming responses with vector search?

This project is my answer to those questions. It's not perfect, but it's *mine*—built with passion, curiosity, and a healthy dose of "let's see what happens if I try this."

## 🧠 The Tech Behind the Magic

### The Stack
- **Next.js 14** - Because I love the App Router and TypeScript
- **Groq API** - Free tier, blazing fast LLM responses (seriously, it's incredible)
- **Jina.ai** - Embeddings that actually understand context
- **Supabase + pgvector** - PostgreSQL with vector superpowers
- **LangGraph** - For when I want to orchestrate complex agent workflows

### How It Works

1. **You ask a question** - "Find gaming influencers with chill evening content"
2. **The agent reasons** - It understands you want gaming creators, but specifically those with a relaxed, evening vibe
3. **Semantic search** - Vector embeddings find influencers by *meaning*, not keywords
4. **Real-time streaming** - Watch the agent think and respond in real-time

The whole thing happens in under 5 seconds. That's the magic of modern AI infrastructure.

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ (I use 20, but 18 should work)
- A Supabase account (free tier is perfect)
- A Groq API key (also free!)
- A Jina.ai API key (free tier available)

### Installation

```bash
# Clone it
git clone https://github.com/jugalsheth/viral-scout.git
cd viral-scout

# Install dependencies
npm install

# Set up your environment
cp .env.example .env.local
# Then fill in your keys (see below)
```

### Environment Variables

Create a `.env.local` file:

```env
# Supabase (get from your project settings)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq (get from console.groq.com - it's free!)
GROQ_API_KEY=your_groq_key

# Jina.ai (get from jina.ai - free tier available)
JINA_API_KEY=your_jina_key

# LangSmith (optional - for debugging agent flows)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langchain_key
LANGCHAIN_PROJECT=viral-scout
```

### Database Setup

1. Go to your Supabase project → SQL Editor
2. Run the SQL from `scripts/setup-database.ts`:
   ```bash
   npm run setup-db
   ```
   Copy the SQL output and paste it into Supabase SQL Editor

### Seed the Database

Populate with some mock influencer data to play with:

```bash
npm run seed
```

This will:
- Generate embeddings for all influencer descriptions
- Insert them into your Supabase database
- Make them searchable via vector similarity

### Run It!

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start asking questions!

## 💡 Usage Examples

Try asking things like:

- *"Find 5 fitness influencers with morning workout vibes under $500"*
- *"Show me gaming influencers with chill evening content under $1000"*
- *"Find luxury lifestyle creators for a high-end fashion campaign"*
- *"Search for tech reviewers with budget-friendly appeal"*

The agent will reason through your query, search semantically, and return results that match the *vibe* you're looking for.

## 🏗️ Project Structure

```
viral-scout/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/route.ts      # Main agent endpoint (optimized for speed)
│   │   │   └── health/route.ts     # Health check
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx   # Main chat UI
│   │   │   ├── ThinkingDisplay.tsx # Watch the agent think
│   │   │   ├── InfluencerCard.tsx  # Beautiful result cards
│   │   │   └── StreamingText.tsx   # Real-time streaming
│   │   └── page.tsx
│   └── lib/
│       ├── groq.ts                 # Groq client with streaming
│       ├── supabase.ts             # Supabase + vector search
│       ├── types.ts                # TypeScript interfaces
│       └── agent/
│           ├── tools.ts            # Agent tool definitions
│           ├── graph.ts            # Agent workflow (LangGraph)
│           └── prompts.ts          # System prompts
├── scripts/
│   ├── setup-database.ts           # SQL schema generator
│   ├── generate-embeddings.ts     # Embedding generation
│   └── seed-database.ts            # Database seeding
└── package.json
```

## ⚡ Performance

I've optimized this for Vercel's 10-second timeout limit:

- **Vector search**: <500ms (pgvector is *fast*)
- **Groq LLM call**: 1-2s (seriously, it's incredible)
- **Jina embeddings**: ~200ms per query
- **Total API response**: 3-5s ✅

Everything streams in real-time, so you see results as they come in.

## 🎨 What I Learned

Building this taught me:

1. **Semantic search is powerful** - When done right, it feels like magic
2. **Streaming matters** - Real-time feedback makes AI feel more human
3. **Constraints breed creativity** - The 10s Vercel limit forced me to optimize
4. **Mistakes are features** - Every bug taught me something new

## 🚧 What's Next?

I'm always tinkering. Current ideas:

- [ ] Add LangGraph for more complex agent workflows
- [ ] Implement multi-turn conversations
- [ ] Add influencer analytics and insights
- [ ] Build a recommendation engine
- [ ] Add support for multiple platforms (TikTok, Instagram, etc.)

But honestly? I'll probably get distracted by a new idea and build something completely different. That's the beauty of curiosity-driven development.

## 🤝 Contributing

This is a personal project, but I'm always open to:
- Ideas and suggestions
- Bug reports (I make plenty of mistakes!)
- Discussions about AI agents and semantic search

Feel free to open an issue or start a conversation!

## 📝 License

MIT - Do whatever you want with it. Build something cool. Make mistakes. Learn. That's what it's all about.

## 🙏 Acknowledgments

- **Groq** - For making LLM inference fast and free
- **Supabase** - For making PostgreSQL + vectors accessible
- **Jina.ai** - For embeddings that actually work
- **The AI community** - For all the open-source tools and knowledge

---

*Built with curiosity, fueled by coffee, and refined through mistakes. That's how the best things are made.*

**Questions? Ideas? Want to chat about AI agents?**  
Open an issue or reach out. I love talking about this stuff.

---

⭐ *If you found this interesting, consider giving it a star. It makes my day.*