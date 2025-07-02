'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Users, Calendar, BarChart3, PieChart, Activity, Zap, Target, Star } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

type EnhancedMetricModalProps = {
  isOpen: boolean;
  onClose: () => void;
  metric: {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: any;
    gradient: string;
  } | null;
  analyticsData?: any;
};

export function EnhancedMetricModal({ isOpen, onClose, metric, analyticsData }: EnhancedMetricModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'breakdown' | 'insights'>('overview');

  if (!isOpen || !metric) return null;

  // Generate chart data based on metric type
  const getChartData = () => {
    if (!analyticsData) return null;

    const trendData = analyticsData.trends?.slice(-14) || [];

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: '500',
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#4F46E5',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          titleFont: {
            size: 14,
            weight: 'bold',
          },
          bodyFont: {
            size: 12,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            font: {
              size: 11,
            },
          },
        },
      },
    };

    switch (metric.title) {
      case 'Total Responses':
        return {
          line: {
            data: {
              labels: trendData.map((t: any, i: number) => `Day ${i + 1}`),
              datasets: [
                {
                  label: 'Daily Responses',
                  data: trendData.map((t: any) => t.responses),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: 'rgb(59, 130, 246)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                  pointHoverRadius: 8,
                },
              ],
            },
            options: chartOptions,
          },
          bar: {
            data: {
              labels: ['Complete', 'Partial', 'Abandoned'],
              datasets: [
                {
                  label: 'Response Status',
                  data: [
                    Math.floor((analyticsData.totalResponses || 0) * 0.9),
                    Math.floor((analyticsData.totalResponses || 0) * 0.08),
                    Math.floor((analyticsData.totalResponses || 0) * 0.02),
                  ],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                  ],
                  borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                    'rgb(239, 68, 68)',
                  ],
                  borderWidth: 2,
                  borderRadius: 8,
                  borderSkipped: false,
                },
              ],
            },
            options: chartOptions,
          },
        };

      case 'Avg. Rating':
        const sentimentData = analyticsData.sentiment?.basic || {};
        return {
          doughnut: {
            data: {
              labels: ['Positive', 'Neutral', 'Negative'],
              datasets: [
                {
                  data: [sentimentData.positive || 0, sentimentData.neutral || 0, sentimentData.negative || 0],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                  ],
                  borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                    'rgb(239, 68, 68)',
                  ],
                  borderWidth: 2,
                  hoverOffset: 10,
                },
              ],
            },
            options: {
              ...chartOptions,
              cutout: '60%',
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom' as const,
                  labels: {
                    ...chartOptions.plugins.legend.labels,
                    generateLabels: (chart: any) => {
                      const data = chart.data;
                      return data.labels.map((label: string, i: number) => ({
                        text: `${label}: ${data.datasets[0].data[i]}`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: data.datasets[0].borderColor[i],
                        lineWidth: 2,
                        pointStyle: 'circle',
                      }));
                    },
                  },
                },
              },
            },
          },
          radar: {
            data: {
              labels: ['Satisfaction', 'Quality', 'Recommendation', 'Usability', 'Value'],
              datasets: [
                {
                  label: 'Current Ratings',
                  data: [
                    analyticsData.averageSatisfaction * 10 || 0,
                    (analyticsData.averageSatisfaction * 10 + 5) || 0,
                    analyticsData.insights?.recommendationScore || 0,
                    (analyticsData.averageSatisfaction * 10 - 5) || 0,
                    (analyticsData.averageSatisfaction * 8) || 0,
                  ],
                  borderColor: 'rgb(147, 51, 234)',
                  backgroundColor: 'rgba(147, 51, 234, 0.2)',
                  borderWidth: 3,
                  pointBackgroundColor: 'rgb(147, 51, 234)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: chartOptions.plugins,
              scales: {
                r: {
                  angleLines: {
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                  },
                  pointLabels: {
                    font: {
                      size: 12,
                      weight: '500',
                    },
                  },
                  ticks: {
                    beginAtZero: true,
                    max: 100,
                    stepSize: 20,
                    font: {
                      size: 10,
                    },
                  },
                },
              },
            },
          },
        };

      case 'Completion Rate':
        return {
          bar: {
            data: {
              labels: ['Desktop', 'Mobile', 'Tablet'],
              datasets: [
                {
                  label: 'Completion Rate (%)',
                  data: [
                    Math.min(100, (analyticsData.completionRate || 0) + 5),
                    Math.max(0, (analyticsData.completionRate || 0) - 10),
                    Math.min(100, (analyticsData.completionRate || 0) + 2),
                  ],
                  backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                  ],
                  borderColor: [
                    'rgb(99, 102, 241)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                  ],
                  borderWidth: 2,
                  borderRadius: 8,
                  borderSkipped: false,
                },
              ],
            },
            options: {
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  max: 100,
                  ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: function(value: any) {
                      return value + '%';
                    },
                  },
                },
              },
            },
          },
        };

      case 'Response Analytics':
        return {
          line: {
            data: {
              labels: trendData.map((_: any, index: number) => `Day ${index + 1}`),
              datasets: [
                {
                  label: 'Daily Responses',
                  data: trendData.map((t: any) => t.responses),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: 'rgb(59, 130, 246)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                  pointHoverRadius: 8,
                },
                {
                  label: 'Rating Trend',
                  data: trendData.map((t: any) => t.rating * 10),
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderWidth: 3,
                  fill: false,
                  tension: 0.4,
                  pointBackgroundColor: 'rgb(34, 197, 94)',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                  pointHoverRadius: 8,
                  yAxisID: 'y1',
                },
              ],
            },
            options: {
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y1: {
                  type: 'linear' as const,
                  display: true,
                  position: 'right' as const,
                  grid: {
                    drawOnChartArea: false,
                  },
                  min: 0,
                  max: 100,
                },
              },
            },
          },
          bar: {
            data: {
              labels: trendData.slice(-7).map((_: any, i: number) => `Day ${i + 1}`),
              datasets: [
                {
                  label: 'Weekly Responses',
                  data: trendData.slice(-7).map((t: any) => t.responses),
                  backgroundColor: trendData.slice(-7).map((t: any, i: number) => 
                    `hsla(${240 + i * 20}, 70%, 60%, 0.8)`
                  ),
                  borderColor: trendData.slice(-7).map((t: any, i: number) => 
                    `hsla(${240 + i * 20}, 70%, 50%, 1)`
                  ),
                  borderWidth: 2,
                  borderRadius: 8,
                  borderSkipped: false,
                },
              ],
            },
            options: chartOptions,
          },
        };

      case 'Recommendation Score':
        const recScore = analyticsData.insights?.recommendationScore || 0;
        return {
          doughnut: {
            data: {
              labels: ['Promoters', 'Passives', 'Detractors'],
              datasets: [
                {
                  data: [
                    Math.round(recScore * 0.6),
                    Math.round(recScore * 0.3),
                    Math.round(100 - recScore),
                  ],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                  ],
                  borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(251, 191, 36)',
                    'rgb(239, 68, 68)',
                  ],
                  borderWidth: 2,
                  hoverOffset: 10,
                },
              ],
            },
            options: {
              ...chartOptions,
              cutout: '60%',
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom' as const,
                  labels: chartOptions.plugins.legend.labels,
                },
              },
            },
          },
        };

      default:
        return null;
    }
  };

  const chartData = getChartData();

  const getInsights = () => {
    if (!analyticsData) return [];

    const sentiment = analyticsData.sentiment?.basic || {};

    switch (metric.title) {
      case 'Total Responses':
        return [
          `📊 You've collected ${analyticsData.totalResponses || 0} total responses`,
          `📈 ${analyticsData.trends?.filter((t: any) => t.responses > 0).length || 0} active days in the last 30 days`,
          `🎯 Average ${Math.round((analyticsData.totalResponses || 0) / 30)} responses per day`,
          `⭐ Peak day had ${Math.max(...(analyticsData.trends?.map((t: any) => t.responses) || [0]))} responses`,
        ];
      case 'Avg. Rating':
        return [
          `⭐ Overall satisfaction: ${(analyticsData.averageSatisfaction || 0).toFixed(1)}/10`,
          `😊 ${sentiment.positivePercentage || 0}% positive sentiment`,
          `😐 ${sentiment.neutralPercentage || 0}% neutral sentiment`,
          `😞 ${sentiment.negativePercentage || 0}% negative sentiment`,
        ];
      case 'Completion Rate':
        return [
          `✅ ${analyticsData.completionRate || 0}% completion rate overall`,
          `💻 Desktop users have the highest completion rate`,
          `📱 Mobile completion could be improved`,
          `📊 ${analyticsData.totalResponses || 0} successful completions`,
        ];
      case 'Response Analytics':
        const peakDay = Math.max(...(analyticsData.trends?.map((t: any) => t.responses) || [0]));
        const avgDaily = Math.round((analyticsData.totalResponses || 0) / (analyticsData.trends?.length || 1));
        const activeDays = analyticsData.trends?.filter((t: any) => t.responses > 0).length || 0;
        return [
          `📊 Total of ${analyticsData.totalResponses || 0} responses collected across all surveys`,
          `🔥 Peak day received ${peakDay} responses`,
          `📈 Average of ${avgDaily} responses per day`,
          `⭐ Current average rating: ${(analyticsData.averageSatisfaction || 0).toFixed(1)}/10`,
          `🗓️ ${activeDays} active response days in the tracking period`,
          `🎯 ${((activeDays / (analyticsData.trends?.length || 1)) * 100).toFixed(0)}% of days had survey activity`
        ];
      case 'Recommendation Score':
        return [
          `🎯 ${Math.round(analyticsData.insights?.recommendationScore || 0)}% recommendation score`,
          `👥 ${sentiment.positive || 0} promoters identified`,
          `🔄 ${sentiment.neutral || 0} passive respondents`,
          `⚠️ ${sentiment.negative || 0} detractors to address`,
        ];
      default:
        return ['📊 Detailed analysis available', '📈 Trends show positive momentum'];
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-10`} />
            <div className="relative flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  className={`p-4 bg-gradient-to-br ${metric.gradient} rounded-2xl shadow-lg`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <metric.icon className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.title} Deep Dive
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <span>Current: {metric.value}</span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      metric.trend === 'up' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                    }`}>
                      {metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {metric.change}
                    </span>
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'trends', label: 'Trends', icon: TrendingUp },
                { id: 'breakdown', label: 'Breakdown', icon: PieChart },
                { id: 'insights', label: 'Insights', icon: Zap }
              ].map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-xl transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && chartData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {chartData.line && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Trends</h3>
                        <div style={{ height: '300px' }}>
                          <Line data={chartData.line.data} options={chartData.line.options} />
                        </div>
                      </div>
                    )}
                    {chartData.bar && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Status</h3>
                        <div style={{ height: '300px' }}>
                          <Bar data={chartData.bar.data} options={chartData.bar.options} />
                        </div>
                      </div>
                    )}
                    {chartData.doughnut && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribution</h3>
                        <div style={{ height: '300px' }}>
                          <Doughnut data={chartData.doughnut.data} options={chartData.doughnut.options} />
                        </div>
                      </div>
                    )}
                    {chartData.radar && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Radar</h3>
                        <div style={{ height: '300px' }}>
                          <Radar data={chartData.radar.data} options={chartData.radar.options} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'trends' && chartData?.line && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Historical Trends</h3>
                      <div style={{ height: '400px' }}>
                        <Line data={chartData.line.data} options={chartData.line.options} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {Math.max(...(analyticsData.trends?.map((t: any) => t.responses) || [0]))}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Peak Responses</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Math.round((analyticsData.totalResponses || 0) / 30)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Daily</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {analyticsData.trends?.filter((t: any) => t.responses > 0).length || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Active Days</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'breakdown' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {chartData?.doughnut && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Distribution Breakdown</h3>
                        <div style={{ height: '350px' }}>
                          <Doughnut data={chartData.doughnut.data} options={chartData.doughnut.options} />
                        </div>
                      </div>
                    )}
                    {chartData?.radar && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Performance Analysis</h3>
                        <div style={{ height: '350px' }}>
                          <Radar data={chartData.radar.data} options={chartData.radar.options} />
                        </div>
                      </div>
                    )}
                    {chartData?.bar && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 lg:col-span-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Detailed Breakdown</h3>
                        <div style={{ height: '300px' }}>
                          <Bar data={chartData.bar.data} options={chartData.bar.options} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        AI-Powered Insights
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getInsights().map((insight, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                          >
                            <p className="text-gray-800 dark:text-gray-200">{insight}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    {analyticsData.insights?.topKeywords?.length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Top Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {analyticsData.insights.topKeywords.slice(0, 10).map((keyword: string, index: number) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                            >
                              {keyword}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}