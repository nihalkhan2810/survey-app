'use client';

import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign, ArrowUpRight, ChevronRight, Users, ShoppingCart, Heart } from 'lucide-react';

interface CustomerSegment {
  segment: string;
  revenue: number;
  growthRate: number;
  churnRisk: 'Low' | 'Medium' | 'High';
  lifetimeValue: number;
  satisfactionScore: number;
  engagementRate: number;
  conversionRate: number;
  customerCount: number;
}

interface CustomerAnalyticsProps {
  onSegmentClick?: (segment: CustomerSegment) => void;
}

const customerSegments: CustomerSegment[] = [
  {
    segment: 'Enterprise Champions',
    revenue: 847600,
    growthRate: 24.8,
    churnRisk: 'Low',
    lifetimeValue: 45200,
    satisfactionScore: 9.2,
    engagementRate: 87.3,
    conversionRate: 34.6,
    customerCount: 127
  },
  {
    segment: 'Growth Accelerators',
    revenue: 623400,
    growthRate: 31.2,
    churnRisk: 'Medium',
    lifetimeValue: 28900,
    satisfactionScore: 8.8,
    engagementRate: 72.1,
    conversionRate: 28.3,
    customerCount: 284
  },
  {
    segment: 'Emerging Innovators',
    revenue: 456700,
    growthRate: 18.7,
    churnRisk: 'Low',
    lifetimeValue: 18600,
    satisfactionScore: 9.0,
    engagementRate: 81.4,
    conversionRate: 22.8,
    customerCount: 512
  },
  {
    segment: 'Value Seekers',
    revenue: 234800,
    growthRate: -5.2,
    churnRisk: 'High',
    lifetimeValue: 8400,
    satisfactionScore: 7.6,
    engagementRate: 58.2,
    conversionRate: 15.7,
    customerCount: 743
  },
  {
    segment: 'Premium Loyalists',
    revenue: 589300,
    growthRate: 12.4,
    churnRisk: 'Low',
    lifetimeValue: 52700,
    satisfactionScore: 9.4,
    engagementRate: 94.6,
    conversionRate: 41.2,
    customerCount: 89
  }
];

export function CustomerAnalytics({ onSegmentClick }: CustomerAnalyticsProps) {
  const getRevenueColor = (revenue: number) => {
    if (revenue >= 600000) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (revenue >= 400000) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (revenue >= 300000) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
  };

  const getChurnColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      default: return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
    }
  };

  const getGrowthTrend = (rate: number) => {
    return rate >= 0 ? { icon: ArrowUpRight, color: 'text-green-500' } : { icon: TrendingUp, color: 'text-red-500' };
  };

  const topSegments = [...customerSegments]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Powerhouse Segments</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Customer lifetime value & growth insights</p>
        </div>
      </div>

      <div className="space-y-4">
        {topSegments.map((segment, index) => {
          const GrowthIcon = getGrowthTrend(segment.growthRate).icon;
          const growthColor = getGrowthTrend(segment.growthRate).color;
          
          return (
            <motion.div
              key={segment.segment}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              onClick={() => onSegmentClick?.(segment)}
              className="group relative overflow-hidden p-5 bg-gradient-to-r from-white to-gray-50/80 dark:from-gray-800/80 dark:to-gray-700/40 rounded-xl border border-gray-200/60 dark:border-gray-600/40 hover:border-violet-200 dark:hover:border-violet-700/50 transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl text-lg font-bold shadow-lg">
                      #{index + 1}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Heart className="h-2.5 w-2.5 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{segment.segment}</h4>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getChurnColor(segment.churnRisk)}`}>
                        {segment.churnRisk} Risk
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {segment.customerCount.toLocaleString()} customers
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {segment.conversionRate}% conversion
                        </span>
                      </div>
                    </div>

                    {/* Revenue Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LTV: {formatCurrency(segment.lifetimeValue)}</span>
                        <span className="text-sm text-gray-500">Engagement: {segment.engagementRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((segment.engagementRate / 100) * 100, 100)}%` }}
                          transition={{ delay: index * 0.3, duration: 1.2 }}
                          className="h-2.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm ${getRevenueColor(segment.revenue)}`}>
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(segment.revenue)}
                  </div>
                  <div className={`flex items-center gap-1 mt-2 justify-end ${growthColor}`}>
                    <GrowthIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {segment.growthRate > 0 ? '+' : ''}{segment.growthRate.toFixed(1)}%
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all mt-2 ml-auto" />
                </div>
              </div>

              {/* Decorative Background */}
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-purple-600/10 rounded-full group-hover:scale-110 transition-transform" />
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-gradient-to-br from-violet-400/5 to-purple-500/5 rounded-full group-hover:scale-110 transition-transform" />
            </motion.div>
          );
        })}
      </div>

      {/* Advanced Business Metrics */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/60 dark:border-emerald-700/50 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(customerSegments.reduce((sum, seg) => sum + seg.revenue, 0))}
              </p>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Total ARR</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/60 dark:border-blue-700/50 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {formatCurrency(customerSegments.reduce((sum, seg) => sum + seg.lifetimeValue * seg.customerCount, 0) / customerSegments.reduce((sum, seg) => sum + seg.customerCount, 0))}
              </p>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Avg Customer LTV</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/60 dark:border-violet-700/50 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-violet-600" />
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                {customerSegments.filter(seg => seg.churnRisk === 'Low').length}
              </p>
            </div>
            <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">Stable Segments</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}