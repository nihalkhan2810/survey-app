'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Download, Eye, MessageSquare, Phone, Mail, User, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import { ResponsesTable } from '@/components/responses/ResponsesTable';
import { ResponsesStats } from '@/components/responses/ResponsesStats';
import { ResponsesFilters } from '@/components/responses/ResponsesFilters';
import { ResponseDetail } from '@/components/responses/ResponseDetail';
import { AnalyticsModal } from '@/components/responses/AnalyticsModal';

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

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSurvey, setSelectedSurvey] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'survey' | 'type' | 'response_count'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Helper function to get the display email for a response
  const getDisplayEmail = (response: Response): string | null => {
    // If user chose to identify themselves, show the email from identity
    if (response.identity && !response.identity.isAnonymous && response.identity.email) {
      return response.identity.email;
    }
    // Otherwise, check for legacy email field
    if (response.email) {
      return response.email;
    }
    // Return null for anonymous responses
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [responsesRes, surveysRes] = await Promise.all([
          fetch('/api/all-responses'),
          fetch('/api/surveys-with-dummy')
        ]);
        
        if (!responsesRes.ok) {
          throw new Error(`Failed to fetch responses: ${responsesRes.status} ${responsesRes.statusText}`);
        }
        
        if (!surveysRes.ok) {
          throw new Error(`Failed to fetch surveys: ${surveysRes.status} ${surveysRes.statusText}`);
        }
        
        const responsesData = await responsesRes.json();
        const surveysData = await surveysRes.json();
        
        // Ensure we have valid arrays
        const validResponses = Array.isArray(responsesData) ? responsesData : [];
        const validSurveys = Array.isArray(surveysData) ? surveysData : [];
        
        setResponses(validResponses);
        setSurveys(validSurveys);
        
        console.log(`Loaded ${validResponses.length} responses and ${validSurveys.length} surveys`);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays as fallback to prevent crashes
        setResponses([]);
        setSurveys([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredResponses = responses.filter((response) => {
    // Update type filtering to match new mode concept
    const matchesType = selectedType === 'all' || 
      (selectedType === 'email' && response.type !== 'voice-extracted') ||
      (selectedType === 'voice-extracted' && response.type === 'voice-extracted');
    
    const matchesSurvey = selectedSurvey === 'all' || response.surveyId === selectedSurvey;
    
    return matchesType && matchesSurvey;
  });

  // Calculate response counts by survey for sorting
  const responseCounts = responses.reduce((acc, response) => {
    acc[response.surveyId] = (acc[response.surveyId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedResponses = [...filteredResponses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        break;
      case 'survey':
        const surveyA = surveys.find(s => s.id === a.surveyId)?.title || a.surveyId;
        const surveyB = surveys.find(s => s.id === b.surveyId)?.title || b.surveyId;
        comparison = surveyA.localeCompare(surveyB);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'response_count':
        comparison = (responseCounts[a.surveyId] || 0) - (responseCounts[b.surveyId] || 0);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const exportToCSV = () => {
    if (sortedResponses.length === 0) {
      alert('No responses to export. Please ensure you have responses to export.');
      return;
    }

    // Enhanced headers with more useful information
    const headers = [
      'Response ID',
      'Survey ID', 
      'Survey Title',
      'Response Mode',
      'Respondent Email',
      'Submitted Date',
      'Submitted Time',
      'Response Data',
      'Call SID',
      'Metadata'
    ];
    
    const csvData = sortedResponses.map(response => {
      const survey = surveys.find(s => s.id === response.surveyId);
      const submittedDate = new Date(response.submittedAt);
      const displayEmail = getDisplayEmail(response);
      
      // Format answers for better readability
      const formattedAnswers = Object.entries(response.answers || {})
        .map(([questionIndex, answer]) => {
          const questionText = survey?.questions?.[parseInt(questionIndex)]?.text || `Question ${parseInt(questionIndex) + 1}`;
          const answerText = typeof answer === 'string' ? answer : String(answer || '');
          return `${questionText}: ${answerText}`;
        })
        .join(' | ');

      return [
        response.id || '',
        response.surveyId || '',
        survey?.topic || survey?.title || 'Unknown Survey',
        response.type === 'voice-extracted' ? 'Voice' : 'Email',
        displayEmail || 'Anonymous',
        submittedDate.toLocaleDateString(),
        submittedDate.toLocaleTimeString(),
        formattedAnswers || 'No answers',
        response.callSid || '',
        response.metadata ? JSON.stringify(response.metadata) : ''
      ];
    });
    
    // Create CSV content with proper escaping for special characters
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => {
        // Escape quotes and wrap in quotes
        const escaped = String(field || '').replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // More descriptive filename with filter info
    let filename = `survey-responses-${new Date().toISOString().split('T')[0]}`;
    if (selectedSurvey !== 'all') {
      const survey = surveys.find(s => s.id === selectedSurvey);
      filename += `-${(survey?.topic || survey?.title || 'survey').replace(/[^a-z0-9]/gi, '_')}`;
    }
    if (selectedType !== 'all') {
      filename += `-${selectedType}`;
    }
    filename += '.csv';
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show success message
    const exportedCount = sortedResponses.length;
    const totalCount = responses.length;
    alert(`Successfully exported ${exportedCount} responses${exportedCount !== totalCount ? ` (filtered from ${totalCount} total responses)` : ''}.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Survey Responses
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Analyze and manage all survey responses • Anonymous, email, and voice data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <ResponsesStats responses={responses} />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6 mb-6"
      >
        <ResponsesFilters
          surveys={surveys}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedSurvey={selectedSurvey}
          setSelectedSurvey={setSelectedSurvey}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </motion.div>

      {/* Responses Table */}
      <ResponsesTable
        responses={sortedResponses.map(response => ({
          ...response,
          email: getDisplayEmail(response) // Map the display email to the email field for the table
        }))}
        surveys={surveys}
        onViewResponse={setSelectedResponse}
      />

      {/* Response Detail Modal */}
      {selectedResponse && (
        <ResponseDetail
          response={selectedResponse}
          survey={surveys.find(s => s.id === selectedResponse.surveyId)}
          onClose={() => setSelectedResponse(null)}
        />
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <AnalyticsModal
          responses={responses}
          surveys={surveys}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </>
  );
}