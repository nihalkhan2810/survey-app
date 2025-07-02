'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, TrendingUp, TrendingDown, Minus, Star, MessageSquare, Target, Lightbulb } from 'lucide-react';

type SentimentData = {
  sentiment: {
    overall: string;
    confidence: number;
    breakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
    reasoning: string;
  };
  themes: Array<{
    theme: string;
    frequency: number;
    sentiment: string;
    examples: string[];
  }>;
  insights: Array<{
    category: string;
    finding: string;
    impact: string;
    evidence: string[];
  }>;
  recommendations: Array<{
    priority: string;
    action: string;
    rationale: string;
    expectedImpact: string;
  }>;
  totalResponsesAnalyzed: number;
  analysisDate: string;
};

type SentimentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sentimentData: SentimentData | null;
  surveyTopic: string;
};

export function SentimentModal({ isOpen, onClose, sentimentData, surveyTopic }: SentimentModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'themes' | 'insights' | 'recommendations'>('overview');

  if (!isOpen || !sentimentData) return null;

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  AI Sentiment Analysis
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {surveyTopic} • {sentimentData.totalResponsesAnalyzed} responses analyzed
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
                { id: 'overview', label: 'Overview', icon: Star },
                { id: 'themes', label: 'Themes', icon: MessageSquare },
                { id: 'insights', label: 'Insights', icon: Target },
                { id: 'recommendations', label: 'Actions', icon: Lightbulb }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
                {/* Overall Sentiment */}
                <div className={`p-6 rounded-2xl ${getSentimentColor(sentimentData.sentiment.overall)}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {getSentimentIcon(sentimentData.sentiment.overall)}
                    <h3 className="text-lg font-semibold capitalize">
                      {sentimentData.sentiment.overall} Sentiment
                    </h3>
                    <span className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded-full text-xs font-medium">
                      {Math.round(sentimentData.sentiment.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{sentimentData.sentiment.reasoning}</p>
                </div>

                {/* Sentiment Breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Positive</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                      {sentimentData.sentiment.breakdown.positive}%
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Minus className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Neutral</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                      {sentimentData.sentiment.breakdown.neutral}%
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">Negative</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                      {sentimentData.sentiment.breakdown.negative}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="space-y-4">
                {sentimentData.themes.map((theme, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{theme.theme}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {theme.frequency} mentions
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(theme.sentiment)}`}>
                          {theme.sentiment}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {theme.examples.map((example, i) => (
                        <blockquote key={i} className="pl-4 border-l-2 border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 italic">
                          "{example}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-4">
                {sentimentData.insights.map((insight, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{insight.category}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{insight.finding}</p>
                    {insight.evidence.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Supporting Evidence:
                        </p>
                        {insight.evidence.map((evidence, i) => (
                          <blockquote key={i} className="pl-3 border-l-2 border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 italic">
                            "{evidence}"
                          </blockquote>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                {sentimentData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{rec.action}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{rec.rationale}</p>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <span className="font-medium">Expected Impact:</span> {rec.expectedImpact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}