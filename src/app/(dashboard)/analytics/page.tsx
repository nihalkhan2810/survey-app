'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RealDataChart } from '@/components/analytics/RealDataChart';
import { SentimentModal } from '@/components/analytics/SentimentModal';
import { EnhancedMetricModal } from '@/components/analytics/EnhancedMetricModal';
import { TrendingUp, TrendingDown, Activity, Users, MessageSquare, Brain, Target, Star, BarChart3, Sparkles, Zap, MousePointer } from 'lucide-react';
import { getUniversitySentimentAnalysis, ProfessorStats, departmentStats } from '@/lib/university-demo-data';
import { getCurrentIndustryConfig, getIndustryMetrics } from '@/lib/industry-config';
import { getUniversalSentimentAnalysis, UniversalEntityStats } from '@/lib/universal-analytics';

type Survey = {
  id: string;
  topic: string;
  created_at: string;
  start_date?: string;
  end_date?: string;
};

export default function AnalyticsPage() {
  const [industryConfig, setIndustryConfig] = useState(getCurrentIndustryConfig());
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string>('');
  const [sentimentModalOpen, setSentimentModalOpen] = useState(false);
  const [aiSentiment, setAiSentiment] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [metricDetailOpen, setMetricDetailOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  
  // Load surveys
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const response = await fetch('/api/surveys');
        if (response.ok) {
          const data = await response.json();
          setSurveys(Array.isArray(data) ? data : []);
          // Auto-select first survey if none selected
          if (!selectedSurvey && data.length > 0) {
            setSelectedSurvey(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load surveys:', error);
        setSurveys([]);
      }
    };

    loadSurveys();
  }, []); // Remove selectedSurvey dependency

  // Load analysis data
  useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true);
      try {
        if (selectedSurvey && selectedSurvey !== 'all') {
          // Load survey-specific analytics
          const response = await fetch(`/api/analytics?surveyId=${selectedSurvey}`);
          if (response.ok) {
            const data = await response.json();
            setAnalysis(data);
          } else {
            throw new Error('Failed to load survey analytics');
          }
        } else if (selectedSurvey === 'all') {
          // Load combined analytics for all surveys
          const response = await fetch('/api/analytics-combined');
          if (response.ok) {
            const data = await response.json();
            setAnalysis(data);
          } else {
            throw new Error('Failed to load combined analytics');
          }
        } else {
          // Load general analytics (all surveys combined)
          if (industryConfig.id === 'education') {
            setAnalysis(getUniversitySentimentAnalysis());
          } else {
            const universalAnalysis = await getUniversalSentimentAnalysis();
            setAnalysis(universalAnalysis);
          }
        }
      } catch (error) {
        console.error('Failed to load analysis:', error);
        // Fallback to university analysis
        setAnalysis(getUniversitySentimentAnalysis());
      } finally {
        setLoading(false);
      }
    };

    if (selectedSurvey) {
      loadAnalysis();
    }
  }, [selectedSurvey]); // Removed industryConfig to prevent unnecessary reloads

  // Manual AI sentiment analysis function
  const loadAISentiment = async () => {
    if (!analysis || !analysis.responses || analysis.responses.length === 0) {
      return;
    }

    setLoadingAI(true);
    try {
      // Determine topic based on whether it's a single survey or combined
      let surveyTopic = '';
      if (selectedSurvey === 'all') {
        // For combined surveys, create a descriptive topic
        const surveyCount = analysis.surveys?.length || 0;
        surveyTopic = `Combined Analysis of ${surveyCount} Surveys`;
      } else {
        surveyTopic = analysis.survey?.topic || 'Survey';
      }

      const response = await fetch('/api/gemini-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: analysis.responses,
          surveyTopic: surveyTopic
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSentiment(data);
      }
    } catch (error) {
      console.error('Failed to load AI sentiment:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  // Reset AI sentiment when survey changes
  useEffect(() => {
    setAiSentiment(null);
  }, [selectedSurvey]);

  // Update industry config when component mounts or localStorage changes
  useEffect(() => {
    const updateConfig = () => {
      setIndustryConfig(getCurrentIndustryConfig());
    };
    
    updateConfig();
    
    // Listen for storage changes (when industry is changed in admin)
    window.addEventListener('storage', updateConfig);
    return () => window.removeEventListener('storage', updateConfig);
  }, []);

  // Get basic stats for display
  const getBasicStats = () => {
    if (!analysis) return [];
    
    const totalResponses = analysis.totalResponses || 0;
    const avgRating = analysis.averageSatisfaction || 0;
    const completionRate = analysis.completionRate || 0;
    const recommendationScore = Math.round(analysis.insights?.recommendationScore || 0);
    
    return [
      {
        title: 'Total Responses',
        value: totalResponses.toString(),
        change: totalResponses === 0 ? 'No data' : 'All time',
        trend: totalResponses > 0 ? 'up' as const : 'none' as const,
        icon: Users,
        gradient: 'from-blue-500 to-cyan-500',
      },
      {
        title: 'Avg. Rating',
        value: `${Math.round(avgRating * 10) / 10}/10`,
        change: avgRating === 0 ? 'No ratings' : avgRating >= 7 ? 'High satisfaction' : avgRating >= 5 ? 'Good' : 'Needs improvement',
        trend: avgRating >= 7 ? 'up' as const : avgRating >= 5 ? 'up' as const : avgRating > 0 ? 'down' as const : 'none' as const,
        icon: Star,
        gradient: 'from-emerald-500 to-teal-500',
      },
      {
        title: 'Completion Rate',
        value: `${Math.round(completionRate)}%`,
        change: completionRate === 0 ? 'No data' : completionRate >= 80 ? 'Excellent' : completionRate >= 60 ? 'Good' : 'Low completion',
        trend: completionRate >= 60 ? 'up' as const : completionRate > 0 ? 'down' as const : 'none' as const,
        icon: Target,
        gradient: 'from-purple-500 to-indigo-500',
      },
      {
        title: 'Recommendation Score',
        value: `${recommendationScore}%`,
        change: recommendationScore === 0 ? 'No data' : recommendationScore >= 70 ? 'Strong' : recommendationScore >= 50 ? 'Moderate' : 'Weak',
        trend: recommendationScore >= 50 ? 'up' as const : recommendationScore > 0 ? 'down' as const : 'none' as const,
        icon: TrendingUp,
        gradient: 'from-rose-500 to-pink-500',
      }
    ];
  };


  // Show loading state
  if (loading || !analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = getBasicStats();

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                AI-powered insights and real-time performance metrics
              </p>
            </div>
            <div className="flex-shrink-0 w-full sm:w-80">
              {/* Survey Selector */}
              <div className="w-full">
                <label htmlFor="surveySelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Survey
                </label>
                <select
                  id="surveySelect"
                  value={selectedSurvey}
                  onChange={(e) => setSelectedSurvey(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-black dark:text-white shadow-sm"
                >
                  <option value="all">📊 All Surveys Combined</option>
                  {surveys.map(survey => (
                    <option key={survey.id} value={survey.id}>
                      📝 {survey.topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Selected Survey Info */}
        {selectedSurvey && selectedSurvey !== 'all' && (
          <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-violet-900 dark:text-violet-300">
                  {surveys.find(s => s.id === selectedSurvey)?.topic}
                </h3>
                <p className="text-sm text-violet-700 dark:text-violet-400">
                  Created: {surveys.find(s => s.id === selectedSurvey)?.created_at && 
                    new Date(surveys.find(s => s.id === selectedSurvey)!.created_at).toLocaleDateString()}
                </p>
              </div>
              {surveys.find(s => s.id === selectedSurvey)?.start_date && (
                <div className="text-sm text-violet-700 dark:text-violet-400">
                  <span className="font-medium">Duration:</span>{' '}
                  {new Date(surveys.find(s => s.id === selectedSurvey)!.start_date!).toLocaleDateString()} -{' '}
                  {surveys.find(s => s.id === selectedSurvey)?.end_date && 
                    new Date(surveys.find(s => s.id === selectedSurvey)!.end_date!).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -4, rotateY: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedMetric(stat);
              setMetricDetailOpen(true);
            }}
            className="relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6 cursor-pointer group hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300"
          >
            {/* Hover Effect Indicator */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <MousePointer className="h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <Sparkles className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3 group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
                <div className="flex items-center">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    stat.trend === 'up' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {stat.trend === 'none' ? 'no data' : 'current status'}
                  </span>
                </div>
              </div>
              <div className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:rotate-3`}>
                <stat.icon className="h-7 w-7 text-white" />
              </div>
            </div>
            
            {/* Animated Background */}
            <div className={`absolute -right-8 -bottom-8 h-32 w-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-15 group-hover:scale-110 transition-all duration-500`} />
            
            {/* Click Indicator */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Sentiment Analysis */}
      {analysis?.responses?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {!aiSentiment && !loadingAI ? (
            // Button to trigger AI analysis
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-300">
                      AI Sentiment Analysis
                    </h3>
                    <p className="text-purple-700 dark:text-purple-400">
                      Get AI-powered insights from {analysis.totalResponses} responses
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={loadAISentiment}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Zap className="h-5 w-5" />
                  Analyze with AI
                </motion.button>
              </div>
            </div>
          ) : (
            // Results or loading state
            <div
              onClick={() => aiSentiment && setSentimentModalOpen(true)}
              className={`bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700 ${aiSentiment ? 'cursor-pointer hover:shadow-lg' : ''} transition-all group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl group-hover:shadow-xl transition-shadow">
                    {loadingAI ? (
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Brain className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-300">
                      AI Sentiment Analysis
                    </h3>
                    <p className="text-purple-700 dark:text-purple-400">
                      {loadingAI ? (
                        'Analyzing responses with AI...'
                      ) : aiSentiment ? (
                        `${aiSentiment.sentiment.overall.charAt(0).toUpperCase() + aiSentiment.sentiment.overall.slice(1)} sentiment detected (${Math.round(aiSentiment.sentiment.confidence * 100)}% confidence)`
                      ) : (
                        'AI analysis ready'
                      )}
                    </p>
                  </div>
                </div>
                {aiSentiment && (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          {aiSentiment.sentiment.breakdown.positive}% Positive
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                          {aiSentiment.sentiment.breakdown.negative}% Negative
                        </span>
                      </div>
                    </div>
                    <div className="text-purple-400 group-hover:text-purple-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <RealDataChart 
            analyticsData={analysis}
            onViewDetails={() => {
              // Create a special chart metric for detailed view
              const totalResponses = analysis?.totalResponses || 0;
              const chartMetric = {
                title: 'Response Analytics',
                value: `${totalResponses} responses`,
                change: totalResponses === 0 ? 'No data' : 'All time',
                trend: totalResponses > 0 ? 'up' as const : 'none' as const,
                icon: BarChart3,
                gradient: 'from-indigo-500 to-purple-600'
              };
              setSelectedMetric(chartMetric);
              setMetricDetailOpen(true);
            }}
          />
        </motion.div>
      </div>

      {/* Quick Stats Summary */}
      {selectedSurvey !== 'all' && analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Survey Summary
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analysis.responses?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Responses
              </div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {analysis.insights?.topKeywords?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Key Topics
              </div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(analysis.averageSatisfaction * 10)/10}/10
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Rating
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <SentimentModal
        isOpen={sentimentModalOpen}
        onClose={() => setSentimentModalOpen(false)}
        sentimentData={aiSentiment}
        surveyTopic={analysis?.survey?.topic || 'Survey'}
      />

      <EnhancedMetricModal
        isOpen={metricDetailOpen}
        onClose={() => {
          setMetricDetailOpen(false);
          setSelectedMetric(null);
        }}
        metric={selectedMetric}
        analyticsData={analysis}
      />
    </>
  );
} 