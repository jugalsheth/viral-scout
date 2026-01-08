'use client';

import { motion } from 'framer-motion';

interface SearchSuggestionsProps {
  onSuggestionClick: (query: string) => void;
}

const popularSearches = [
  { category: 'Fitness', queries: ['Find fitness influencers', 'Morning workout creators', 'Yoga instructors'] },
  { category: 'Music', queries: ['Metal music influencers', 'Indie artists', 'Hip-hop creators'] },
  { category: 'Tech', queries: ['Tech reviewers', 'Gaming streamers', 'AI content creators'] },
  { category: 'Lifestyle', queries: ['Travel bloggers', 'Food influencers', 'Fashion creators'] },
];

const trendingSearches = [
  'Find influencers under $500',
  'High engagement creators',
  'Micro-influencers in tech',
  'Female fitness influencers',
];

export default function SearchSuggestions({ onSuggestionClick }: SearchSuggestionsProps) {
  return (
    <div className="space-y-8">
      {/* Trending Searches */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className=""
      >
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 tracking-wide uppercase">
          Trending Searches
        </h3>
        <div className="flex flex-wrap gap-2">
          {trendingSearches.map((search, idx) => (
            <motion.button
              key={idx}
              onClick={() => onSuggestionClick(search)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              {search}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Popular Categories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className=""
      >
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 tracking-wide uppercase">
          Explore Categories
        </h3>
        <div className="space-y-4">
          {popularSearches.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + catIdx * 0.05 }}
              className="space-y-2"
            >
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {category.category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {category.queries.map((query, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => onSuggestionClick(query)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                  >
                    {query}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

