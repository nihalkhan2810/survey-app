'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Eye, MessageSquare, Phone, Mail, User, Calendar, BarChart3, TrendingUp } from 'lucide-react';
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

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSurvey, setSelectedSurvey] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'survey' | 'type' | 'response_count'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [responsesRes, surveysRes] = await Promise.all([
          fetch('/api/all-responses'),
          fetch('/api/surveys-with-dummy')
        ]);
        
        const responsesData = await responsesRes.json();
        const surveysData = await surveysRes.json();
        
        setResponses(responsesData);
        setSurveys(surveysData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredResponses = responses.filter((response) => {
    const matchesSearch = searchTerm === '' || 
      response.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (response.email && response.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      Object.values(response.answers).some(answer => 
        answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesType = selectedType === 'all' || response.type === selectedType;
    const matchesSurvey = selectedSurvey === 'all' || response.surveyId === selectedSurvey;
    
    return matchesSearch && matchesType && matchesSurvey;
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
    const headers = ['ID', 'Survey ID', 'Type', 'Email', 'Submitted At', 'Answers'];
    const csvData = sortedResponses.map(response => [
      response.id,
      response.surveyId,
      response.type,
      response.email || 'Anonymous',
      response.submittedAt,
      JSON.stringify(response.answers)
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search responses by ID, email, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
          
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
        </div>
      </motion.div>

      {/* Responses Table */}
      <ResponsesTable
        responses={sortedResponses}
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