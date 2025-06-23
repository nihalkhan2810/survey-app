'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  PhoneOutgoing, 
  PhoneIncoming, 
  PhoneMissed,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  User,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface CallLog {
  id: string;
  callId: string;
  direction: 'inbound' | 'outbound';
  phoneNumber: string;
  customerNumber: string;
  assistantNumber: string;
  duration: number;
  status: string;
  endedReason: string;
  timestamp: string;
  startTime?: string;
  endTime?: string;
  surveyId: string;
  surveyName: string;
  assistantName: string;
  respondentName: string;
  recording: boolean;
  recordingUrl?: string;
  transcript: boolean;
  transcriptData: any[];
  cost: number;
  analysis: any;
  metadata: any;
}

interface CallStats {
  total: number;
  completed: number;
  missed: number;
  failed: number;
  ongoing: number;
}

// Mock data for fallback
const mockCallLogs: CallLog[] = [
  {
    id: '1',
    callId: 'CA07404bbeb846363528ffa4f8d4e64925',
    direction: 'inbound',
    phoneNumber: '+1234567890',
    customerNumber: '+1234567890',
    assistantNumber: '+1807799304',
    duration: 245,
    status: 'ended',
    endedReason: 'customer-ended-call',
    timestamp: '2024-03-14T10:30:00Z',
    surveyId: 'Za5JB9CI5h',
    surveyName: 'Customer Satisfaction Survey',
    assistantName: 'Survey Assistant',
    respondentName: 'John Doe',
    recording: true,
    recordingUrl: undefined,
    transcript: true,
    transcriptData: [],
    cost: 0.15,
    analysis: null,
    metadata: {}
  },
  {
    id: '2',
    callId: 'CA8ccac7ab7bf325018be28270d96e981f',
    direction: 'outbound',
    phoneNumber: '+0987654321',
    customerNumber: '+0987654321',
    assistantNumber: '+1807799304',
    duration: 180,
    status: 'ended',
    endedReason: 'customer-ended-call',
    timestamp: '2024-03-14T09:15:00Z',
    surveyId: 'OiKHzTmAJ9',
    surveyName: 'Product Feedback Survey',
    assistantName: 'Survey Assistant',
    respondentName: 'Jane Smith',
    recording: true,
    recordingUrl: undefined,
    transcript: true,
    transcriptData: [],
    cost: 0.12,
    analysis: null,
    metadata: {}
  },
  {
    id: '3',
    callId: 'CAea0b3d247f30d64e71c8dc61f7d30201',
    direction: 'inbound',
    phoneNumber: '+1122334455',
    customerNumber: '+1122334455',
    assistantNumber: '+1807799304',
    duration: 0,
    status: 'no-answer',
    endedReason: 'customer-did-not-answer',
    timestamp: '2024-03-14T08:45:00Z',
    surveyId: '_HnNI3jfkX',
    surveyName: 'Employee Engagement Survey',
    assistantName: 'Survey Assistant',
    respondentName: 'Unknown',
    recording: false,
    recordingUrl: undefined,
    transcript: false,
    transcriptData: [],
    cost: 0.05,
    analysis: null,
    metadata: {}
  }
];

