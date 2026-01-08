import { StateGraph, END, START } from "@langchain/langgraph";
import { reasonWithGroq, streamGroq } from '../groq';
import { tools, executeTool } from './tools';
import { SYSTEM_PROMPT } from './prompts';
import type { AgentMessage } from '../types';

interface AgentState {
  messages: AgentMessage[];
  reasoning: string[];
  influencers: any[];
  toolCalls: any[];
}

// Simple agent workflow optimized for speed
export async function runAgent(userQuery: string): Promise<{
  content: string;
  reasoning: string[];
  influencers: any[];
}> {
  const reasoning: string[] = [];
  const influencers: any[] = [];

  reasoning.push("Understanding user request...");

  // Step 1: Initial reasoning call to determine tool usage
  const messages: AgentMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userQuery },
  ];

  try {
    const response = await reasonWithGroq(messages, tools);
    const assistantMessage = response.choices[0]?.message;

    reasoning.push("Analyzing requirements...");

    // Check for tool calls
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');

        reasoning.push(`Using ${toolName} tool...`);

        try {
          const result = await executeTool(toolName, args);
          
          if (result.influencers) {
            influencers.push(...result.influencers);
            reasoning.push(`Found ${result.count} matching influencers`);
          }

          // Add tool result to messages for follow-up
          messages.push({
            role: "assistant",
            content: assistantMessage.content || "",
          });
          messages.push({
            role: "tool",
            content: JSON.stringify(result),
          });
        } catch (error: any) {
          reasoning.push(`Error: ${error.message}`);
        }
      }
    }

    // Step 2: Final response with results
    const finalResponse = await reasonWithGroq(messages);
    const finalContent = finalResponse.choices[0]?.message?.content || assistantMessage?.content || "I couldn't process that request.";

    reasoning.push("Generating recommendations...");

    return {
      content: finalContent,
      reasoning,
      influencers,
    };
  } catch (error: any) {
    return {
      content: `Error: ${error.message}`,
      reasoning: [...reasoning, `Error occurred: ${error.message}`],
      influencers: [],
    };
  }
}

// Streaming version for real-time feedback
export async function* streamAgent(userQuery: string): AsyncGenerator<string, void, unknown> {
  const messages: AgentMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userQuery },
  ];

  // First, check if we need to use tools
  const initialResponse = await reasonWithGroq(messages, tools);
  const assistantMessage = initialResponse.choices[0]?.message;

  // Stream initial reasoning
  if (assistantMessage?.content) {
    yield assistantMessage.content;
  }

  // Execute tools if needed
  if (assistantMessage?.tool_calls) {
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments || '{}');

      try {
        const result = await executeTool(toolName, args);
        
        // Add results to conversation
        messages.push({
          role: "assistant",
          content: assistantMessage.content || "",
        });
        messages.push({
          role: "tool",
          content: JSON.stringify(result),
        });
      } catch (error) {
        // Continue streaming even if tool fails
      }
    }
  }

  // Stream final response
  const stream = await streamGroq(messages);
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || '';
    if (text) {
      yield text;
    }
  }
}

