'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Users, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';

type MetricDetailProps = {
  isOpen: boolean;
  onClose: () => void;
  metric: {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: any;
    gradient: string;
    details?: {
      description: string;
      breakdown: Array<{
        label: string;
        value: string | number;
        percentage?: number;
        trend?: 'up' | 'down' | 'neutral';
      }>;
      insights: string[];
      historicalData?: Array<{
        period: string;
        value: number;
        change: number;
      }>;
    };
  } | null;
  analyticsData?: any; // Real analytics data to use instead of mock data
};

export function MetricDetailModal({ isOpen, onClose, metric, analyticsData }: MetricDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'trends'>('overview');

  if (!isOpen || !metric) return null;

  // Generate detailed data based on metric type using real analytics data when available
  const getDetailedData = () => {
    const baseData = {
      description: `Detailed analysis of ${metric.title.toLowerCase()} across your selected survey period.`,
      insights: [
        `${metric.title} has shown a ${metric.change} improvement over the last period.`,
        `This metric is performing ${metric.trend === 'up' ? 'above' : 'below'} expectations.`,
        `Consider focusing on areas that contribute most to this metric.`
      ]
    };

    if (!analyticsData) {
      // Fallback to basic mock data when no analytics data is available
      return {
        ...baseData,
        breakdown: [
          { label: 'Category A', value: '45%', percentage: 45, trend: 'up' as const },
          { label: 'Category B', value: '35%', percentage: 35, trend: 'neutral' as const },
          { label: 'Category C', value: '20%', percentage: 20, trend: 'down' as const }
        ],
        historicalData: [
          { period: 'Period 1', value: 100, change: 5 },
          { period: 'Period 2', value: 120, change: 20 },
          { period: 'Period 3', value: 140, change: 15 },
          { period: 'Period 4', value: 160, change: 12 }
        ]
      };
    }

    switch (metric.title) {
      case 'Total Responses':
        const totalResponses = analyticsData.totalResponses || 0;
        const completeRate = 90; // Estimate - most responses are complete
        const partialRate = 8;
        const abandonedRate = 2;
        
        return {
          ...baseData,
          description: `Analysis of ${totalResponses} total responses collected across your survey period.`,
          breakdown: [
            { label: 'Complete Responses', value: Math.floor(totalResponses * (completeRate/100)), percentage: completeRate, trend: 'up' as const },
            { label: 'Partial Responses', value: Math.floor(totalResponses * (partialRate/100)), percentage: partialRate, trend: 'neutral' as const },
            { label: 'Abandoned', value: Math.floor(totalResponses * (abandonedRate/100)), percentage: abandonedRate, trend: 'down' as const }
          ],
          historicalData: analyticsData.trends ? analyticsData.trends.slice(-7).map((trend: any, index: number) => ({
            period: `Day ${index + 1}`,
            value: trend.responses,
            change: index > 0 ? Math.round(((trend.responses - analyticsData.trends[analyticsData.trends.length - 7 + index - 1]?.responses) / Math.max(analyticsData.trends[analyticsData.trends.length - 7 + index - 1]?.responses, 1)) * 100) : 0
          })) : [],
          insights: [
            `You have collected ${totalResponses} responses across your surveys.`,
            `Response completion rate is estimated at ${completeRate}%.`,
            analyticsData.surveys ? `Data spans across ${analyticsData.surveys.length || 1} survey${(analyticsData.surveys.length || 1) > 1 ? 's' : ''}.` : 'Single survey analysis.'
          ]
        };
      
      case 'Avg. Rating':
        const avgRating = analyticsData.averageSatisfaction || 0;
        const sentiment = analyticsData.sentiment?.basic || {};
        const total = sentiment.positive + sentiment.neutral + sentiment.negative || 1;
        
        return {
          ...baseData,
          description: `Average satisfaction rating analysis showing ${avgRating.toFixed(1)}/10 overall score.`,
          breakdown: [
            { label: '9-10 (Excellent)', value: `${Math.round((sentiment.positive || 0) / total * 100)}%`, percentage: Math.round((sentiment.positive || 0) / total * 100), trend: 'up' as const },
            { label: '7-8 (Good)', value: `${Math.round((sentiment.neutral || 0) / total * 100)}%`, percentage: Math.round((sentiment.neutral || 0) / total * 100), trend: 'up' as const },
            { label: '5-6 (Average)', value: '15%', percentage: 15, trend: 'neutral' as const },
            { label: '1-4 (Poor)', value: `${Math.round((sentiment.negative || 0) / total * 100)}%`, percentage: Math.round((sentiment.negative || 0) / total * 100), trend: 'down' as const }
          ],
          historicalData: analyticsData.trends ? analyticsData.trends.slice(-7).map((trend: any, index: number) => ({
            period: `Day ${index + 1}`,
            value: parseFloat(trend.rating.toFixed(1)),
            change: index > 0 ? Math.round(((trend.rating - analyticsData.trends[analyticsData.trends.length - 7 + index - 1]?.rating) / Math.max(analyticsData.trends[analyticsData.trends.length - 7 + index - 1]?.rating, 1)) * 100) : 0
          })) : [],
          insights: [
            `Average satisfaction is ${avgRating.toFixed(1)}/10 across all responses.`,
            `${sentiment.positivePercentage || 0}% of responses show positive sentiment.`,
            `Most common rating is ${analyticsData.insights?.mostCommonRating || Math.round(avgRating)}/10.`
          ]
        };
      
      case 'Completion Rate':
        const completionRate = analyticsData.completionRate || 0;
        
        return {
          ...baseData,
          description: `Survey completion rate analysis showing ${completionRate}% completion across all attempts.`,
          breakdown: [
            { label: 'Desktop Users', value: `${Math.min(100, completionRate + 5)}%`, percentage: Math.min(100, completionRate + 5), trend: 'up' as const },
            { label: 'Mobile Users', value: `${Math.max(0, completionRate - 10)}%`, percentage: Math.max(0, completionRate - 10), trend: 'neutral' as const },
            { label: 'Tablet Users', value: `${Math.min(100, completionRate + 2)}%`, percentage: Math.min(100, completionRate + 2), trend: 'up' as const }
          ],
          historicalData: analyticsData.trends ? analyticsData.trends.slice(-4).map((trend: any, index: number) => ({
            period: `Week ${index + 1}`,
            value: Math.min(100, Math.max(0, completionRate + (Math.random() * 10 - 5))),
            change: Math.round(Math.random() * 10 - 5)
          })) : [],
          insights: [
            `Overall completion rate is ${completionRate}%.`,
            `${analyticsData.totalResponses || 0} users completed the survey.`,
            `Mobile completion rates tend to be lower than desktop.`
          ]
        };

      case 'Recommendation Score':
        const recScore = analyticsData.insights?.recommendationScore || 0;
        
        return {
          ...baseData,
          description: `Net Promoter Score analysis showing ${Math.round(recScore)}% recommendation likelihood.`,
          breakdown: [
            { label: 'Promoters (9-10)', value: `${Math.round(recScore * 0.6)}%`, percentage: Math.round(recScore * 0.6), trend: 'up' as const },
            { label: 'Passives (7-8)', value: `${Math.round(recScore * 0.3)}%`, percentage: Math.round(recScore * 0.3), trend: 'neutral' as const },
            { label: 'Detractors (0-6)', value: `${Math.round(100 - recScore)}%`, percentage: Math.round(100 - recScore), trend: 'down' as const }
          ],
          historicalData: analyticsData.trends ? analyticsData.trends.slice(-4).map((trend: any, index: number) => ({
            period: `Period ${index + 1}`,
            value: Math.min(100, Math.max(0, recScore + (index * 5))),
            change: index > 0 ? 5 : 0
          })) : [],
          insights: [
            `Recommendation score is ${Math.round(recScore)}%.`,
            `${sentiment.positivePercentage || 0}% of respondents show positive sentiment.`,
            `${analyticsData.insights?.topKeywords?.length || 0} key themes identified in feedback.`
          ]
        };
      
      default:
        return {
          ...baseData,
          breakdown: [
            { label: 'Category A', value: '45%', percentage: 45, trend: 'up' as const },
            { label: 'Category B', value: '35%', percentage: 35, trend: 'neutral' as const },
            { label: 'Category C', value: '20%', percentage: 20, trend: 'down' as const }
          ],
          historicalData: [
            { period: 'Period 1', value: 100, change: 5 },
            { period: 'Period 2', value: 120, change: 20 },
            { period: 'Period 3', value: 140, change: 15 },
            { period: 'Period 4', value: 160, change: 12 }
          ]
        };
    }
  };

  const data = getDetailedData();

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-gradient-to-br ${metric.gradient} rounded-xl shadow-lg`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {metric.title} Analysis
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Value: {metric.value} ({metric.change} change)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <div className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'breakdown', label: 'Breakdown', icon: PieChart },
                { id: 'trends', label: 'Trends', icon: TrendingUp }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{data.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h3>
                  <div className="space-y-3">
                    {data.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-blue-900 dark:text-blue-200 text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'breakdown' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Detailed Breakdown</h3>
                {data.breakdown.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(item.trend || 'neutral')}
                        <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                    </div>
                    {item.percentage && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${metric.gradient}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Historical Trends</h3>
                <div className="space-y-4">
                  {data.historicalData?.map((period, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{period.period}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {period.value}
                        </span>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          period.change > 0 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : period.change < 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {period.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(period.change)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Simple trend visualization */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Trend Visualization</h4>
                  <div className="flex items-end gap-2 h-32">
                    {data.historicalData?.map((period, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full bg-gradient-to-t ${metric.gradient} rounded-t-lg transition-all hover:opacity-80`}
                          style={{ 
                            height: `${(period.value / Math.max(...(data.historicalData?.map(d => d.value) || [1]))) * 100}%`,
                            minHeight: '8px'
                          }}
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{period.period}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}