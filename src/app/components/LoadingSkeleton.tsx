'use client';

import { motion } from 'framer-motion';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-strong rounded-xl p-5 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-md"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 animate-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded w-3/4 animate-shimmer" />
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full animate-shimmer" />
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-5/6 animate-shimmer" />
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 animate-shimmer" />
          </div>
          <div className="flex gap-4 mt-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-shimmer" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-shimmer" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

