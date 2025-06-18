'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { StatCard } from '@/components/dashboard/StatCard';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { ClipboardList, MessageSquare, Users, TrendingUp, Calendar, Activity } from 'lucide-react';

type Survey = {
  id: string;
};

type SurveyResponse = {
  id: string;
};

export default function DashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [surveysRes, responsesRes] = await Promise.all([
          fetch('/api/surveys'),
          fetch('/api/all-responses')
        ]);
        const surveysData = await surveysRes.json();
        const responsesData = await responsesRes.json();
        setSurveys(Array.isArray(surveysData) ? surveysData : []);
        setResponses(Array.isArray(responsesData) ? responsesData : []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalSurveys = surveys.length;
  const totalResponses = responses.length;
  const avgResponseRate = totalSurveys > 0 ? Math.round((totalResponses / (totalSurveys * 10)) * 100) : 0;
  const activeToday = Math.floor(Math.random() * 5) + 3; // Simulated data

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-violet-200 border-t-violet-600"
        />
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
          Welcome back! Here's your survey overview
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
        />
        <StatCard 
          title="Total Responses" 
          value={totalResponses.toString()} 
          icon={MessageSquare} 
          progress={Math.min(totalResponses * 2, 100)} 
          color="green" 
        />
        <StatCard 
          title="Response Rate" 
          value={`${avgResponseRate}%`} 
          icon={TrendingUp} 
          progress={avgResponseRate} 
          color="yellow" 
        />
        <StatCard 
          title="Active Today" 
          value={activeToday.toString()} 
          icon={Activity} 
          progress={activeToday * 20} 
          color="red" 
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
                { action: '15 new responses', time: '5 hours ago', color: 'from-emerald-500 to-teal-500' },
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

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Engagement Score
            </h3>
            <div className="text-center">
              <p className="text-5xl font-bold">8.7</p>
              <p className="text-sm mt-2 opacity-90">Out of 10</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+12% this month</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
} 