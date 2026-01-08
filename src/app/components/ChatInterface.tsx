'use client';

import { useState, useRef, useEffect } from 'react';
import StreamingText from './StreamingText';
import ThinkingDisplay from './ThinkingDisplay';
import InfluencerCard from './InfluencerCard';
import AgentFlowVisualizer from './AgentFlowVisualizer';
import type { InfluencerSearchResult, AgentFlowStep } from '@/lib/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  influencers?: InfluencerSearchResult[];
  thinking?: string[];
  flowSteps?: AgentFlowStep[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentInfluencers, setCurrentInfluencers] = useState<InfluencerSearchResult[]>([]);
  const [thinking, setThinking] = useState<string[]>([]);
  const [currentFlowSteps, setCurrentFlowSteps] = useState<AgentFlowStep[]>([]);
  const [showEducationalMode, setShowEducationalMode] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setCurrentResponse('');
    setCurrentInfluencers([]);
    setThinking([]);
    setCurrentFlowSteps([]);

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Use refs to track current values for finalization
      let accumulatedResponse = '';
      let accumulatedInfluencers: InfluencerSearchResult[] = [];
      let accumulatedThinking: string[] = [];
      const flowStepsMap = new Map<string, AgentFlowStep>();
      let finalizeCalled = false;
      let buffer = ''; // Buffer for incomplete SSE messages
      
      const finalizeMessage = () => {
        if (finalizeCalled) return;
        finalizeCalled = true;
        
        // Convert flow steps map to array, sorted by timestamp
        const finalFlowSteps = Array.from(flowStepsMap.values()).sort((a, b) => a.timestamp - b.timestamp);
        
        // Use accumulated values instead of state (which might be stale in closure)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: accumulatedResponse,
            influencers: accumulatedInfluencers,
            thinking: accumulatedThinking,
            flowSteps: finalFlowSteps,
          },
        ]);
        setCurrentResponse('');
        setCurrentInfluencers([]);
        setThinking([]);
        setCurrentFlowSteps([]);
        setLoading(false);
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Stream ended - finalize the message with current accumulated values
            finalizeMessage();
            break;
          }

          // Decode chunk and add to buffer (SSE messages may be split across chunks)
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete SSE messages (format: "data: {...}\n\n")
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue; // Skip empty data lines
                
                const data = JSON.parse(jsonStr);
                
                switch (data.type) {
                  case 'content':
                    accumulatedResponse += data.text || '';
                    setCurrentResponse(accumulatedResponse);
                    break;
                  case 'thinking':
                    if (data.text) {
                      accumulatedThinking.push(data.text);
                      setThinking([...accumulatedThinking]);
                    }
                    break;
                  case 'influencers':
                    if (data.influencers && Array.isArray(data.influencers)) {
                      accumulatedInfluencers = [...accumulatedInfluencers, ...data.influencers];
                      setCurrentInfluencers(accumulatedInfluencers);
                    }
                    break;
                  case 'flow_step':
                    if (data.step) {
                      const step: AgentFlowStep = data.step;
                      // Update or add step to map
                      flowStepsMap.set(step.id, step);
                      // Update current flow steps state
                      const updatedSteps = Array.from(flowStepsMap.values()).sort((a, b) => a.timestamp - b.timestamp);
                      setCurrentFlowSteps([...updatedSteps]);
                    }
                    break;
                  case 'done':
                    // Finalize message
                    finalizeMessage();
                    break;
                  case 'error':
                    throw new Error(data.error || 'Unknown error');
                }
              } catch (e) {
                // Skip invalid JSON - don't break the stream
                console.warn('Failed to parse SSE data:', line, e);
              }
            }
          }
        }
      } catch (error: any) {
        console.error('Stream error:', error);
        // Finalize with whatever we have so far
        finalizeMessage();
      } finally {
        // Ensure loading is reset even if stream errors
        if (!finalizeCalled) {
        setLoading(false);
        setCurrentResponse('');
        setCurrentInfluencers([]);
        setThinking([]);
        setCurrentFlowSteps([]);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message}`,
        },
      ]);
      setLoading(false);
      setCurrentResponse('');
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Educational Mode Toggle */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={showEducationalMode}
            onChange={(e) => setShowEducationalMode(e.target.checked)}
            className="rounded"
          />
          <span className="font-semibold">🔬 Educational Mode</span>
          <span className="text-xs text-gray-500">Show agent flow, tools, vector DB, RAG pipeline</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <h2 className="text-2xl font-bold mb-2">Welcome to Viral Scout</h2>
            <p>Ask me to find influencers for your campaign!</p>
            <p className="text-sm mt-2">
              Try: "Find 5 fitness influencers with morning workout vibes under $500"
            </p>
            {showEducationalMode && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-2xl mx-auto text-left">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">🎓 Educational Mode Active</h3>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  When you ask a question, you'll see the complete agent flow:
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-400 mt-2 space-y-1 list-disc list-inside">
                  <li>Agent reasoning loop (LLM decision-making)</li>
                  <li>Tool calls and execution</li>
                  <li>Embedding generation (semantic vectors)</li>
                  <li>Vector database search vs traditional SQL</li>
                  <li>RAG pipeline (Retrieval-Augmented Generation)</li>
                  <li>Anti-hallucination techniques</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-3xl rounded-lg p-4 bg-blue-600 text-white">
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Educational Flow Visualization */}
                {showEducationalMode && msg.flowSteps && msg.flowSteps.length > 0 && (
                  <AgentFlowVisualizer steps={msg.flowSteps} isExpanded={true} />
                )}
                
                {/* Traditional Thinking Display (if available) */}
                {msg.thinking && msg.thinking.length > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-3xl rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                      <ThinkingDisplay steps={msg.thinking} />
                    </div>
                  </div>
                )}
                
                {/* Assistant Response */}
                <div className="flex justify-start">
                  <div className="max-w-3xl rounded-lg p-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.influencers && msg.influencers.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold mb-2">Matching Influencers:</h4>
                        {msg.influencers.map((inf) => (
                          <InfluencerCard key={inf.id} influencer={inf} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="space-y-4">
            {/* Live Flow Visualization */}
            {showEducationalMode && currentFlowSteps.length > 0 && (
              <AgentFlowVisualizer steps={currentFlowSteps} isExpanded={true} />
            )}
            
            {/* Loading Response */}
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                {thinking.length > 0 && <ThinkingDisplay steps={thinking} />}
                {currentResponse && (
                  <div className="whitespace-pre-wrap">
                    <StreamingText text={currentResponse} isStreaming={true} />
                  </div>
                )}
                {!currentResponse && !thinking.length && currentFlowSteps.length === 0 && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white"></div>
                    <span>Thinking...</span>
                  </div>
                )}
                {currentInfluencers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold mb-2">Found Influencers:</h4>
                    {currentInfluencers.map((inf) => (
                      <InfluencerCard key={inf.id} influencer={inf} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to find influencers..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

