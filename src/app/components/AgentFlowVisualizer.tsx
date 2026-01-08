'use client';

import { useState } from 'react';
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
    if (status === 'error') return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    if (status === 'running') return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    if (status === 'pending') return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    
    switch (type) {
      case 'reasoning': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'tool_call': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'embedding': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'vector_search': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'rag': return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
      case 'response': return 'border-teal-500 bg-teal-50 dark:bg-teal-900/20';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
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
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold">🔬 Agent Flow Visualization</span>
          <span className="text-sm text-gray-500">{steps.length} steps</span>
        </div>
      </button>
    );
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          🔬 Agent Flow Visualization (Educational Mode)
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const note = getEducationNote(step);
          if (!note) return null;

          return (
            <div
              key={step.id}
              className={`border-2 rounded-lg p-4 transition-all ${getStepColor(step.type, step.status)}`}
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">{getStepIcon(step.type, step.status)}</span>
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

              {/* Connection line to next step */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-600"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
          🎓 Key Concepts Demonstrated:
        </h4>
        <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-1">
          <li>• <strong>Agent Loop:</strong> Reasoning → Tool Call → Data Retrieval → Response</li>
          <li>• <strong>RAG (Retrieval-Augmented Generation):</strong> Real data + LLM reasoning</li>
          <li>• <strong>Vector Embeddings:</strong> Semantic understanding vs keyword matching</li>
          <li>• <strong>Function Calling:</strong> LLM decides which tools to use</li>
          <li>• <strong>Anti-Hallucination:</strong> Responses grounded in real database data</li>
        </ul>
      </div>
    </div>
  );
}

