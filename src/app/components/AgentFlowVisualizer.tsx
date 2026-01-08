'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentFlowStep } from '@/lib/types';

interface AgentFlowVisualizerProps {
  steps: AgentFlowStep[];
  isExpanded?: boolean;
}

export default function AgentFlowVisualizer({ steps, isExpanded: initialExpanded = true }: AgentFlowVisualizerProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const getStepIcon = (type: AgentFlowStep['type'], status: AgentFlowStep['status']) => {
    if (status === 'error') return '❌';
    if (status === 'running') return '⚙️';
    if (status === 'pending') return '⏳';
    
    switch (type) {
      case 'reasoning': return '🧠';
      case 'tool_call': return '🔧';
      case 'embedding': return '🔤';
      case 'vector_search': return '🔍';
      case 'rag': return '📚';
      case 'response': return '💬';
      default: return '📋';
    }
  };

  const getStepColor = (type: AgentFlowStep['type'], status: AgentFlowStep['status']) => {
    if (status === 'error') return {
      border: 'border-red-500',
      bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30',
      gradient: 'from-red-400 to-red-600'
    };
    if (status === 'running') return {
      border: 'border-yellow-500',
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30',
      gradient: 'from-yellow-400 to-orange-500'
    };
    if (status === 'pending') return {
      border: 'border-gray-300',
      bg: 'bg-gray-50 dark:bg-gray-800',
      gradient: 'from-gray-400 to-gray-600'
    };
    
    switch (type) {
      case 'reasoning': return {
        border: 'border-blue-500',
        bg: 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-blue-800/30',
        gradient: 'from-blue-400 to-purple-600'
      };
      case 'tool_call': return {
        border: 'border-purple-500',
        bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-800/30',
        gradient: 'from-purple-400 to-pink-600'
      };
      case 'embedding': return {
        border: 'border-green-500',
        bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-green-800/30',
        gradient: 'from-green-400 to-emerald-600'
      };
      case 'vector_search': return {
        border: 'border-orange-500',
        bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-orange-800/30',
        gradient: 'from-orange-400 to-amber-600'
      };
      case 'rag': return {
        border: 'border-indigo-500',
        bg: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 dark:from-indigo-900/30 dark:via-blue-900/30 dark:to-indigo-800/30',
        gradient: 'from-indigo-400 to-blue-600'
      };
      case 'response': return {
        border: 'border-teal-500',
        bg: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 dark:from-teal-900/30 dark:via-cyan-900/30 dark:to-teal-800/30',
        gradient: 'from-teal-400 to-cyan-600'
      };
      default: return {
        border: 'border-gray-300',
        bg: 'bg-gray-50 dark:bg-gray-800',
        gradient: 'from-gray-400 to-gray-600'
      };
    }
  };

  const getEducationNote = (step: AgentFlowStep) => {
    switch (step.type) {
      case 'reasoning':
        return {
          title: '🧠 Agent Reasoning (LLM)',
          explanation: 'The LLM analyzes the user query to understand intent, extract key parameters (vibe, budget, niche), and decides which tools to use. This is where the AI "thinks" about what to do.',
          tech: 'Groq LLM (Llama 3.3 70B) - Fast inference, free tier available',
        };
      case 'embedding':
        return {
          title: '🔤 Embedding Generation (RAG)',
          explanation: 'Converts natural language query into a 768-dimensional vector embedding using Jina.ai. This semantic representation captures meaning, not just keywords. Enables semantic search instead of exact keyword matching.',
          tech: 'Jina.ai Embeddings v2 - 768 dimensions, fast generation (~200ms)',
          comparison: 'Traditional DB: Would search for exact keywords like "metal" or "music"\nVector DB: Finds semantically similar content even if worded differently',
        };
      case 'vector_search':
        return {
          title: '🔍 Vector Database Search',
          explanation: 'Searches Supabase PostgreSQL with pgvector extension using cosine similarity. Finds influencers whose embedding vectors are closest to the query embedding, ranked by similarity score.',
          tech: 'Supabase + pgvector - Fast similarity search (~300ms), cosine distance',
          comparison: 'Traditional SQL: SELECT * WHERE niche = "metal" AND budget <= 1000\nVector Search: Finds "hard rock", "heavy metal", "aggressive music" automatically via semantic similarity',
          antiHallucination: 'Uses REAL data from database, not generating fake influencers. Every result is an actual influencer stored in the database.',
        };
      case 'tool_call':
        return {
          title: '🔧 Tool Execution',
          explanation: 'Executes the search_influencers tool which orchestrates embedding generation and vector search. Tools allow the LLM to interact with external systems and retrieve real data.',
          tech: 'Function calling pattern - LLM decides which tool to use, system executes it',
        };
      case 'rag':
        return {
          title: '📚 Retrieval-Augmented Generation',
          explanation: 'RAG pattern: Retrieve relevant data from vector database, then augment the LLM context with this real data. The LLM responds based on actual retrieved influencers, not hallucinated ones.',
          tech: 'RAG Pipeline: Query → Embedding → Vector Search → Context Injection → LLM Response',
          antiHallucination: 'The LLM cannot make up influencers - it only knows about what was retrieved from the database. This ensures factual accuracy.',
        };
      case 'response':
        return {
          title: '💬 Final Response Generation',
          explanation: 'The LLM synthesizes the retrieved influencer data into a natural language response, explaining why each influencer matches the query and providing recommendations.',
          tech: 'Groq LLM with tool results as context - Fast streaming response',
        };
      default:
        return null;
    }
  };

  if (!isExpanded || steps.length === 0) {
    return (
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full text-left p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold gradient-text">🔬 Agent Flow Visualization</span>
          <motion.span
            className="text-sm text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-full"
            whileHover={{ scale: 1.1 }}
          >
            {steps.length} steps
          </motion.span>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-xl border-2 border-purple-200/50 dark:border-purple-800/50 p-5 mb-4 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold gradient-text-vibrant flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🔬
          </motion.span>
          Agent Flow Visualization (Educational Mode)
        </h3>
        <motion.button
          onClick={() => setIsExpanded(false)}
          aria-label="Close agent flow visualization"
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1"
        >
          ✕
        </motion.button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {steps.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No flow steps available yet. Ask a question to see the agent flow!
            </div>
          )}
          {steps.map((step, index) => {
            const note = getEducationNote(step);
            // Show step even if no note, with basic info
            const colors = getStepColor(step.type, step.status);
            const isRunning = step.status === 'running';
            
            if (!note) {
              // Show basic step info even without detailed note
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-2 rounded-xl p-4 transition-all ${colors.border} ${colors.bg} ${
                    isRunning ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">{getStepIcon(step.type, step.status)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{step.title || step.type}</h4>
                        {step.duration && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {step.duration}ms
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{step.description || 'Processing...'}</p>
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`border-2 rounded-xl p-4 transition-all ${colors.border} ${colors.bg} ${
                  isRunning ? 'animate-pulse-glow' : ''
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <motion.span
                    className="text-2xl"
                    animate={isRunning ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                    } : {}}
                    transition={{
                      duration: 1,
                      repeat: isRunning ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  >
                    {getStepIcon(step.type, step.status)}
                  </motion.span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{note.title}</h4>
                    {step.duration && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {step.duration}ms
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{note.explanation}</p>
                  
                  {note.tech && (
                    <div className="bg-gray-100 dark:bg-gray-900 rounded p-2 mb-2">
                      <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                        {note.tech}
                      </span>
                    </div>
                  )}

                  {note.comparison && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mb-2 border border-blue-200 dark:border-blue-800">
                      <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        📊 Vector DB vs Traditional:
                      </div>
                      <pre className="text-xs text-blue-700 dark:text-blue-400 whitespace-pre-wrap">
                        {note.comparison}
                      </pre>
                    </div>
                  )}

                  {note.antiHallucination && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 border border-green-200 dark:border-green-800">
                      <div className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                        ✅ Anti-Hallucination:
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {note.antiHallucination}
                      </p>
                    </div>
                  )}

                  {step.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                        View Details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                        {JSON.stringify(step.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              {/* Animated Connection line to next step */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="flex justify-center my-2"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <motion.div
                      className={`w-0.5 h-6 bg-gradient-to-b ${colors.gradient} rounded-full`}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: steps.length * 0.1 }}
        className="mt-4 p-4 bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-pink-900/30 rounded-xl border-2 border-purple-300/50 dark:border-purple-700/50 backdrop-blur-sm"
      >
        <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            🎓
          </motion.span>
          Key Concepts Demonstrated:
        </h4>
        <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-2">
          {[
            '• <strong>Agent Loop:</strong> Reasoning → Tool Call → Data Retrieval → Response',
            '• <strong>RAG (Retrieval-Augmented Generation):</strong> Real data + LLM reasoning',
            '• <strong>Vector Embeddings:</strong> Semantic understanding vs keyword matching',
            '• <strong>Function Calling:</strong> LLM decides which tools to use',
            '• <strong>Anti-Hallucination:</strong> Responses grounded in real database data',
          ].map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: steps.length * 0.1 + idx * 0.1 }}
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

