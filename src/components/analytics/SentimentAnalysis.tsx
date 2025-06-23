'use client';

import { motion } from 'framer-motion';
import { Smile, Frown, Meh, TrendingUp, TrendingDown } from 'lucide-react';
import { getUniversitySentimentAnalysis } from '@/lib/university-demo-data';

export function SentimentAnalysis() {
  const analysis = getUniversitySentimentAnalysis();

  const sentimentData = [
    {
      label: 'Positive',
      count: analysis.sentimentCounts.positive,
      percentage: analysis.sentimentPercentages.positive,
      icon: Smile,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-400',
      bgGradient: 'from-emerald-50 to-green-50',
      darkBgGradient: 'from-emerald-900/20 to-green-900/20'
    },
    {
      label: 'Neutral',
      count: analysis.sentimentCounts.neutral,
      percentage: analysis.sentimentPercentages.neutral,
      icon: Meh,
      color: 'amber',
      gradient: 'from-amber-500 to-yellow-400',
      bgGradient: 'from-amber-50 to-yellow-50',
      darkBgGradient: 'from-amber-900/20 to-yellow-900/20'
    },
    {
      label: 'Negative',
      count: analysis.sentimentCounts.negative,
      percentage: analysis.sentimentPercentages.negative,
      icon: Frown,
      color: 'rose',
      gradient: 'from-rose-500 to-red-400',
      bgGradient: 'from-rose-50 to-red-50',
      darkBgGradient: 'from-rose-900/20 to-red-900/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sentiment Analysis</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Based on {analysis.totalResponses} responses</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            {analysis.recentTrends.change.positive > 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
            <span className={`font-medium ${analysis.recentTrends.change.positive > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {analysis.recentTrends.change.positive > 0 ? '+' : ''}{analysis.recentTrends.change.positive}%
            </span>
          </div>
          <span className="text-gray-400">vs last week</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {sentimentData.map((sentiment, index) => (
          <motion.div
            key={sentiment.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden bg-gradient-to-br ${sentiment.bgGradient} dark:bg-gradient-to-br dark:${sentiment.darkBgGradient} rounded-xl p-4 border border-gray-100 dark:border-gray-700/30 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 bg-gradient-to-br ${sentiment.gradient} rounded-lg shadow-lg group-hover:shadow-xl transition-shadow`}>
                <sentiment.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sentiment.percentage}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {sentiment.count} responses
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {sentiment.label}
              </span>
              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sentiment.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  className={`h-2 bg-gradient-to-r ${sentiment.gradient} rounded-full`}
                />
              </div>
            </div>
            
            <div className={`absolute -right-8 -bottom-8 h-20 w-20 bg-gradient-to-br ${sentiment.gradient} opacity-10 rounded-full blur-2xl`} />
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Satisfaction Score</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {analysis.averageSatisfaction}/10
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 + 0.5 }}
                className={`w-2 h-8 rounded-full ${
                  i < Math.round(analysis.averageSatisfaction)
                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}