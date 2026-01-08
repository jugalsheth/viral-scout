'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StreamingText from './StreamingText';
import ThinkingDisplay from './ThinkingDisplay';
import InfluencerCard from './InfluencerCard';
import AgentFlowVisualizer from './AgentFlowVisualizer';
import SearchSuggestions from './SearchSuggestions';
import DiscoveryStats from './DiscoveryStats';
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

  const exampleQueries = [
    "Find 5 fitness influencers with morning workout vibes under $500",
    "Discover metal music influencers with high engagement",
    "Show me tech reviewers with budget under $1000",
    "Find lifestyle influencers for eco-friendly products",
  ];

  const handleExampleClick = (query: string) => {
    setInput(query);
  };

  const handleSuggestionClick = (query: string) => {
    setInput(query);
    // Trigger submit after input is set
    setTimeout(() => {
      if (query.trim() && !loading) {
        // Directly submit the form by calling handleSubmit with a minimal event
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          const syntheticEvent = {
            preventDefault: () => {},
            currentTarget: form,
            target: form,
          } as unknown as React.FormEvent<HTMLFormElement>;
          handleSubmit(syntheticEvent);
        }
      }
    }, 100);
  };

  // Calculate stats from messages
  const totalSearches = messages.filter(m => m.role === 'user').length;
  const totalInfluencers = messages.reduce((acc, m) => acc + (m.influencers?.length || 0), 0);
  const nichesExplored: string[] = []; // Niche not available in InfluencerSearchResult

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Educational Mode Toggle */}
      <div className="border-b border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 px-6 py-3">
        <label className="flex items-center gap-3 text-sm cursor-pointer group">
          <input
            type="checkbox"
            checked={showEducationalMode}
            onChange={(e) => setShowEducationalMode(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-1 cursor-pointer"
            aria-label="Toggle educational mode"
          />
          <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
            Educational Mode
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Show agent flow & technical details</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-0 py-8 space-y-8">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Welcome Header */}
              <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold mb-3 text-gray-900 dark:text-white tracking-tight">
                  Welcome to Viral Scout
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Discover the perfect influencers for your campaign with AI-powered semantic search
                </p>
              </div>

              {/* Discovery Stats - Only show if there's activity */}
              {totalSearches > 0 && (
                <div className="mb-12">
                  <DiscoveryStats
                    totalSearches={totalSearches}
                    totalInfluencers={totalInfluencers}
                    nichesExplored={nichesExplored}
                  />
                </div>
              )}

              {/* Search Suggestions */}
              <div className="mb-12">
                <SearchSuggestions onSuggestionClick={handleSuggestionClick} />
              </div>

              {/* Quick Example Queries */}
              <div className="mb-12">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase">
                  Quick Examples
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {exampleQueries.map((query, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleSuggestionClick(query)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="text-left p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white leading-relaxed">
                        {query}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {showEducationalMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-w-2xl mx-auto text-left"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
                    Educational Mode Active
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    When you ask a question, you'll see the complete agent flow:
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                    {[
                      'Agent reasoning loop (LLM decision-making)',
                      'Tool calls and execution',
                      'Embedding generation (semantic vectors)',
                      'Vector database search vs traditional SQL',
                      'RAG pipeline (Retrieval-Augmented Generation)',
                      'Anti-hallucination techniques',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-400 dark:text-gray-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-2xl rounded-lg px-4 py-2.5 bg-gray-900 dark:bg-gray-800 text-white"
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                  </motion.div>
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
                      <div className="max-w-2xl">
                        <ThinkingDisplay steps={msg.thinking} />
                      </div>
                    </div>
                  )}
                  
                  {/* Assistant Response */}
                  <div className="flex justify-start">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="max-w-2xl rounded-lg px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                      {msg.influencers && msg.influencers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="mt-5 space-y-3"
                        >
                          <h4 className="font-medium mb-3 text-gray-900 dark:text-white text-sm">Matching Influencers</h4>
                          <div className="space-y-3">
                            {msg.influencers.map((inf, infIdx) => (
                              <InfluencerCard key={inf.id} influencer={inf} index={infIdx} />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Live Flow Visualization */}
            {showEducationalMode && currentFlowSteps.length > 0 && (
              <AgentFlowVisualizer steps={currentFlowSteps} isExpanded={true} />
            )}
            
            {/* Loading Response */}
            <div className="flex justify-start">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-2xl rounded-lg px-4 py-2.5 bg-white dark:bg-gray-900"
              >
                {thinking.length > 0 && <ThinkingDisplay steps={thinking} />}
                {currentResponse && (
                  <div className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white leading-relaxed">
                    <StreamingText text={currentResponse} isStreaming={true} />
                  </div>
                )}
                {!currentResponse && !thinking.length && currentFlowSteps.length === 0 && (
                  <motion.div
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full border-2 border-gray-400 dark:border-gray-500 border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="text-sm">Thinking...</span>
                  </motion.div>
                )}
                {currentInfluencers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-5 space-y-3"
                  >
                    <h4 className="font-medium mb-3 text-gray-900 dark:text-white text-sm">Found Influencers</h4>
                    <div className="space-y-3">
                      {currentInfluencers.map((inf, infIdx) => (
                        <InfluencerCard key={inf.id} influencer={inf} index={infIdx} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-100 dark:border-gray-900 px-6 py-4 bg-white dark:bg-gray-950"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to find influencers..."
              disabled={loading}
              aria-label="Search input"
              aria-describedby="search-hint"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600 focus:border-transparent transition-all text-sm"
            />
            <span id="search-hint" className="sr-only">Type your query to find influencers</span>
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label={loading ? 'Sending message' : 'Send message'}
            className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600 text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Sending
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

