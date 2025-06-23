'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { SentimentAnalysis } from '@/components/analytics/SentimentAnalysis';
import { RecentResponses } from '@/components/analytics/RecentResponses';
import { OpinionOverview } from '@/components/analytics/OpinionOverview';
import { TopProfessors } from '@/components/analytics/TopProfessors';
import { DepartmentAnalytics } from '@/components/analytics/DepartmentAnalytics';
import { ProfessorDetailModal } from '@/components/analytics/ProfessorDetailModal';
import { TrendingUp, TrendingDown, Activity, Users, MessageSquare, Phone, GraduationCap, Building2 } from 'lucide-react';
import { getUniversitySentimentAnalysis, ProfessorStats, departmentStats } from '@/lib/university-demo-data';

export default function AnalyticsPage() {
  const [selectedProfessor, setSelectedProfessor] = useState<ProfessorStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const analysis = getUniversitySentimentAnalysis();

  const handleProfessorClick = (professor: ProfessorStats) => {
    setSelectedProfessor(professor);
    setIsModalOpen(true);
  };

  const handleDepartmentClick = (department: typeof departmentStats[0]) => {
    console.log('Department clicked:', department);
  };

  const stats = [
    {
      title: 'Total Student Reviews',
      value: analysis.totalResponses.toString(),
      change: '+12.5%',
      trend: 'up',
      icon: Activity,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Professors',
      value: '24',
      change: '+2',
      trend: 'up',
      icon: GraduationCap,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Departments',
      value: departmentStats.length.toString(),
      change: '0',
      trend: 'up',
      icon: Building2,
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Avg. Rating',
      value: `${analysis.averageSatisfaction}/10`,
      change: '+0.3',
      trend: 'up',
      icon: Users,
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          University Analytics Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comprehensive professor and course evaluation insights • Real-time performance tracking
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className={`absolute -right-8 -bottom-8 h-24 w-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
          </motion.div>
        ))}
      </div>

      {/* Top Professors Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2"
        >
          <TopProfessors onProfessorClick={handleProfessorClick} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DepartmentAnalytics onDepartmentClick={handleDepartmentClick} />
        </motion.div>
      </div>

      {/* Sentiment & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SentimentAnalysis />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <OpinionOverview />
        </motion.div>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Rating Trends Over Time
          </h3>
          <AnalyticsChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <RecentResponses />
        </motion.div>
      </div>

      {/* Professor Detail Modal */}
      <ProfessorDetailModal
        professor={selectedProfessor}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProfessor(null);
        }}
      />
    </>
  );
} 