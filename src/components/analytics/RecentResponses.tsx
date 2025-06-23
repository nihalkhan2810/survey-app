'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Phone, Calendar, User } from 'lucide-react';
import { universityDemoResponses } from '@/lib/university-demo-data';

export function RecentResponses() {
  const recentResponses = universityDemoResponses
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'negative':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
      default:
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Responses</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Latest feedback from your surveys</p>
        </div>
      </div>

      <div className="space-y-4">
        {recentResponses.map((response, index) => (
          <motion.div
            key={response.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className="group relative overflow-hidden bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/30 hover:border-gray-200 dark:hover:border-gray-600/50 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-lg ${response.responseType === 'call' ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                  {response.responseType === 'call' ? (
                    <Phone className="h-4 w-4 text-white" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-3 w-3" />
                      <span className="font-medium">{response.respondentName}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSentimentColor(response.overallSentiment)}`}>
                      {response.overallSentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {formatTimeAgo(response.timestamp)}
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                    {response.surveyTitle}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    &ldquo;{response.responses[0]?.answer || 'No response text available'}&rdquo;
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Score:</span>
                      <span className={`font-medium ${response.satisfactionScore >= 8 ? 'text-emerald-600' : response.satisfactionScore >= 6 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {response.satisfactionScore}/10
                      </span>
                    </div>
                    {response.responseType === 'call' && response.duration && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor(response.duration / 60)}:{(response.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {response.responses.length} questions
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        View All Responses
      </motion.button>
    </div>
  );
}