'use client';

import { motion } from 'framer-motion';
import { Building2, Users, BookOpen, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { departmentStats } from '@/lib/university-demo-data';

interface DepartmentAnalyticsProps {
  onDepartmentClick?: (department: typeof departmentStats[0]) => void;
}

export function DepartmentAnalytics({ onDepartmentClick }: DepartmentAnalyticsProps) {
  const sortedDepartments = [...departmentStats].sort((a, b) => b.averageRating - a.averageRating);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (rating >= 3.5) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
  };

  const getDepartmentGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-purple-500 to-indigo-500',
      'from-rose-500 to-pink-500',
      'from-amber-500 to-orange-500',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department Performance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">University-wide department rankings</p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedDepartments.map((department, index) => (
          <motion.div
            key={department.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => onDepartmentClick?.(department)}
            className="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/30 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all cursor-pointer"
          >
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${getDepartmentGradient(index)} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold">#{index + 1}</span>
                  </div>

                  {/* Department Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {department.name}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 flex-shrink-0" />
                        <span>{department.professorCount} professors</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3 flex-shrink-0" />
                        <span>{department.totalResponses} reviews</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating and Arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`px-2 py-1 rounded-lg font-medium text-sm ${getRatingColor(department.averageRating)}`}>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{department.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Second Row - Course and Sentiment */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                    Top: {department.topCourse}
                  </span>
                </div>
                
                {/* Sentiment Indicators */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-500">{department.sentiment.positive}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-500">{department.sentiment.neutral}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    <span className="text-gray-500">{department.sentiment.negative}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(department.averageRating / 5) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  className={`h-2 bg-gradient-to-r ${getDepartmentGradient(index)} rounded-full`}
                />
              </div>
            </div>

            {/* Background Gradient */}
            <div className={`absolute -right-8 -bottom-8 h-20 w-20 bg-gradient-to-br ${getDepartmentGradient(index)} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {departmentStats.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Departments</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round(departmentStats.reduce((sum, dept) => sum + dept.averageRating, 0) / departmentStats.length * 10) / 10}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {departmentStats.reduce((sum, dept) => sum + dept.totalResponses, 0)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
}