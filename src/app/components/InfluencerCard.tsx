'use client';

import { motion } from 'framer-motion';
import type { InfluencerSearchResult } from '@/lib/types';

interface InfluencerCardProps {
  influencer: InfluencerSearchResult;
  index?: number;
}

export default function InfluencerCard({ influencer, index = 0 }: InfluencerCardProps) {
  const similarityPercentage = Math.round((influencer.similarity || 0) * 100);
  const engagementRate = influencer.engagement_rate?.toFixed(2) || 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative group"
    >
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >

        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar placeholder with gradient */}
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium text-sm">
              {influencer.channel_name?.[0]?.toUpperCase() || '?'}
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {influencer.channel_name}
            </h3>
          </div>
          
          {/* Match percentage with animated progress ring */}
          <div className="relative w-12 h-12">
            <svg className="transform -rotate-90 w-12 h-12">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={125.6}
                initial={{ strokeDashoffset: 125.6 }}
                animate={{ strokeDashoffset: 125.6 - (similarityPercentage / 100) * 125.6 }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="text-gray-900 dark:text-white"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                {similarityPercentage}%
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
          {influencer.description || 'No description available'}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Engagement:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {engagementRate}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Price:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${influencer.estimated_price_per_post?.toLocaleString() || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

