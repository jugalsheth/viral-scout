'use client';

import { motion } from 'framer-motion';

interface DiscoveryStatsProps {
  totalSearches?: number;
  totalInfluencers?: number;
  nichesExplored?: string[];
}

export default function DiscoveryStats({
  totalSearches = 0,
  totalInfluencers = 0,
  nichesExplored = [],
}: DiscoveryStatsProps) {
  const badges = [
    { name: 'Explorer', emoji: '🔍', condition: totalSearches >= 1 },
    { name: 'Hunter', emoji: '🎯', condition: totalSearches >= 5 },
    { name: 'Trend Setter', emoji: '⭐', condition: totalSearches >= 10 },
    { name: 'Influencer Pro', emoji: '👑', condition: totalInfluencers >= 50 },
  ].filter((badge) => badge.condition);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className=""
    >
      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase">
        Your Discovery Stats
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800"
        >
          <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{totalSearches}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Searches Made</div>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800"
        >
          <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            {totalInfluencers}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Influencers Found</div>
        </motion.div>
      </div>

      {badges.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Badges Earned
          </h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + idx * 0.1, type: 'spring' }}
                className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
              >
                <span>{badge.emoji}</span>
                <span>{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {nichesExplored.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Niches Explored
          </h4>
          <div className="flex flex-wrap gap-2">
            {nichesExplored.slice(0, 5).map((niche, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs text-gray-700 dark:text-gray-300"
              >
                {niche}
              </motion.span>
            ))}
            {nichesExplored.length > 5 && (
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{nichesExplored.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

