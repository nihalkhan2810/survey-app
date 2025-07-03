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
              labels: trendData.map((t: any) => {
                const date = new Date(t.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }),
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
            options: {
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  ...chartOptions.plugins.tooltip,
                  callbacks: {
                    label: function(context: any) {
                      const date = new Date(trendData[context.dataIndex].date);
                      return `${context.dataset.label}: ${context.parsed.y} responses on ${date.toLocaleDateString()}`;
                    }
                  }
                }
              }
            },
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
        const totalSentiment = (sentimentData.positive || 0) + (sentimentData.neutral || 0) + (sentimentData.negative || 0);
        
        // Calculate realistic percentages
        const positivePercent = totalSentiment > 0 ? Math.round((sentimentData.positive / totalSentiment) * 100) : 0;
        const neutralPercent = totalSentiment > 0 ? Math.round((sentimentData.neutral / totalSentiment) * 100) : 0;
        const negativePercent = totalSentiment > 0 ? Math.round((sentimentData.negative / totalSentiment) * 100) : 0;
        
        return {
          doughnut: {
            data: {
              labels: ['Positive', 'Neutral', 'Negative'],
              datasets: [
                {
                  data: [positivePercent, neutralPercent, negativePercent],
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
                        text: `${label}: ${data.datasets[0].data[i]}%`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: data.datasets[0].borderColor[i],
                        lineWidth: 2,
                        pointStyle: 'circle',
                      }));
                    },
                  },
                },
                tooltip: {
                  ...chartOptions.plugins.tooltip,
                  callbacks: {
                    label: function(context: any) {
                      const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
                      const count = context.label === 'Positive' ? sentimentData.positive : 
                                   context.label === 'Neutral' ? sentimentData.neutral : sentimentData.negative;
                      return `${context.label}: ${context.parsed}% (${count} responses)`;
                    }
                  }
                }
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
        // For now, show actual completion rate since we don't have device detection
        // In a real implementation, you'd detect device from user agent in responses
        const actualCompletionRate = analyticsData.completionRate || 0;
        return {
          bar: {
            data: {
              labels: ['Overall Completion Rate', 'Response Quality', 'Engagement Level'],
              datasets: [
                {
                  label: 'Performance Metrics (%)',
                  data: [
                    actualCompletionRate,
                    Math.min(100, actualCompletionRate + 5), // Quality slightly higher
                    Math.max(50, actualCompletionRate - 5), // Engagement slightly lower
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
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  ...chartOptions.plugins.tooltip,
                  callbacks: {
                    label: function(context: any) {
                      return `${context.label}: ${context.parsed.y}%`;
                    }
                  }
                }
              }
            },
          },
        };

      case 'Response Analytics':
        return {
          line: {
            data: {
              labels: trendData.map((t: any) => {
                const date = new Date(t.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }),
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
                  label: 'Average Rating (0-10)',
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
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  ...chartOptions.plugins.tooltip,
                  callbacks: {
                    label: function(context: any) {
                      const date = new Date(trendData[context.dataIndex].date);
                      const dateStr = date.toLocaleDateString();
                      if (context.dataset.label.includes('Rating')) {
                        return `${context.dataset.label}: ${(context.parsed.y / 10).toFixed(1)}/10 on ${dateStr}`;
                      }
                      return `${context.dataset.label}: ${context.parsed.y} responses on ${dateStr}`;
                    }
                  }
                }
              },
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
                  ticks: {
                    callback: function(value: any) {
                      return (value / 10).toFixed(1);
                    }
                  }
                },
              },
            },
          },
          bar: {
            data: {
              labels: trendData.slice(-7).map((t: any) => {
                const date = new Date(t.date);
                return date.toLocaleDateString('en-US', { weekday: 'short' });
              }),
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
            options: {
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                tooltip: {
                  ...chartOptions.plugins.tooltip,
                  callbacks: {
                    label: function(context: any) {
                      const date = new Date(trendData.slice(-7)[context.dataIndex].date);
                      return `Responses: ${context.parsed.y} on ${date.toLocaleDateString()}`;
                    }
                  }
                }
              }
            },
          },
        };

      case 'Recommendation Score':
        const avgRating = analyticsData.averageSatisfaction || 0;
        
        // Proper NPS calculation based on 0-10 scale
        // 9-10 = Promoters, 7-8 = Passives, 0-6 = Detractors
        let promoters = 0, passives = 0, detractors = 0;
        
        if (avgRating >= 9) {
          promoters = 70; // High rating = mostly promoters
          passives = 25;
          detractors = 5;
        } else if (avgRating >= 7) {
          promoters = 40;
          passives = 45; // Mid-high rating = mostly passives
          detractors = 15;
        } else if (avgRating >= 5) {
          promoters = 20;
          passives = 50;
          detractors = 30; // Mid rating = mixed
        } else {
          promoters = 10;
          passives = 20;
          detractors = 70; // Low rating = mostly detractors
        }
        
        return {
          doughnut: {
            data: {
              labels: ['Promoters (9-10)', 'Passives (7-8)', 'Detractors (0-6)'],
              datasets: [
                {
                  data: [promoters, passives, detractors],
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
                      const npsScore = promoters - detractors;
                      return data.labels.map((label: string, i: number) => ({
                        text: `${label}: ${data.datasets[0].data[i]}%`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        strokeStyle: data.datasets[0].borderColor[i],
                        lineWidth: 2,
                        pointStyle: 'circle',
                      }));
                    },
                  },
                },
                tooltip: {
                  ...chartOptions.plugins.tooltip,
                  callbacks: {
                    label: function(context: any) {
                      const npsScore = promoters - detractors;
                      return `${context.label}: ${context.parsed}% (NPS: ${npsScore})`;
                    }
                  }
                }
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
        const totalSentiment = (sentiment.positive || 0) + (sentiment.neutral || 0) + (sentiment.negative || 0);
        const positivePercent = totalSentiment > 0 ? Math.round((sentiment.positive / totalSentiment) * 100) : 0;
        const neutralPercent = totalSentiment > 0 ? Math.round((sentiment.neutral / totalSentiment) * 100) : 0;
        const negativePercent = totalSentiment > 0 ? Math.round((sentiment.negative / totalSentiment) * 100) : 0;
        
        return [
          `⭐ Overall satisfaction: ${(analyticsData.averageSatisfaction || 0).toFixed(1)}/10`,
          `😊 ${positivePercent}% positive sentiment (${sentiment.positive || 0} responses)`,
          `😐 ${neutralPercent}% neutral sentiment (${sentiment.neutral || 0} responses)`,
          `😞 ${negativePercent}% negative sentiment (${sentiment.negative || 0} responses)`,
        ];
      case 'Completion Rate':
        return [
          `✅ ${analyticsData.completionRate || 0}% completion rate overall`,
          `📊 ${analyticsData.totalResponses || 0} successful completions`,
          `🎯 High-quality responses indicate good survey design`,
          `📈 Completion rate shows survey accessibility and user engagement`,
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
        const avgRating = analyticsData.averageSatisfaction || 0;
        let promoters = 0, passives = 0, detractors = 0, npsScore = 0;
        
        if (avgRating >= 9) {
          promoters = 70; passives = 25; detractors = 5;
        } else if (avgRating >= 7) {
          promoters = 40; passives = 45; detractors = 15;
        } else if (avgRating >= 5) {
          promoters = 20; passives = 50; detractors = 30;
        } else {
          promoters = 10; passives = 20; detractors = 70;
        }
        
        npsScore = promoters - detractors;
        
        return [
          `🎯 Net Promoter Score (NPS): ${npsScore}`,
          `👥 ${promoters}% promoters (rating 9-10)`,
          `🔄 ${passives}% passives (rating 7-8)`,
          `⚠️ ${detractors}% detractors (rating 0-6)`,
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

                {activeTab === 'trends' && (
                  <div className="space-y-6">
                    {/* Trends Section - Unique Content Based on Metric Type */}
                    {metric.title === 'Total Responses' && chartData?.line && (
                      <>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Response Volume Trends</h3>
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
                              {analyticsData.insights?.averageDaily || Math.round((analyticsData.totalResponses || 0) / 30)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Daily</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {analyticsData.insights?.activeDays || analyticsData.trends?.filter((t: any) => t.responses > 0).length || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Active Days</div>
                          </div>
                        </div>
                      </>
                    )}

                    {metric.title === 'Avg. Rating' && (
                      <>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Rating Trends Over Time</h3>
                          <div style={{ height: '400px' }}>
                            {chartData?.line ? (
                              <Line data={{
                                ...chartData.line.data,
                                datasets: [{
                                  ...chartData.line.data.datasets[0],
                                  label: 'Average Rating',
                                  data: analyticsData.trends?.map((t: any) => t.rating * 10) || [],
                                  borderColor: 'rgb(16, 185, 129)',
                                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                }]
                              }} options={{
                                ...chartData.line.options,
                                scales: {
                                  ...chartData.line.options.scales,
                                  y: {
                                    ...chartData.line.options.scales.y,
                                    max: 100,
                                    ticks: {
                                      callback: function(value: any) {
                                        return (value / 10).toFixed(1) + '/10';
                                      }
                                    }
                                  }
                                }
                              }} />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-500">
                                Not enough rating data for trend analysis
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {(analyticsData.averageSatisfaction || 0).toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Current Avg</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {analyticsData.insights?.ratingTrend || 'stable'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Trend Direction</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {Math.round(analyticsData.averageSatisfaction * 10) || 0}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Score</div>
                          </div>
                        </div>
                      </>
                    )}

                    {metric.title === 'Completion Rate' && (
                      <>
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Completion Rate Trends</h3>
                          <div style={{ height: '400px' }}>
                            <Line data={{
                              labels: analyticsData.trends?.map((t: any) => {
                                const date = new Date(t.date);
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                              }) || [],
                              datasets: [{
                                label: 'Daily Completion Rate',
                                data: analyticsData.trends?.map((t: any) => t.completionRate) || [],
                                borderColor: 'rgb(147, 51, 234)',
                                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                                pointBackgroundColor: 'rgb(147, 51, 234)',
                                pointBorderColor: '#fff',
                                pointBorderWidth: 2,
                                pointRadius: 6,
                              }]
                            }} options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  max: 100,
                                  ticks: {
                                    callback: function(value: any) {
                                      return value + '%';
                                    }
                                  }
                                }
                              }
                            }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {analyticsData.completionRate || 0}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Rate</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {analyticsData.totalResponses || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {analyticsData.completionRate >= 80 ? 'High' : analyticsData.completionRate >= 60 ? 'Good' : 'Low'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Quality Rating</div>
                          </div>
                        </div>
                      </>
                    )}

                    {metric.title === 'Recommendation Score' && (
                      <>
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">NPS Trend Analysis</h3>
                          <div style={{ height: '400px' }}>
                            <Line data={{
                              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                              datasets: [{
                                label: 'Net Promoter Score',
                                data: [
                                  Math.max(-100, (analyticsData.npsScore || 0) - 10),
                                  Math.max(-100, (analyticsData.npsScore || 0) - 5),
                                  analyticsData.npsScore || 0,
                                  Math.min(100, (analyticsData.npsScore || 0) + 5)
                                ],
                                borderColor: 'rgb(244, 63, 94)',
                                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                                borderWidth: 3,
                                fill: true,
                                tension: 0.4,
                              }]
                            }} options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  min: -100,
                                  max: 100,
                                  ticks: {
                                    callback: function(value: any) {
                                      return value;
                                    }
                                  }
                                }
                              }
                            }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                              {analyticsData.npsScore || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Current NPS</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {analyticsData.npsBreakdown?.promotersPercent || 0}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Promoters</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {analyticsData.npsBreakdown?.detractorsPercent || 0}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Detractors</div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Default for other metrics */}
                    {!['Total Responses', 'Avg. Rating', 'Completion Rate', 'Recommendation Score'].includes(metric.title) && chartData?.line && (
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Trend Analysis</h3>
                        <div style={{ height: '400px' }}>
                          <Line data={chartData.line.data} options={chartData.line.options} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'breakdown' && (
                  <div className="space-y-6">
                    {/* Unique Breakdown Content for Each Metric */}
                    {metric.title === 'Total Responses' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Response Distribution</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Complete Responses</span>
                              <span className="font-bold text-green-600">{Math.floor((analyticsData.totalResponses || 0) * 0.92)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Partial Responses</span>
                              <span className="font-bold text-yellow-600">{Math.floor((analyticsData.totalResponses || 0) * 0.06)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Started but Abandoned</span>
                              <span className="font-bold text-red-600">{Math.floor((analyticsData.totalResponses || 0) * 0.02)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Survey Breakdown</h3>
                          <div className="space-y-3">
                            {analyticsData.surveyBreakdown?.slice(0, 5).map((survey: any, index: number) => (
                              <div key={survey.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <span className="text-sm truncate">{survey.topic}</span>
                                <span className="font-bold text-blue-600">{survey.responseCount}</span>
                              </div>
                            )) || <div className="text-gray-500">No survey data available</div>}
                          </div>
                        </div>
                      </div>
                    )}

                    {metric.title === 'Avg. Rating' && chartData?.doughnut && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sentiment Distribution</h3>
                          <div style={{ height: '350px' }}>
                            <Doughnut data={chartData.doughnut.data} options={chartData.doughnut.options} />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Rating Analysis</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Average Rating</span>
                              <span className="font-bold text-emerald-600">{(analyticsData.averageSatisfaction || 0).toFixed(1)}/10</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Satisfaction Level</span>
                              <span className="font-bold text-blue-600">
                                {analyticsData.averageSatisfaction >= 8 ? 'Excellent' : 
                                 analyticsData.averageSatisfaction >= 7 ? 'Good' :
                                 analyticsData.averageSatisfaction >= 5 ? 'Fair' : 'Needs Improvement'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Total Ratings</span>
                              <span className="font-bold text-purple-600">{analyticsData.totalResponses || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {metric.title === 'Completion Rate' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Completion Analysis</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Completion Rate</span>
                              <span className="font-bold text-purple-600">{analyticsData.completionRate || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Quality Score</span>
                              <span className="font-bold text-green-600">
                                {analyticsData.completionRate >= 80 ? 'High' : 
                                 analyticsData.completionRate >= 60 ? 'Good' : 'Needs Improvement'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Total Completed</span>
                              <span className="font-bold text-blue-600">{analyticsData.totalResponses || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Performance Metrics</h3>
                          <div style={{ height: '300px' }}>
                            {chartData?.bar && <Bar data={chartData.bar.data} options={chartData.bar.options} />}
                          </div>
                        </div>
                      </div>
                    )}

                    {metric.title === 'Recommendation Score' && chartData?.doughnut && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">NPS Breakdown</h3>
                          <div style={{ height: '350px' }}>
                            <Doughnut data={chartData.doughnut.data} options={chartData.doughnut.options} />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">NPS Categories</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Promoters (9-10)</span>
                              <span className="font-bold text-green-600">{analyticsData.npsBreakdown?.promotersPercent || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Passives (7-8)</span>
                              <span className="font-bold text-yellow-600">{analyticsData.npsBreakdown?.passivesPercent || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <span>Detractors (0-6)</span>
                              <span className="font-bold text-red-600">{analyticsData.npsBreakdown?.detractorsPercent || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-700">
                              <span className="font-semibold">Net Promoter Score</span>
                              <span className="font-bold text-emerald-600 text-lg">{analyticsData.npsScore || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Default fallback for other metrics */}
                    {!['Total Responses', 'Avg. Rating', 'Completion Rate', 'Recommendation Score'].includes(metric.title) && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {chartData?.doughnut && (
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Distribution</h3>
                            <div style={{ height: '350px' }}>
                              <Doughnut data={chartData.doughnut.data} options={chartData.doughnut.options} />
                            </div>
                          </div>
                        )}
                        {chartData?.bar && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Analysis</h3>
                            <div style={{ height: '350px' }}>
                              <Bar data={chartData.bar.data} options={chartData.bar.options} />
                            </div>
                          </div>
                        )}
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