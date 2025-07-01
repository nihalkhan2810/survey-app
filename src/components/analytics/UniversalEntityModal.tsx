'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus, Users, MessageSquare, Phone, Star, Clock } from 'lucide-react';
import { UniversalEntityStats, getUniversalDemoResponses } from '@/lib/universal-analytics';
import { getCurrentIndustryConfig } from '@/lib/industry-config';

interface UniversalEntityModalProps {
  entity: UniversalEntityStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UniversalEntityModal({ entity, isOpen, onClose }: UniversalEntityModalProps) {
  const industryConfig = getCurrentIndustryConfig();
  
  if (!entity) return null;

  // Get responses for this specific entity
  const allResponses = getUniversalDemoResponses();
  const entityResponses = allResponses.filter(response => response.entityName === entity.name);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getIndustrySpecificTitle = () => {
    switch (industryConfig.id) {
      case 'education': return 'Professor Performance Analysis';
      case 'employee': return 'Team Performance Insights';
      case 'customer': return 'Customer Segment Analysis';
      case 'community': return 'Civic Initiative Impact';
      case 'public': return 'Political Issue Analysis';
      case 'event': return 'Event Performance Metrics';
      case 'healthcare': return 'Medical Center Excellence';
      default: return 'Performance Analysis';
    }
  };

  const getResponseTypeIcon = (type: 'link' | 'call') => {
    return type === 'call' ? Phone : MessageSquare;
  };

  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700';
      case 'negative': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700';
    }
  };

  const TrendIcon = getTrendIcon(entity.recentTrend);
  const trendColor = getTrendColor(entity.recentTrend);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="relative px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl text-xl font-bold shadow-lg">
                    {entity.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{entity.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{getIndustrySpecificTitle()}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                        {entity.category}
                      </span>
                      <div className={`flex items-center gap-1 ${trendColor}`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="font-medium capitalize">{entity.recentTrend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50"
                  >
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-5 w-5 text-emerald-600" />
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {entity.averageRating}
                      </p>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Average Rating</p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50"
                  >
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {entity.totalResponses}
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Responses</p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-700/50"
                  >
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <TrendingUp className="h-5 w-5 text-violet-600" />
                      <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                        {entity.sentimentBreakdown.positive}%
                      </p>
                    </div>
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">Positive Sentiment</p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50"
                  >
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                        {entity.contexts.length}
                      </p>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      {industryConfig.id === 'education' ? 'Courses' : 'Projects'}
                    </p>
                  </motion.div>
                </div>

                {/* Industry-Specific Ratings */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Breakdown</h3>
                  <div className="space-y-4">
                    {Object.entries(entity.ratings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-3 flex-1 max-w-xs">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(value / 10) * 100}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white w-8">
                            {value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Responses */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Feedback</h3>
                  <div className="space-y-4">
                    {entityResponses.slice(0, 3).map((response) => {
                      const ResponseIcon = getResponseTypeIcon(response.responseType);
                      return (
                        <motion.div
                          key={response.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                <ResponseIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {response.respondentName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(response.timestamp).toLocaleDateString()} • {response.entityContext}
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getSentimentColor(response.overallSentiment)}`}>
                              {response.overallSentiment}
                            </span>
                          </div>
                          {response.responses.map((resp, idx) => (
                            <div key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                              <p className="font-medium mb-1">{resp.question}</p>
                              <p className="text-gray-600 dark:text-gray-400 italic">"{resp.answer}"</p>
                            </div>
                          ))}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}