'use client';

import { motion } from 'framer-motion';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';

const stats = [
  {
    title: 'Total Responses',
    value: '2,345',
    change: '+12.5%',
    trend: 'up',
    icon: Activity,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Active Surveys',
    value: '18',
    change: '+3',
    trend: 'up',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Response Rate',
    value: '67.8%',
    change: '-2.3%',
    trend: 'down',
    icon: TrendingDown,
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    title: 'Unique Participants',
    value: '892',
    change: '+45',
    trend: 'up',
    icon: Users,
    gradient: 'from-violet-500 to-purple-500',
  },
];

export default function AnalyticsPage() {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Analytics
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Track your survey performance and insights
        </p>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className={`absolute -right-8 -bottom-8 h-24 w-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl`} />
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Response Trends
          </h3>
          <AnalyticsChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performing Surveys
          </h3>
          <div className="space-y-4">
            {['Customer Satisfaction Q4', 'Product Feedback 2024', 'Employee Wellness Check'].map((survey, index) => (
              <div key={survey} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 bg-gradient-to-b ${index === 0 ? 'from-emerald-500 to-teal-500' : index === 1 ? 'from-blue-500 to-cyan-500' : 'from-violet-500 to-purple-500'} rounded-full`} />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{survey}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {index === 0 ? '342' : index === 1 ? '289' : '198'} responses
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
} 