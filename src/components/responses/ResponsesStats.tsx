'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Phone, Mail, User, TrendingUp, Activity, Clock, BarChart3 } from 'lucide-react';

interface ResponsesStatsProps {
  responses: Array<{
    id: string;
    type: 'text' | 'voice-extracted' | 'anonymous';
    email?: string;
    submittedAt: string;
    metadata?: {
      duration?: number;
    };
  }>;
}

export function ResponsesStats({ responses }: ResponsesStatsProps) {
  const totalResponses = responses.length;
  const voiceResponses = responses.filter(r => r.type === 'voice-extracted').length;
  const emailResponses = responses.filter(r => r.email && r.type !== 'anonymous').length;
  const anonymousResponses = responses.filter(r => r.type === 'anonymous' || !r.email).length;
  
  // Calculate response trends (last 7 days vs previous 7 days)
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const recentResponses = responses.filter(r => new Date(r.submittedAt) >= last7Days).length;
  const previousResponses = responses.filter(r => 
    new Date(r.submittedAt) >= previous7Days && new Date(r.submittedAt) < last7Days
  ).length;
  
  const trendPercentage = previousResponses > 0 
    ? ((recentResponses - previousResponses) / previousResponses * 100).toFixed(1)
    : '0';

  // Average response time for voice surveys
  const voiceWithDuration = responses.filter(r => r.type === 'voice-extracted' && r.metadata?.duration);
  const avgDuration = voiceWithDuration.length > 0
    ? voiceWithDuration.reduce((sum, r) => sum + (r.metadata?.duration || 0), 0) / voiceWithDuration.length
    : 0;

  const stats = [
    {
      title: 'Total Responses',
      value: totalResponses.toString(),
      change: `${trendPercentage}%`,
      trend: parseFloat(trendPercentage) >= 0 ? 'up' : 'down',
      icon: Activity,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'All survey responses'
    },
    {
      title: 'Voice Responses',
      value: voiceResponses.toString(),
      change: `${((voiceResponses / totalResponses) * 100).toFixed(1)}%`,
      trend: 'up',
      icon: Phone,
      gradient: 'from-emerald-500 to-teal-500',
      description: 'Voice survey completions'
    },
    {
      title: 'Email Responses',
      value: emailResponses.toString(),
      change: `${((emailResponses / totalResponses) * 100).toFixed(1)}%`,
      trend: 'up',
      icon: Mail,
      gradient: 'from-purple-500 to-indigo-500',
      description: 'Identified respondents'
    },
    {
      title: 'Anonymous',
      value: anonymousResponses.toString(),
      change: `${((anonymousResponses / totalResponses) * 100).toFixed(1)}%`,
      trend: 'up',
      icon: User,
      gradient: 'from-rose-500 to-pink-500',
      description: 'Anonymous submissions'
    },
    {
      title: 'Avg Voice Duration',
      value: `${Math.round(avgDuration)}s`,
      change: avgDuration > 60 ? 'Detailed' : 'Quick',
      trend: 'up',
      icon: Clock,
      gradient: 'from-orange-500 to-red-500',
      description: 'Average call length'
    },
    {
      title: 'Response Rate',
      value: '78%',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-violet-500 to-purple-500',
      description: 'Completion rate'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg group-hover:shadow-xl transition-shadow`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' 
                    ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20' 
                    : 'text-rose-600 bg-rose-100 dark:bg-rose-900/20'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform">
              {stat.value}
            </p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
              {stat.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {stat.description}
            </p>
          </div>
          
          <div className={`absolute -right-8 -bottom-8 h-24 w-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
        </motion.div>
      ))}
    </div>
  );
}