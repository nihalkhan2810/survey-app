'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, Users, BookOpen, Award, ChevronRight } from 'lucide-react';
import { getTopProfessors, getTopProfessorsByCategory, ProfessorStats } from '@/lib/university-demo-data';

interface TopProfessorsProps {
  onProfessorClick?: (professor: ProfessorStats) => void;
}

export function TopProfessors({ onProfessorClick }: TopProfessorsProps) {
  const [selectedView, setSelectedView] = useState<'overall' | 'teaching' | 'communication' | 'knowledge' | 'availability' | 'fairness'>('overall');
  const [hoveredProfessor, setHoveredProfessor] = useState<string | null>(null);

  const topProfessors = selectedView === 'overall' 
    ? getTopProfessors(10) 
    : getTopProfessorsByCategory(selectedView, 5);

  const viewOptions = [
    { key: 'overall', label: 'Overall Rating', icon: Award },
    { key: 'teaching', label: 'Teaching', icon: BookOpen },
    { key: 'communication', label: 'Communication', icon: Users },
    { key: 'knowledge', label: 'Knowledge', icon: Star },
    { key: 'availability', label: 'Availability', icon: TrendingUp },
    { key: 'fairness', label: 'Fairness', icon: TrendingDown },
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (rating >= 3.5) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-rose-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getCurrentRating = (professor: ProfessorStats) => {
    if (selectedView === 'overall') return professor.averageRating;
    return professor.ratings[selectedView as keyof typeof professor.ratings];
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top {selectedView === 'overall' ? '10' : '5'} Professors
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedView === 'overall' ? 'Overall performance rankings' : `Best in ${selectedView}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rankings</span>
        </div>
      </div>

      {/* View Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {viewOptions.map((option) => (
            <motion.button
              key={option.key}
              onClick={() => setSelectedView(option.key as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === option.key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {topProfessors.map((professor, index) => (
            <motion.div
              key={`${selectedView}-${professor.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              onHoverStart={() => setHoveredProfessor(professor.id)}
              onHoverEnd={() => setHoveredProfessor(null)}
              onClick={() => onProfessorClick?.(professor)}
              className="group relative overflow-hidden bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/30 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' :
                  index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                  index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {index + 1}
                </div>

                {/* Professor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {professor.name}
                    </h4>
                    {getTrendIcon(professor.recentTrend)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>{professor.department}</span>
                    <span>•</span>
                    <span>{professor.totalResponses} reviews</span>
                    <span>•</span>
                    <span>{professor.courses.length} courses</span>
                  </div>
                  
                  {/* Course Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {professor.courses.slice(0, 3).map((course, courseIndex) => (
                      <span
                        key={courseIndex}
                        className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                      >
                        {course}
                      </span>
                    ))}
                    {professor.courses.length > 3 && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        +{professor.courses.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex-shrink-0 text-right">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(getCurrentRating(professor))}`}>
                    <Star className="h-3 w-3 fill-current" />
                    {getCurrentRating(professor).toFixed(1)}
                  </div>
                  
                  {/* Sentiment Breakdown */}
                  <div className="flex items-center gap-1 mt-2 justify-end">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-gray-500">{professor.sentimentBreakdown.positive}%</span>
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                  hoveredProfessor === professor.id ? 'translate-x-1' : ''
                }`} />
              </div>

              {/* Rating Breakdown on Hover */}
              <AnimatePresence>
                {hoveredProfessor === professor.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      {Object.entries(professor.ratings).map(([category, rating]) => (
                        <div key={category} className="text-center">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {rating.toFixed(1)}
                          </div>
                          <div className="text-gray-500 capitalize">
                            {category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Background Gradient */}
              <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {topProfessors.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Top Performers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round(topProfessors.reduce((sum, prof) => sum + getCurrentRating(prof), 0) / topProfessors.length * 10) / 10}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {topProfessors.reduce((sum, prof) => sum + prof.totalResponses, 0)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
}