'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ChevronRight, Award } from 'lucide-react';
import { getUniversalTopEntitiesAsync, UniversalEntityStats } from '@/lib/universal-analytics';
import { getCurrentIndustryConfig } from '@/lib/industry-config';

interface UniversalTopEntitiesProps {
  onEntityClick?: (entity: UniversalEntityStats) => void;
}

export function UniversalTopEntities({ onEntityClick }: UniversalTopEntitiesProps) {
  const [industryConfig, setIndustryConfig] = useState(getCurrentIndustryConfig());
  const [topEntities, setTopEntities] = useState<UniversalEntityStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Load entities data
  useEffect(() => {
    const loadEntities = async () => {
      setLoading(true);
      try {
        const entities = await getUniversalTopEntitiesAsync(3);
        setTopEntities(entities);
      } catch (error) {
        console.error('Failed to load entities:', error);
        setTopEntities([]);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [industryConfig]);

  // Update industry config when it changes
  useEffect(() => {
    const updateConfig = () => {
      setIndustryConfig(getCurrentIndustryConfig());
    };
    
    updateConfig();
    
    // Listen for storage changes (when industry is changed in admin)
    window.addEventListener('storage', updateConfig);
    return () => window.removeEventListener('storage', updateConfig);
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (rating >= 7) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (rating >= 6) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

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

  const getIndustryTitle = () => {
    switch (industryConfig.id) {
      case 'education': return 'Top Professors';
      case 'employee': return 'Top Performing Teams';
      case 'customer': return 'Top Customer Segments';
      case 'community': return 'Top Civic Initiatives';
      case 'public': return 'Top Political Issues';
      case 'event': return 'Top Rated Events';
      case 'healthcare': return 'Top Medical Centers';
      default: return 'Top Performers';
    }
  };

  const getIndustrySubtitle = () => {
    switch (industryConfig.id) {
      case 'education': return 'Highest rated by students';
      case 'employee': return 'Highest productivity & satisfaction';
      case 'customer': return 'Highest lifetime value & satisfaction';
      case 'community': return 'Greatest community impact';
      case 'public': return 'Highest confidence & participation';
      case 'event': return 'Highest attendee satisfaction';
      case 'healthcare': return 'Best patient outcomes & satisfaction';
      default: return 'Based on satisfaction scores';
    }
  };

  const getIndustryIcon = () => {
    switch (industryConfig.id) {
      case 'education': return '🎓';
      case 'employee': return '💼';
      case 'customer': return '⭐';
      case 'community': return '🏛️';
      case 'public': return '🗳️';
      case 'event': return '🎟️';
      case 'healthcare': return '🏥';
      default: return '📊';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">{getIndustryIcon()}</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getIndustryTitle()}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{getIndustrySubtitle()}</p>
        </div>
      </div>

      <div className="space-y-4">
        {topEntities.map((entity, index) => {
          const TrendIcon = getTrendIcon(entity.recentTrend);
          const trendColor = getTrendColor(entity.recentTrend);
          
          return (
            <motion.div
              key={entity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onEntityClick?.(entity)}
              className="group relative overflow-hidden p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-600/30 rounded-xl hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-600/50 dark:hover:to-gray-500/30 transition-all cursor-pointer border border-gray-200/50 dark:border-gray-600/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg">
                      #{index + 1}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Award className="h-2.5 w-2.5 text-yellow-800" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{entity.name}</h4>
                      <div className={`flex items-center gap-1 ${trendColor}`}>
                        <TrendIcon className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span>{entity.category}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span>{entity.totalResponses} responses</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getRatingColor(entity.averageRating)}`}>
                      <span>{entity.averageRating}/10</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {entity.sentimentBreakdown.positive}% positive
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Progress Bar for Sentiment */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Sentiment Distribution</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {entity.contexts.length} {industryConfig.id === 'education' ? 'courses' : 'contexts'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 flex overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${entity.sentimentBreakdown.positive}%` }}
                    transition={{ delay: index * 0.2, duration: 1 }}
                    className="h-2 bg-emerald-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${entity.sentimentBreakdown.neutral}%` }}
                    transition={{ delay: index * 0.2 + 0.1, duration: 1 }}
                    className="h-2 bg-yellow-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${entity.sentimentBreakdown.negative}%` }}
                    transition={{ delay: index * 0.2 + 0.2, duration: 1 }}
                    className="h-2 bg-red-500"
                  />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full group-hover:scale-110 transition-transform" />
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <motion.div whileHover={{ scale: 1.05 }}>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(topEntities.reduce((sum, entity) => sum + entity.averageRating, 0) / topEntities.length).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(topEntities.reduce((sum, entity) => sum + entity.sentimentBreakdown.positive, 0) / topEntities.length).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Positive</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {topEntities.reduce((sum, entity) => sum + entity.totalResponses, 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Responses</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}