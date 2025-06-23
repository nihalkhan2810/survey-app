'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, PieChart, TrendingUp, Clock, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface Response {
  id: string;
  surveyId: string;
  submittedAt: string;
  answers: Record<string, string>;
  type: 'text' | 'voice-extracted' | 'anonymous';
  email?: string;
  callSid?: string;
  metadata?: {
    duration?: number;
  };
}

interface Survey {
  id: string;
  title: string;
  questions: Array<{ id: string; text: string; type: string }>;
}

interface AnalyticsModalProps {
  responses: Response[];
  surveys: Survey[];
  onClose: () => void;
}

export function AnalyticsModal({ responses, surveys, onClose }: AnalyticsModalProps) {
  const [selectedChart, setSelectedChart] = useState<'overview' | 'trends' | 'surveys'>('overview');

  // Calculate analytics data
  const totalResponses = responses.length;
  const voiceResponses = responses.filter(r => r.type === 'voice-extracted').length;
  const emailResponses = responses.filter(r => r.email && r.type !== 'anonymous').length;
  const anonymousResponses = responses.filter(r => r.type === 'anonymous' || !r.email).length;

  // Response trends over time (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentResponses = responses.filter(r => new Date(r.submittedAt) >= thirtyDaysAgo);
  
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dayResponses = recentResponses.filter(r => {
      const responseDate = new Date(r.submittedAt);
      return responseDate.toDateString() === date.toDateString();
    });
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      responses: dayResponses.length,
      voice: dayResponses.filter(r => r.type === 'voice-extracted').length,
      text: dayResponses.filter(r => r.type === 'text').length,
    };
  });

  // Survey response distribution
  const surveyStats = surveys.map(survey => {
    const surveyResponses = responses.filter(r => r.surveyId === survey.id);
    return {
      id: survey.id,
      title: survey.title,
      responses: surveyResponses.length,
      voice: surveyResponses.filter(r => r.type === 'voice-extracted').length,
      email: surveyResponses.filter(r => r.email).length,
      anonymous: surveyResponses.filter(r => !r.email).length,
    };
  }).sort((a, b) => b.responses - a.responses);

  // Average response time by type
  const avgResponseTimes = {
    voice: responses
      .filter(r => r.type === 'voice-extracted' && r.metadata?.duration)
      .reduce((sum, r) => sum + (r.metadata?.duration || 0), 0) / 
      responses.filter(r => r.type === 'voice-extracted' && r.metadata?.duration).length || 0,
    text: 0, // Text responses don't have duration
  };

  const chartTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'surveys', label: 'By Survey', icon: PieChart },
  ];

  const typeColors = {
    voice: 'emerald',
    text: 'blue',
    anonymous: 'gray',
    email: 'purple'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Response Analytics
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Detailed insights into survey response patterns
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {chartTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedChart(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  selectedChart === tab.id
                    ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-10rem)]">
            {/* Overview Tab */}
            {selectedChart === 'overview' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Total Responses
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {totalResponses}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                        Voice Responses
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {voiceResponses}
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      {((voiceResponses / totalResponses) * 100).toFixed(1)}% of total
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        Email Responses
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {emailResponses}
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                      {((emailResponses / totalResponses) * 100).toFixed(1)}% of total
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                        Anonymous
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {anonymousResponses}
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-400 mt-1">
                      {((anonymousResponses / totalResponses) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>

                {/* Response Type Distribution */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Response Type Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { type: 'voice-extracted', count: voiceResponses, color: 'emerald', label: 'Voice' },
                      { type: 'text', count: responses.filter(r => r.type === 'text').length, color: 'blue', label: 'Text' },
                      { type: 'anonymous', count: anonymousResponses, color: 'gray', label: 'Anonymous' }
                    ].map((item) => (
                      <div key={item.type} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className={`w-3 h-3 bg-${item.color}-500 rounded-full`}></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 bg-${item.color}-500 rounded-full transition-all duration-500`}
                            style={{ width: `${(item.count / totalResponses) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[60px] text-right">
                          {item.count} ({((item.count / totalResponses) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Trends Tab */}
            {selectedChart === 'trends' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Response Trends (Last 30 Days)
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Responses Chart */}
                    <div>
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Daily Response Volume
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {trendData.slice(-10).map((day, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px]">
                              {day.date}
                            </span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 bg-violet-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(5, (day.responses / Math.max(...trendData.map(d => d.responses))) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[20px]">
                              {day.responses}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Response Type Breakdown */}
                    <div>
                      <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Performance Metrics
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Avg Voice Duration
                            </span>
                          </div>
                          <div className="text-xl font-bold text-emerald-600">
                            {Math.round(avgResponseTimes.voice)}s
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Completion Rate
                            </span>
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            89%
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Voice Adoption
                            </span>
                          </div>
                          <div className="text-xl font-bold text-purple-600">
                            {((voiceResponses / totalResponses) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Surveys Tab */}
            {selectedChart === 'surveys' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Response Distribution by Survey
                </h3>
                <div className="space-y-4">
                  {surveyStats.map((survey, index) => (
                    <motion.div
                      key={survey.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                          {survey.title}
                        </h4>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {survey.responses} responses
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-emerald-600">
                            {survey.voice}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Voice
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {survey.email}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Email
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-600">
                            {survey.anonymous}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Anonymous
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="flex h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500"
                            style={{ width: `${(survey.voice / survey.responses) * 100}%` }}
                          ></div>
                          <div
                            className="bg-purple-500"
                            style={{ width: `${(survey.email / survey.responses) * 100}%` }}
                          ></div>
                          <div
                            className="bg-gray-500"
                            style={{ width: `${(survey.anonymous / survey.responses) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}