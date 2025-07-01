'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail, User, MessageSquare, Calendar, Clock, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';

interface Response {
  id: string;
  surveyId: string;
  submittedAt: string;
  answers: Record<string, string>;
  type: 'text' | 'voice-extracted' | 'anonymous';
  email?: string;
  respondentEmail?: string; // Email used for tracking (from URL)
  identity?: {
    isAnonymous: boolean;
    email?: string; // Email when user chooses to identify
  };
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
  title?: string;
  topic?: string;
  questions: Array<{ id: string; text: string; type: string }>;
}

interface ResponseDetailProps {
  response: Response;
  survey?: Survey;
  onClose: () => void;
}

export function ResponseDetail({ response, survey, onClose }: ResponseDetailProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getTypeInfo = () => {
    if (response.type === 'voice-extracted' || response.type === 'voice-vapi') {
      return {
        icon: <Phone className="h-5 w-5 text-emerald-600" />,
        label: 'Voice Response',
        color: 'emerald',
        description: 'Response extracted from voice call'
      };
    }
    
    switch (response.type) {
      case 'text':
        return {
          icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
          label: 'Text Response',
          color: 'blue',
          description: 'Direct text submission'
        };
      case 'anonymous':
        return {
          icon: <User className="h-5 w-5 text-gray-600" />,
          label: 'Anonymous Response',
          color: 'gray',
          description: 'Anonymous submission'
        };
      default:
        return {
          icon: <MessageSquare className="h-5 w-5 text-gray-600" />,
          label: 'Unknown Type',
          color: 'gray',
          description: 'Unknown response type'
        };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/20 rounded-xl`}>
                {typeInfo.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {typeInfo.label}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {typeInfo.description}
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

          <div className="overflow-y-auto max-h-[calc(90vh-5rem)]">
            {/* Response Info */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Response ID
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {response.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(response.id, 'id')}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {copiedField === 'id' && (
                        <span className="text-xs text-emerald-600">Copied!</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Survey
                    </label>
                    <div className="mt-1 space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {survey?.topic || survey?.title || 'Unknown Survey'}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          ID: {response.surveyId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(response.surveyId, 'surveyId')}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        {copiedField === 'surveyId' && (
                          <span className="text-xs text-emerald-600">Copied!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Respondent
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      {response.email ? (
                        <>
                          <Mail className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {response.email}
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Anonymous
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Submitted At
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(response.submittedAt)}
                      </span>
                    </div>
                  </div>

                  {response.callSid && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Call SID
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {response.callSid}
                        </code>
                        <button
                          onClick={() => copyToClipboard(response.callSid!, 'callSid')}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        {copiedField === 'callSid' && (
                          <span className="text-xs text-emerald-600">Copied!</span>
                        )}
                      </div>
                    </div>
                  )}

                  {response.metadata?.duration && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Call Duration
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {Math.round(response.metadata.duration)} seconds
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Answers */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Responses ({Object.keys(response.answers).length})
              </h3>
              
              <div className="space-y-4">
                {Object.entries(response.answers).map(([questionIndex, answer], index) => {
                  const questionNumber = parseInt(questionIndex) + 1;
                  const question = survey?.questions?.[parseInt(questionIndex)];
                  
                  return (
                    <motion.div
                      key={questionIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            Q{questionNumber}
                          </span>
                          {question && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {question.type}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => copyToClipboard(answer, `answer-${questionIndex}`)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {question && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {question.text}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {answer}
                      </p>
                      
                      {copiedField === `answer-${questionIndex}` && (
                        <div className="mt-2">
                          <span className="text-xs text-emerald-600">Answer copied!</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Metadata */}
            {response.metadata && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {response.metadata.questionCount && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Total Questions
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {response.metadata.questionCount}
                      </p>
                    </div>
                  )}
                  
                  {response.metadata.extractedAnswers && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Extracted Answers
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {response.metadata.extractedAnswers}
                      </p>
                    </div>
                  )}
                  
                  {response.metadata.extractedFrom && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Extracted From
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white font-mono">
                        {response.metadata.extractedFrom}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}