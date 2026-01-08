import Groq from 'groq-sdk';

// Lazy initialization to avoid build-time errors
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// Fast embedding generation using Jina.ai (free tier available)
export async function createQueryEmbedding(text: string): Promise<number[]> {
  if (!process.env.JINA_API_KEY) {
    throw new Error('JINA_API_KEY is not set');
  }

  const response = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'jina-embeddings-v2-base-en',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jina API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Fast LLM reasoning with Groq
export async function reasonWithGroq(
  messages: Array<{ role: string; content: string }>,
  tools?: any[]
) {
  const groq = getGroqClient();
  return await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // FREE and FAST
    messages: messages as any,
    tools,
    temperature: 0.7,
    max_tokens: 1024,
  });
}

// Streaming response for real-time feedback
export async function streamGroq(
  messages: Array<{ role: string; content: string }>,
  tools?: any[]
) {
  const groq = getGroqClient();
  return await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: messages as any,
    tools,
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
  });
}

export default getGroqClient;

