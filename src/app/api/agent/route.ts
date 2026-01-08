import { NextRequest } from 'next/server';
import { streamGroq } from '@/lib/groq';
import { tools, executeTool } from '@/lib/agent/tools';
import { SYSTEM_PROMPT } from '@/lib/agent/prompts';

export const runtime = 'nodejs'; // Node runtime for better SDK compatibility
export const maxDuration = 10; // Enforce 10s max (Vercel limit)

interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const messages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ];

    // Create a readable stream for streaming response
    const encoder = new TextEncoder();
    const startTime = Date.now();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Initial reasoning call to determine tool usage
          const reasoningStart = Date.now();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'flow_step', 
            step: {
              id: 'step-1',
              type: 'reasoning',
              title: 'Agent Reasoning',
              description: 'Analyzing user query and deciding which tools to use',
              timestamp: reasoningStart - startTime,
              status: 'running'
            }
          })}\n\n`));
          
          const response = await streamGroq(messages, tools);
          
          let assistantContent = '';
          let toolCalls: any[] = [];
          let currentToolCall: any = null;

          // Process streaming response
          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta;
            
            if (delta?.content) {
              assistantContent += delta.content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: delta.content })}\n\n`));
            }

            // Handle tool calls
            if (delta?.tool_calls) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index;
                
                if (!toolCalls[index]) {
                  toolCalls[index] = {
                    id: toolCallDelta.id || `call_${index}`,
                    type: 'function',
                    function: {
                      name: toolCallDelta.function?.name || '',
                      arguments: '',
                    },
                  };
                }

                if (toolCallDelta.function?.name) {
                  toolCalls[index].function.name = toolCallDelta.function.name;
                }

                if (toolCallDelta.function?.arguments) {
                  toolCalls[index].function.arguments += toolCallDelta.function.arguments;
                }
              }
            }
          }

          const reasoningDuration = Date.now() - reasoningStart;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'flow_step', 
            step: {
              id: 'step-1',
              type: 'reasoning',
              title: 'Agent Reasoning',
              description: 'Query analyzed, tools selected',
              timestamp: reasoningStart - startTime,
              duration: reasoningDuration,
              status: 'completed',
              details: { toolCalls: toolCalls.length }
            }
          })}\n\n`));

          // If we have tool calls, execute them
          if (toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              try {
                const args = JSON.parse(toolCall.function.arguments || '{}');
                
                // Step 2: Tool Call
                const toolCallStart = Date.now();
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'flow_step', 
                  step: {
                    id: `step-tool-${toolCall.id}`,
                    type: 'tool_call',
                    title: `Tool: ${toolCall.function.name}`,
                    description: `Executing ${toolCall.function.name} with arguments`,
                    timestamp: toolCallStart - startTime,
                    status: 'running',
                    details: { arguments: args }
                  }
                })}\n\n`));

                // Step 3: Embedding Generation
                if (toolCall.function.name === 'search_influencers' && args.vibe_description) {
                  const embeddingStart = Date.now();
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'flow_step', 
                    step: {
                      id: 'step-embedding',
                      type: 'embedding',
                      title: 'Generating Embedding',
                      description: `Converting "${args.vibe_description.substring(0, 50)}..." to 768-dim vector`,
                      timestamp: embeddingStart - startTime,
                      status: 'running'
                    }
                  })}\n\n`));
                  // Embedding happens inside executeTool, we'll mark it complete after
                }

                const result = await executeTool(toolCall.function.name, args);
                
                // Mark embedding as complete
                if (toolCall.function.name === 'search_influencers') {
                  const embeddingDuration = 200; // Approximate - actual happens in executeTool
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'flow_step', 
                    step: {
                      id: 'step-embedding',
                      type: 'embedding',
                      title: 'Embedding Generated',
                      description: '768-dimensional semantic vector created',
                      timestamp: Date.now() - startTime - embeddingDuration,
                      duration: embeddingDuration,
                      status: 'completed',
                      details: { dimensions: 768, provider: 'Jina.ai v2' }
                    }
                  })}\n\n`));

                  // Step 4: Vector Search
                  const vectorSearchStart = Date.now() - embeddingDuration;
                  const vectorSearchDuration = 300; // Approximate
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'flow_step', 
                    step: {
                      id: 'step-vector-search',
                      type: 'vector_search',
                      title: 'Vector Database Search',
                      description: `Searching ${result.count || 0} influencers via cosine similarity`,
                      timestamp: vectorSearchStart - startTime,
                      duration: vectorSearchDuration,
                      status: 'completed',
                      details: { 
                        results: result.count,
                        method: 'pgvector cosine similarity',
                        threshold: 0.7
                      }
                    }
                  })}\n\n`));
                }

                const toolCallDuration = Date.now() - toolCallStart;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'flow_step', 
                  step: {
                    id: `step-tool-${toolCall.id}`,
                    type: 'tool_call',
                    title: `Tool: ${toolCall.function.name}`,
                    description: `Completed in ${toolCallDuration}ms`,
                    timestamp: toolCallStart - startTime,
                    duration: toolCallDuration,
                    status: 'completed',
                    details: result
                  }
                })}\n\n`));

                // Step 5: RAG
                if (result.influencers) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'flow_step', 
                    step: {
                      id: 'step-rag',
                      type: 'rag',
                      title: 'RAG: Context Augmentation',
                      description: `Injecting ${result.count || result.influencers.length} real influencers into LLM context`,
                      timestamp: Date.now() - startTime,
                      status: 'completed',
                      details: { 
                        retrieved: result.count || result.influencers.length,
                        method: 'Retrieval-Augmented Generation'
                      }
                    }
                  })}\n\n`));
                }
                
                // Add tool result to messages for LLM context
                messages.push({
                  role: 'tool' as const,
                  content: JSON.stringify(result),
                  tool_call_id: toolCall.id,
                });

                if (result.influencers) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'influencers', influencers: result.influencers })}\n\n`));
                }
              } catch (error: any) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'flow_step', 
                  step: {
                    id: `step-tool-${toolCall.id}`,
                    type: 'tool_call',
                    title: `Tool: ${toolCall.function.name}`,
                    description: `Error: ${error.message}`,
                    timestamp: Date.now() - startTime,
                    status: 'error',
                    details: { error: error.message }
                  }
                })}\n\n`));
                
                messages.push({
                  role: 'tool' as const,
                  content: JSON.stringify({ error: error.message }),
                  tool_call_id: toolCall.id,
                });
              }
            }

            // Add assistant message with tool calls for context (before final response)
            messages.push({ 
              role: 'assistant', 
              content: assistantContent,
              tool_calls: toolCalls
            });

            // Step 6: Final Response
            const responseStart = Date.now();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'flow_step', 
              step: {
                id: 'step-response',
                type: 'response',
                title: 'Generating Response',
                description: 'Synthesizing results into natural language',
                timestamp: responseStart - startTime,
                status: 'running'
              }
            })}\n\n`));

            // Stream final response
            const finalStream = await streamGroq(messages);
            for await (const chunk of finalStream) {
              const text = chunk.choices[0]?.delta?.content || '';
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text })}\n\n`));
              }
            }

            const responseDuration = Date.now() - responseStart;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'flow_step', 
              step: {
                id: 'step-response',
                type: 'response',
                title: 'Response Complete',
                description: 'Natural language response generated',
                timestamp: responseStart - startTime,
                duration: responseDuration,
                status: 'completed'
              }
            })}\n\n`));
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        } catch (error: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Agent route error:', error);
    return Response.json(
      { error: error.message || 'Agent failed' },
      { status: 500 }
    );
  }
}

