'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BarChart3, Eye } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type RealDataChartProps = {
  analyticsData?: any;
  onViewDetails?: () => void;
};

export function RealDataChart({ analyticsData, onViewDetails }: RealDataChartProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!analyticsData) {
    return (
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
      </div>
    );
  }

  // Process real trend data
  const trendData = analyticsData.trends?.slice(-14) || [];
  const maxResponses = Math.max(...trendData.map((t: any) => t.responses), 1);
  const maxRating = Math.max(...trendData.map((t: any) => t.rating), 1);
  const totalResponses = analyticsData.totalResponses || 0;
  const avgRating = analyticsData.averageSatisfaction || 0;

  // Calculate trend percentage
  const recentResponses = trendData.slice(-7).reduce((sum: number, t: any) => sum + t.responses, 0);
  const previousResponses = trendData.slice(-14, -7).reduce((sum: number, t: any) => sum + t.responses, 0);
  const trendPercentage = previousResponses > 0 
    ? ((recentResponses - previousResponses) / previousResponses * 100).toFixed(1)
    : '0';

  // Chart.js configuration for line chart
  const chartData = {
    labels: trendData.map((_: any, index: number) => `Day ${index + 1}`),
    datasets: [
      {
        label: 'Daily Responses',
        data: trendData.map((t: any) => t.responses),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Average Rating',
        data: trendData.map((t: any) => t.rating * 10), // Scale to match response scale
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
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
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 1) {
              return `Average Rating: ${(context.parsed.y / 10).toFixed(1)}/10`;
            }
            return `Responses: ${context.parsed.y}`;
          },
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Responses',
          color: 'rgb(99, 102, 241)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Rating (0-100)',
          color: 'rgb(34, 197, 94)',
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-600" />
            Response Analytics
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time survey responses and ratings (Last {trendData.length} days)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {trendData.length} days of data
          </span>
        </div>
      </div>
      
      {/* Chart */}
      <div className="relative h-64 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {totalResponses}
          </div>
          <div className="text-sm text-violet-700 dark:text-violet-300">Total Responses</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {avgRating.toFixed(1)}/10
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">Average Rating</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(recentResponses / 7)}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Daily Average</div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {parseFloat(trendPercentage) >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
          )}
          <span className={`text-sm font-medium ${
            parseFloat(trendPercentage) >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {parseFloat(trendPercentage) >= 0 ? '+' : ''}{trendPercentage}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">vs previous week</span>
        </div>
        <motion.button
          onClick={onViewDetails}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all"
        >
          <Eye className="h-4 w-4" />
          View Details
        </motion.button>
      </div>

      {/* Expandable Details Section */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detailed Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700 dark:text-gray-300">Top Response Days</h5>
              {trendData
                .sort((a: any, b: any) => b.responses - a.responses)
                .slice(0, 3)
                .map((day: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Day {trendData.indexOf(day) + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {day.responses} responses
                    </span>
                  </div>
                ))}
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700 dark:text-gray-300">Rating Trends</h5>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Highest Rating</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {Math.max(...trendData.map((t: any) => t.rating)).toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Lowest Rating</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {Math.min(...trendData.map((t: any) => t.rating)).toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Rating Stability</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {trendData.length > 1 
                    ? (Math.max(...trendData.map((t: any) => t.rating)) - Math.min(...trendData.map((t: any) => t.rating)) < 1 ? 'High' : 'Medium')
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}