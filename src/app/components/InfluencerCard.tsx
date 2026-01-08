'use client';

import type { InfluencerSearchResult } from '@/lib/types';

interface InfluencerCardProps {
  influencer: InfluencerSearchResult;
}

export default function InfluencerCard({ influencer }: InfluencerCardProps) {
  const similarityPercentage = Math.round((influencer.similarity || 0) * 100);
  const engagementRate = influencer.engagement_rate?.toFixed(2) || 'N/A';

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {influencer.channel_name}
        </h3>
        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
          {similarityPercentage}% match
        </span>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
        {influencer.description || 'No description available'}
      </p>

      <div className="flex justify-between items-center text-sm">
        <div className="flex gap-4">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Engagement:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-white">
              {engagementRate}%
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Price:</span>
            <span className="ml-1 font-medium text-gray-900 dark:text-white">
              ${influencer.estimated_price_per_post?.toLocaleString() || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

