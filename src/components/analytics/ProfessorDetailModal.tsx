'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, TrendingUp, TrendingDown, Users, BookOpen, Calendar, MessageSquare, Phone } from 'lucide-react';
import { ProfessorStats, universityDemoResponses } from '@/lib/university-demo-data';

interface ProfessorDetailModalProps {
  professor: ProfessorStats | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfessorDetailModal({ professor, isOpen, onClose }: ProfessorDetailModalProps) {
  if (!professor) return null;

  const professorResponses = universityDemoResponses.filter(
    response => response.professorName === professor.name
  );

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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'negative':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
      default:
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {professor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {professor.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-600 dark:text-gray-400">{professor.department}</span>
                      {getTrendIcon(professor.recentTrend)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(professor.averageRating)}`}>
                        <Star className="h-3 w-3 inline mr-1 fill-current" />
                        {professor.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Rating Breakdown */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Rating Breakdown
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(professor.ratings).map(([category, rating]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                              {category}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(rating / 5) * 100}%` }}
                                  transition={{ delay: 0.2, duration: 0.8 }}
                                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[2rem]">
                                {rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Courses */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Courses Taught
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {professor.courses.map((course, index) => (
                          <motion.span
                            key={course}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg font-medium"
                          >
                            {course}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Sentiment Breakdown */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Student Sentiment
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-emerald-600">
                            {professor.sentimentBreakdown.positive}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Positive</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-amber-600">
                            {professor.sentimentBreakdown.neutral}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Neutral</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-rose-600">
                            {professor.sentimentBreakdown.negative}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Negative</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Recent Reviews */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Student Feedback
                    </h3>
                    
                    {professorResponses.slice(0, 5).map((response, index) => (
                      <motion.div
                        key={response.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${response.responseType === 'call' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                              {response.responseType === 'call' ? (
                                <Phone className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              ) : (
                                <MessageSquare className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {response.course}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(response.overallSentiment)}`}>
                              {response.overallSentiment}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(response.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <blockquote className="text-sm text-gray-600 dark:text-gray-400 italic">
                          &ldquo;{response.responses[0]?.answer || 'No comment available'}&rdquo;
                        </blockquote>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {response.semester}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-current" />
                            <span className="text-xs font-medium text-gray-900 dark:text-white">
                              {response.satisfactionScore}/10
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {professorResponses.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No recent feedback available
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {professor.totalResponses}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total Reviews</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {professor.courses.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Courses</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {professor.averageRating.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {professor.sentimentBreakdown.positive}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Positive</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}