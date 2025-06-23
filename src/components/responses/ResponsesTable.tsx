'use client';

import { motion } from 'framer-motion';
import { Eye, Phone, Mail, User, MessageSquare, Calendar, ExternalLink, BarChart } from 'lucide-react';

interface Response {
  id: string;
  surveyId: string;
  submittedAt: string;
  answers: Record<string, string>;
  type: 'text' | 'voice-extracted' | 'anonymous';
  email?: string;
  callSid?: string;
  metadata?: {
    extractedFrom?: string;
    questionCount?: number;
    extractedAnswers?: number;
    duration?: number;
  };
}

interface Survey {
  id: string;
  title: string;
  questions: Array<{ id: string; text: string; type: string }>;
}

interface ResponsesTableProps {
  responses: Response[];
  surveys: Survey[];
  onViewResponse: (response: Response) => void;
}

export function ResponsesTable({ responses, surveys, onViewResponse }: ResponsesTableProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice-extracted':
        return <Phone className="h-4 w-4 text-emerald-600" />;
      case 'text':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'anonymous':
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'voice-extracted':
        return 'Voice';
      case 'text':
        return 'Text';
      case 'anonymous':
        return 'Anonymous';
      default:
        return 'Unknown';
    }
  };

  const getSurveyTitle = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    return survey?.title || `Survey ${surveyId.slice(0, 8)}`;
  };

  const getResponsePreview = (answers: Record<string, string>) => {
    const firstAnswer = Object.values(answers)[0] || '';
    return firstAnswer.length > 50 ? firstAnswer.slice(0, 50) + '...' : firstAnswer;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate survey response counts for insights
  const surveyResponseCounts = responses.reduce((acc, response) => {
    acc[response.surveyId] = (acc[response.surveyId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSurvey = Object.entries(surveyResponseCounts)
    .sort(([,a], [,b]) => b - a)[0];

  if (responses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-12 text-center"
      >
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No responses found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filter criteria.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Survey Insights */}
      {topSurvey && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <BarChart className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  Top Performing Survey
                </h3>
                <p className="text-emerald-700 dark:text-emerald-400 text-sm">
                  {getSurveyTitle(topSurvey[0])} • {topSurvey[1]} responses
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-emerald-600">
                {((topSurvey[1] / responses.length) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                of total responses
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 overflow-hidden"
      >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Type & ID
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Survey
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Respondent
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Preview
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Submitted
              </th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {responses.map((response, index) => (
              <motion.tr
                key={response.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getTypeIcon(response.type)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getTypeLabel(response.type)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {response.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-900 dark:text-white font-medium">
                    {getSurveyTitle(response.surveyId)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Object.keys(response.answers).length} answers
                  </div>
                </td>
                
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {response.email ? (
                      <>
                        <Mail className="h-3 w-3 text-blue-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {response.email}
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Anonymous
                        </span>
                      </>
                    )}
                  </div>
                  {response.callSid && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Call: {response.callSid.slice(-8)}
                    </div>
                  )}
                  {response.metadata?.duration && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {Math.round(response.metadata.duration)}s duration
                    </div>
                  )}
                </td>
                
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                    {getResponsePreview(response.answers)}
                  </div>
                </td>
                
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(response.submittedAt)}
                  </div>
                </td>
                
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onViewResponse(response)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/30 transition-colors text-sm"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </motion.button>
                    
                    {response.type === 'voice-extracted' && response.callSid && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors text-sm"
                        title="View call details"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Call
                      </motion.button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {responses.length} response{responses.length !== 1 ? 's' : ''}
        </div>
      </div>
    </motion.div>
    </>
  );
}