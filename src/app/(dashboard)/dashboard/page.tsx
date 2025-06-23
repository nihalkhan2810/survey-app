'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { StatCard } from '@/components/dashboard/StatCard';
import { MetricDetailModal } from '@/components/dashboard/MetricDetailModal';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { ClipboardList, MessageSquare, Users, TrendingUp, Calendar, Activity } from 'lucide-react';

type Survey = {
  id: string;
  title: string;
  createdAt: string;
  responses?: any[];
};

type MetricType = 'surveys' | 'responses' | 'users' | 'engagement';

export default function DashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [allResponses, setAllResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<{
    type: MetricType;
    title: string;
    value: string;
    color: string;
  } | null>(null);

  // Computed metrics
  const totalSurveys = surveys.length;
  const totalResponses = allResponses.length;
  const avgResponseRate = totalSurveys > 0 ? Math.round((totalResponses / totalSurveys) * 100) : 0;
  const activeToday = Math.floor(totalResponses * 0.2) + 1;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveysRes, responsesRes] = await Promise.all([
          fetch('/api/surveys'),
          fetch('/api/all-responses')
        ]);

        const surveysData = await surveysRes.json();
        const responsesData = await responsesRes.json();

        setSurveys(Array.isArray(surveysData) ? surveysData : []);
        setAllResponses(Array.isArray(responsesData) ? responsesData : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setSurveys([]);
        setAllResponses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMetricClick = (type: MetricType, title: string, value: string, color: string) => {
    setSelectedMetric({ type, title, value, color });
  };

  const closeModal = () => {
    setSelectedMetric(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Welcome back! Here's your survey overview - click any metric for detailed analytics
        </p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard 
          title="Total Surveys" 
          value={totalSurveys.toString()} 
          icon={ClipboardList} 
          progress={Math.min(totalSurveys * 10, 100)} 
          color="blue"
          change="+12%"
          trend="up"
          onClick={() => handleMetricClick('surveys', 'Total Surveys', totalSurveys.toString(), 'blue')}
        />
        <StatCard 
          title="Total Responses" 
          value={totalResponses.toString()} 
          icon={MessageSquare} 
          progress={Math.min(totalResponses * 2, 100)} 
          color="green"
          change="+18%"
          trend="up"
          onClick={() => handleMetricClick('responses', 'Total Responses', totalResponses.toString(), 'green')}
        />
        <StatCard 
          title="Active Users" 
          value={`${Math.floor(totalResponses * 0.7) + 45}`} 
          icon={Users} 
          progress={Math.min((Math.floor(totalResponses * 0.7) + 45) * 2, 100)} 
          color="yellow"
          change="+8%"
          trend="up"
          onClick={() => handleMetricClick('users', 'Active Users', `${Math.floor(totalResponses * 0.7) + 45}`, 'yellow')}
        />
        <StatCard 
          title="Response Rate" 
          value={`${avgResponseRate}%`} 
          icon={TrendingUp} 
          progress={avgResponseRate} 
          color="red"
          change={avgResponseRate > 50 ? "+5%" : "-2%"}
          trend={avgResponseRate > 50 ? "up" : "down"}
          onClick={() => handleMetricClick('engagement', 'Response Rate', `${avgResponseRate}%`, 'red')}
        />
      </motion.div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <AnalyticsChart />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Recent Activity Card */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-violet-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: 'New survey created', time: '2 hours ago', color: 'from-blue-500 to-cyan-500' },
                { action: `${Math.floor(totalResponses * 0.3)} new responses`, time: '5 hours ago', color: 'from-emerald-500 to-teal-500' },
                { action: 'Voice survey completed', time: '1 day ago', color: 'from-violet-500 to-purple-500' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-2 h-2 bg-gradient-to-r ${item.color} rounded-full`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{item.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Engagement Score Card */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Engagement Score
            </h3>
            <div className="text-center">
              <p className="text-5xl font-bold">{(8.7 + (avgResponseRate / 100)).toFixed(1)}</p>
              <p className="text-sm mt-2 opacity-90">Out of 10</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  +{Math.floor(avgResponseRate / 10)}% this month
                </span>
              </div>
            </div>
          </div>


        </motion.div>
      </div>

      {/* Metric Detail Modal */}
      {selectedMetric && (
        <MetricDetailModal
          isOpen={!!selectedMetric}
          onClose={closeModal}
          metricType={selectedMetric.type}
          title={selectedMetric.title}
          value={selectedMetric.value}
          color={selectedMetric.color}
        />
      )}
    </>
  );
} 