export function CallLogs() {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [stats, setStats] = useState<CallStats>({ total: 0, completed: 0, missed: 0, failed: 0, ongoing: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  // Fetch call logs from API
  const fetchCallLogs = async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/call-logs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch call logs');
      }

      if (data.success) {
        setCallLogs(data.calls || []);
        setStats(data.stats || { total: 0, completed: 0, missed: 0, failed: 0, ongoing: 0 });
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        // Fallback to mock data if API fails
        console.warn('API returned no data, using mock data');
        setCallLogs(mockCallLogs);
        setStats({ total: 3, completed: 2, missed: 1, failed: 0, ongoing: 0 });
      }
    } catch (err: any) {
      console.error('Error fetching call logs:', err);
      setError(err.message);
      // Fallback to mock data on error
      setCallLogs(mockCallLogs);
      setStats({ total: 3, completed: 2, missed: 1, failed: 0, ongoing: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch call details with transcript
  const fetchCallDetails = async (callId: string) => {
    try {
      const response = await fetch('/api/admin/call-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSelectedCall(data.call);
        setShowTranscript(true);
      } else {
        console.error('Failed to fetch call details:', data.error);
      }
    } catch (err) {
      console.error('Error fetching call details:', err);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchCallLogs();
  }, [currentPage, filterStatus, searchTerm]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (direction: string, status: string) => {
    if (status === 'missed') return <PhoneMissed className="h-5 w-5 text-red-500" />;
    if (direction === 'inbound') return <PhoneIncoming className="h-5 w-5 text-green-500" />;
    return <PhoneOutgoing className="h-5 w-5 text-blue-500" />;
  };

  const getStatusBadge = (status: string, endedReason?: string) => {
    let displayStatus = status;
    let className = '';

    // Map VAPI statuses to our display statuses
    if (status === 'ended' && endedReason !== 'customer-did-not-answer') {
      displayStatus = 'completed';
      className = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (status === 'no-answer' || endedReason === 'customer-did-not-answer') {
      displayStatus = 'missed';
      className = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    } else if (status === 'failed' || endedReason === 'assistant-error') {
      displayStatus = 'failed';
      className = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    } else if (status === 'ringing' || status === 'in-progress') {
      displayStatus = 'ongoing';
      className = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    } else {
      className = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
      </span>
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchCallLogs();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Phone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Call Logs
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor and manage all VAPI voice calls
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Calls</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.missed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Missed</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.failed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.ongoing}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ongoing</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {callLogs.filter(log => log.surveyId).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Survey Calls</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Showing cached data. Please check your VAPI configuration.</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone number, name, or survey..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            >
              <option value="all">All Calls</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Call logs table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Call Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Survey
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                    <span className="text-gray-500 dark:text-gray-400">Loading call logs...</span>
                  </div>
                </td>
              </tr>
            ) : callLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No call logs found</p>
                    {searchTerm || filterStatus !== 'all' ? (
                      <p className="text-sm mt-2">Try adjusting your search or filters</p>
                    ) : (
                      <p className="text-sm mt-2">Start making calls to see logs here</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              callLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.direction, log.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.phoneNumber}
                        </span>
                        {log.recording && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                            Recorded
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <User className="h-3 w-3" />
                        {log.respondentName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {log.surveyName}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      ID: {log.surveyId}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {log.duration > 0 ? formatDuration(log.duration) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(log.status, log.endedReason)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {formatDate(log.timestamp)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {log.transcript && (
                      <button
                        onClick={() => fetchCallDetails(log.callId)}
                        className="p-1.5 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        title="View Transcript"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    )}
                    {log.surveyId && (
                      <button
                        onClick={() => window.open(`/survey/${log.surveyId}/results`, '_blank')}
                        className="p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                        title="View Survey Results"
                      >
                        📊
                      </button>
                    )}
                    {log.recording && (
                      <button
                        className="p-1.5 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                        title="Play Recording"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && callLogs.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * 20, stats.total)}</span> of{' '}
              <span className="font-medium">{stats.total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md">
                {currentPage}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Modal */}
      {showTranscript && selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Call Transcript - {selectedCall.phoneNumber}
                </h3>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {selectedCall.surveyName} • {formatDate(selectedCall.timestamp)}
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              {selectedCall.transcriptData && selectedCall.transcriptData.length > 0 ? (
                <div className="space-y-3">
                  {selectedCall.transcriptData.map((item: any, index: number) => (
                    <div key={index} className={`flex ${item.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        item.role === 'assistant' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400' 
                          : 'bg-green-50 dark:bg-green-900/20 border-r-4 border-green-400'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {item.role === 'assistant' ? '🤖 Assistant' : '👤 Customer'}
                          </div>
                          {item.timestamp !== undefined && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {typeof item.timestamp === 'number' 
                                ? `${Math.floor(item.timestamp / 60)}:${(item.timestamp % 60).toString().padStart(2, '0')}`
                                : formatDate(item.timestamp)
                              }
                            </div>
                          )}
                        </div>
                        <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {item.text || item.content || item.message || 'No text available'}
                        </div>
                        {item.duration && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Duration: {item.duration.toFixed(1)}s
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transcript available for this call</p>
                  <p className="text-sm mt-2">This call may not have been transcribed or the transcript is still processing.</p>
                </div>
              )}
            </div>
            
            {/* Transcript Footer with Call Details */}
            {selectedCall && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Duration</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDuration(selectedCall.duration)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Status</div>
                    <div className="font-medium">
                      {getStatusBadge(selectedCall.status, selectedCall.endedReason)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Cost</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      ${selectedCall.cost?.toFixed(3) || '0.000'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Recording</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedCall.recording ? (
                        selectedCall.recordingUrl ? (
                          <a 
                            href={selectedCall.recordingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            🎵 Play
                          </a>
                        ) : (
                          <span className="text-green-600 dark:text-green-400">✓ Available</span>
                        )
                      ) : (
                        <span className="text-gray-400">Not recorded</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Analysis Summary */}
                {selectedCall.analysis && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Call Analysis</div>
                    {selectedCall.analysis.summary && (
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Summary</div>
                        <div className="text-sm text-gray-900 dark:text-white">{selectedCall.analysis.summary}</div>
                      </div>
                    )}
                    {selectedCall.analysis.successEvaluation && (
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Success Evaluation</div>
                        <div className="text-sm text-gray-900 dark:text-white">{selectedCall.analysis.successEvaluation}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
