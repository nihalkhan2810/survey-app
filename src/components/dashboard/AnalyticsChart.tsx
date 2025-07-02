'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BarChart } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AnalyticsChart() {
  const [data, setData] = useState<Array<{ month: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [totalResponses, setTotalResponses] = useState(0);

  useEffect(() => {
    const fetchResponseData = async () => {
      try {
        const response = await fetch('/api/all-responses');
        const responses = await response.json();
        
        if (Array.isArray(responses)) {
          setTotalResponses(responses.length);
          
          // Generate last 6 months data
          const monthlyData = [];
          const now = new Date();
          
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            
            const monthResponses = responses.filter((r: any) => {
              const responseDate = new Date(r.submittedAt || r.submitted_at || r.createdAt || r.created_at);
              return responseDate >= date && responseDate < nextMonth;
            });
            
            monthlyData.push({
              month: monthName,
              value: monthResponses.length
            });
          }
          
          setData(monthlyData);
        }
      } catch (error) {
        console.error('Failed to fetch response data:', error);
        // Fallback to empty data
        setData([
          { month: 'Jan', value: 0 },
          { month: 'Feb', value: 0 },
          { month: 'Mar', value: 0 },
          { month: 'Apr', value: 0 },
          { month: 'May', value: 0 },
          { month: 'Jun', value: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResponseData();
  }, []);

  const maxValue = Math.max(...data.map(d => d.value), 1); // Ensure at least 1 to avoid division by 0

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Analytics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {loading ? 'Loading...' : `${totalResponses} total responses`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</span>
        </div>
      </div>
      
      <div className="relative h-64">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {data.map((item, index) => (
            <motion.div
              key={item.month}
              className="flex-1 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-full relative flex items-end justify-center h-48">
                <motion.div
                  className="w-full max-w-[40px] bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-lg shadow-lg relative overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
                  <motion.span
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    {item.value}
                  </motion.span>
                </motion.div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.month}</span>
            </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {totalResponses > 0 ? (
            <>
              <BarChart className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{totalResponses} responses</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">real data</span>
            </>
          ) : (
            <>
              <BarChart className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">No responses yet</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">create surveys to see data</span>
            </>
          )}
        </div>
        <button className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">
          View Details →
        </button>
      </div>
    </div>
  );
} 