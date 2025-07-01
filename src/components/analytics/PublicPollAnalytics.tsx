'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, ChevronRight } from 'lucide-react';

interface PollStats {
  id: string;
  question: string;
  category: string;
  confidence: number;
  participation: number;
  trending: number;
  responses: number;
  demographics: string;
}

interface PublicPollAnalyticsProps {
  polls?: PollStats[];
  onPollClick?: (poll: PollStats) => void;
}

const dummyPolls: PollStats[] = [
  {
    id: '1',
    question: 'Presidential Election: Candidate Performance Tracking',
    category: 'National Elections',
    confidence: 94.7,
    participation: 9.4,
    trending: 9.2,
    responses: 47823,
    demographics: 'Likely Voters'
  },
  {
    id: '2',
    question: 'Climate Action: Carbon Tax Implementation',
    category: 'Environmental Policy',
    confidence: 89.1,
    participation: 8.8,
    trending: 9.5,
    responses: 35647,
    demographics: 'All Adults 18+'
  },
  {
    id: '3',
    question: 'Economic Recovery: Federal Spending Priorities',
    category: 'Economic Policy',
    confidence: 91.3,
    participation: 9.1,
    trending: 8.7,
    responses: 52194,
    demographics: 'Working Adults'
  },
  {
    id: '4',
    question: 'Healthcare Reform: Universal Coverage Support',
    category: 'Healthcare Policy',
    confidence: 87.8,
    participation: 9.6,
    trending: 9.3,
    responses: 41256,
    demographics: 'All Demographics'
  },
  {
    id: '5',
    question: 'Social Justice: Police Reform Measures',
    category: 'Social Issues',
    confidence: 85.2,
    participation: 8.9,
    trending: 9.1,
    responses: 38904,
    demographics: 'Urban & Suburban'
  }
];

export function PublicPollAnalytics({ polls = dummyPolls, onPollClick }: PublicPollAnalyticsProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (confidence >= 75) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (confidence >= 65) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getTrendingColor = (trending: number) => {
    if (trending >= 9) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (trending >= 8) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (trending >= 7) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getTopPolls = () => {
    return [...polls]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  };

  const topPolls = getTopPolls();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Political Pulse Monitor</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time opinion tracking & demographic insights</p>
        </div>
      </div>

      <div className="space-y-4">
        {topPolls.map((poll, index) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onPollClick?.(poll)}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full text-sm font-bold">
                #{index + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{poll.question}</h4>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{poll.category}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{poll.demographics}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(poll.confidence)}`}>
                  <TrendingUp className="h-3 w-3" />
                  {poll.confidence.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {poll.responses.toLocaleString()} responses
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(polls.reduce((sum, poll) => sum + poll.confidence, 0) / polls.length).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Confidence</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(polls.reduce((sum, poll) => sum + poll.participation, 0) / polls.length).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Participation</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {polls.filter(poll => poll.confidence >= 80).length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">High Confidence</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}