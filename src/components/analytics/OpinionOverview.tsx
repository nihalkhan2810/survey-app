'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, MessageCircle, Phone, Hash, Clock } from 'lucide-react';
import { getSentimentAnalysis } from '@/lib/demo-data';

export function OpinionOverview() {
  const analysis = getSentimentAnalysis();

  const getOverallTrend = () => {
    const positiveChange = analysis.recentTrends.change.positive;
    if (positiveChange > 3) return { status: 'improving', icon: TrendingUp, color: 'emerald' };
    if (positiveChange < -3) return { status: 'declining', icon: TrendingDown, color: 'rose' };
    return { status: 'stable', icon: TrendingUp, color: 'blue' };
  };

  const trend = getOverallTrend();

  const keywordData = analysis.topKeywords.map((keyword, index) => ({
    keyword,
    frequency: Math.floor(Math.random() * 50) + 10, // Demo data
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as 'positive' | 'neutral' | 'negative'
  })).sort((a, b) => b.frequency - a.frequency);

  const getKeywordColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'negative':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 bg-gradient-to-br from-${trend.color}-500 to-${trend.color}-600 rounded-lg`}>
          <trend.icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Opinion</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Overall sentiment is <span className={`font-medium text-${trend.color}-600`}>{trend.status}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Response Types */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Channels</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Survey Links</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {analysis.responseTypeBreakdown.link}
                </span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(analysis.responseTypeBreakdown.link / analysis.totalResponses) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Voice Calls</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {analysis.responseTypeBreakdown.call}
                </span>
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(analysis.responseTypeBreakdown.call / analysis.totalResponses) * 100}%` }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Comparison</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">{analysis.recentTrends.thisWeek.positive}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">{analysis.recentTrends.thisWeek.neutral}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">{analysis.recentTrends.thisWeek.negative}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Week</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-300 rounded-full"></div>
                  <span className="text-xs text-gray-500">{analysis.recentTrends.lastWeek.positive}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                  <span className="text-xs text-gray-500">{analysis.recentTrends.lastWeek.neutral}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-rose-300 rounded-full"></div>
                  <span className="text-xs text-gray-500">{analysis.recentTrends.lastWeek.negative}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Trending Keywords</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywordData.slice(0, 6).map((item, index) => (
            <motion.div
              key={item.keyword}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${getKeywordColor(item.sentiment)} hover:shadow-md transition-all`}
            >
              {item.keyword} ({item.frequency})
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analysis.totalResponses}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Responses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round((analysis.sentimentCounts.positive / analysis.totalResponses) * 100)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Positive Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analysis.averageSatisfaction}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}