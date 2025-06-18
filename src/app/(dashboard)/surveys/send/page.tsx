'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Sparkles, Users, Mail } from 'lucide-react';
import { getSurveyUrl } from '@/lib/utils';

type Survey = {
  id: string;
  topic: string;
  created_at?: string;
};

type TargetAudience = {
  id: string;
  name: string;
  description: string;
  count: number;
};

const mockTargetAudiences: TargetAudience[] = [
  { id: 'mba-1st', name: 'MBA 1st Year', description: 'First year MBA students', count: 45 },
  { id: 'mba-2nd', name: 'MBA 2nd Year', description: 'Second year MBA students', count: 42 },
  { id: 'ece-class1', name: 'ECE Class 1', description: 'Electronics and Communication Engineering - Class 1', count: 38 },
  { id: 'ece-class2', name: 'ECE Class 2', description: 'Electronics and Communication Engineering - Class 2', count: 35 },
  { id: 'cs-freshmen', name: 'CS Freshmen', description: 'Computer Science first year students', count: 67 },
  { id: 'cs-sophomores', name: 'CS Sophomores', description: 'Computer Science second year students', count: 59 },
  { id: 'cs-juniors', name: 'CS Juniors', description: 'Computer Science third year students', count: 54 },
  { id: 'cs-seniors', name: 'CS Seniors', description: 'Computer Science senior students', count: 52 },
  { id: 'business-exec', name: 'Business Executives', description: 'Executive MBA program participants', count: 28 },
  { id: 'me-1st', name: 'ME 1st Year', description: 'Mechanical Engineering first year students', count: 41 },
  { id: 'me-2nd', name: 'ME 2nd Year', description: 'Mechanical Engineering second year students', count: 39 },
  { id: 'alumni-2020', name: 'Alumni 2020', description: '2020 batch alumni network', count: 156 },
  { id: 'alumni-2021', name: 'Alumni 2021', description: '2021 batch alumni network', count: 143 },
  { id: 'alumni-2022', name: 'Alumni 2022', description: '2022 batch alumni network', count: 134 },
  { id: 'faculty-cs', name: 'CS Faculty', description: 'Computer Science department faculty', count: 12 },
  { id: 'faculty-business', name: 'Business Faculty', description: 'Business school faculty members', count: 15 },
  { id: 'staff-admin', name: 'Administrative Staff', description: 'Administrative and support staff', count: 89 },
  { id: 'phd-students', name: 'PhD Students', description: 'Doctoral program students across all departments', count: 78 },
];

export default function SendSurveyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSurveyId = searchParams.get('surveyId');
  
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [studentEmails, setStudentEmails] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [emailInputMethod, setEmailInputMethod] = useState<'manual' | 'audience'>('audience');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSalesforceImport, setShowSalesforceImport] = useState(false);
  
  // AI Reminder states
  const [generatingReminder, setGeneratingReminder] = useState(false);
  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [showReminderSection, setShowReminderSection] = useState(false);
  const [enableReminders, setEnableReminders] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    sendOnStart: true,
    sendOnEnd: true,
    sendMidpoint: false,
    midpointDays: 3,
    customReminders: [] as { date: string; type: string }[]
  });
  
  // Search functionality for audiences
  const [audienceSearch, setAudienceSearch] = useState('');
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch('/api/surveys');
        const data = await response.json();
        const surveys = Array.isArray(data) ? data : [];
        setAvailableSurveys(surveys);
        
        // Auto-select survey if preselected
        if (preselectedSurveyId) {
          const preselected = surveys.find((s: Survey) => s.id === preselectedSurveyId);
          if (preselected) {
            setSelectedSurvey(preselected);
          }
        }
      } catch (error) {
        setAvailableSurveys([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [preselectedSurveyId]);

  useEffect(() => {
    if (selectedSurvey) {
      setEmailSubject(`Survey: ${selectedSurvey.topic}`);
      setEmailBody(`Please take a moment to complete this important survey regarding ${selectedSurvey.topic}.`);
    }
  }, [selectedSurvey]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAudienceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const surveyLink = selectedSurvey ? getSurveyUrl(selectedSurvey.id) : '';

  const handleAudienceToggle = (audienceId: string) => {
    setSelectedAudiences(prev => 
      prev.includes(audienceId)
        ? prev.filter(id => id !== audienceId)
        : [...prev, audienceId]
    );
  };

  const handleSalesforceImport = () => {
    setShowSalesforceImport(true);
    setTimeout(() => {
      setStatus('Successfully imported 127 contacts from Salesforce!');
      setShowSalesforceImport(false);
    }, 2000);
  };

  const filteredAudiences = mockTargetAudiences.filter(audience =>
    audience.name.toLowerCase().includes(audienceSearch.toLowerCase()) ||
    audience.description.toLowerCase().includes(audienceSearch.toLowerCase())
  );

  const generateAIReminder = async (reminderType: 'opening' | 'closing' | 'midpoint') => {
    if (!selectedSurvey) return;
    
    setGeneratingReminder(true);
    try {
      const recipientCount = emailInputMethod === 'manual' 
        ? studentEmails.split(',').length 
        : mockTargetAudiences
            .filter(a => selectedAudiences.includes(a.id))
            .reduce((sum, a) => sum + a.count, 0);
            
      const response = await fetch('/api/generate-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyTopic: selectedSurvey.topic,
          reminderType,
          recipientCount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reminder message');
      }

      const data = await response.json();
      setEmailSubject(data.subject);
      setEmailBody(data.message + '\n\n' + surveyLink);
      setStatus('AI reminder message generated successfully!');
    } catch (error: any) {
      setStatus(`Error generating reminder: ${error.message}`);
    } finally {
      setGeneratingReminder(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSurvey) {
      setStatus('Please select a survey to send.');
      return;
    }
    
    setIsSending(true);
    setStatus('Sending...');

    let emails: string[] = [];
    
    if (emailInputMethod === 'manual') {
      emails = studentEmails.split(',').map((email) => email.trim()).filter(Boolean);
    } else {
      const selectedAudienceData = mockTargetAudiences.filter(audience => 
        selectedAudiences.includes(audience.id)
      );
      const totalCount = selectedAudienceData.reduce((sum, audience) => sum + audience.count, 0);
      emails = Array(totalCount).fill(0).map((_, i) => `student${i + 1}@example.com`);
    }
    
    try {
      const response = await fetch('/api/send-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyLink, emailSubject, emailBody, emails }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send emails.');
      setStatus('Emails sent successfully!');
      setTimeout(() => router.push('/surveys'), 2000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/surveys')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/50 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Surveys
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Send Survey
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Distribute your survey to the right audience with personalized messaging
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Survey Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Select Survey
              </h3>
              
              <select 
                value={selectedSurvey?.id || ''} 
                onChange={(e) => {
                  const survey = availableSurveys.find(s => s.id === e.target.value);
                  setSelectedSurvey(survey || null);
                }}
                required 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
              >
                <option value="">Choose a survey to send...</option>
                {availableSurveys.map(survey => (
                  <option key={survey.id} value={survey.id}>{survey.topic}</option>
                ))}
              </select>
            </div>

            {/* Recipients Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Recipients
              </h3>
              
              {/* Input Method Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 max-w-md">
                <button
                  type="button"
                  onClick={() => setEmailInputMethod('audience')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    emailInputMethod === 'audience'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Target Audience
                </button>
                <button
                  type="button"
                  onClick={() => setEmailInputMethod('manual')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    emailInputMethod === 'manual'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Manual Entry
                </button>
              </div>
              
              {emailInputMethod === 'audience' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Select your target audiences:</span>
                    <button
                      type="button"
                      onClick={handleSalesforceImport}
                      disabled={showSalesforceImport}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-200"
                    >
                      {showSalesforceImport ? 'Importing...' : 'Import from Salesforce'}
                    </button>
                  </div>
                  
                  {/* Search Input */}
                  <div ref={searchRef} className="relative">
                    <input
                      type="text"
                      placeholder="Search audiences (e.g., '1st', 'CS', 'MBA')..."
                      value={audienceSearch}
                      onChange={(e) => setAudienceSearch(e.target.value)}
                      onFocus={() => setShowAudienceDropdown(true)}
                      className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute right-3 top-3.5">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Dropdown Results */}
                  {showAudienceDropdown && audienceSearch && (
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 z-10 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                        {filteredAudiences.length > 0 ? (
                          filteredAudiences.map(audience => (
                            <div
                              key={audience.id}
                              onClick={() => {
                                handleAudienceToggle(audience.id);
                                setAudienceSearch('');
                                setShowAudienceDropdown(false);
                              }}
                              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{audience.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{audience.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{audience.count}</span>
                                  {selectedAudiences.includes(audience.id) && (
                                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No audiences found matching "{audienceSearch}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Selected Audiences Pills */}
                  {selectedAudiences.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        {selectedAudiences.map(audienceId => {
                          const audience = mockTargetAudiences.find(a => a.id === audienceId);
                          if (!audience) return null;
                          return (
                            <div
                              key={audienceId}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-700"
                            >
                              <span className="font-medium">{audience.name}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">({audience.count})</span>
                              <button
                                onClick={() => handleAudienceToggle(audienceId)}
                                className="ml-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-1 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <p className="text-green-800 dark:text-green-300 font-medium">
                          Selected {selectedAudiences.length} audience(s) with total of{' '}
                          <span className="text-xl font-bold">
                            {mockTargetAudiences
                              .filter(a => selectedAudiences.includes(a.id))
                              .reduce((sum, a) => sum + a.count, 0)}
                          </span>{' '}
                          recipients
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="studentEmails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Student Emails (comma-separated)</label>
                  <textarea 
                    id="studentEmails" 
                    value={studentEmails} 
                    onChange={(e) => setStudentEmails(e.target.value)} 
                    required={emailInputMethod === 'manual'} 
                    rows={6} 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none" 
                    placeholder="student1@example.com, student2@example.com, ..."
                  />
                </div>
              )}
            </div>

            {/* Optional AI Reminder Section */}
            {selectedSurvey && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReminderSection(!showReminderSection)}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">AI Reminder Assistant</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">(Optional)</span>
                      <svg 
                        className={`h-4 w-4 transition-transform ${showReminderSection ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Generate personalized reminder emails
                  </div>
                </div>
                
                {showReminderSection && (
                  <div className="border border-blue-200 dark:border-blue-700 rounded-xl p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Quick Reminder Templates
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowReminderOptions(!showReminderOptions)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        {showReminderOptions ? 'Hide Settings' : 'Show Settings'}
                      </button>
                    </div>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => generateAIReminder('opening')}
                    disabled={generatingReminder}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                  >
                    {generatingReminder ? '⏳' : '🚀'} Opening Day
                  </button>
                  <button
                    type="button"
                    onClick={() => generateAIReminder('midpoint')}
                    disabled={generatingReminder}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                  >
                    {generatingReminder ? '⏳' : '📢'} Follow-up
                  </button>
                  <button
                    type="button"
                    onClick={() => generateAIReminder('closing')}
                    disabled={generatingReminder}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
                  >
                    {generatingReminder ? '⏳' : '⚡'} Last Chance
                  </button>
                </div>
                
                {showReminderOptions && (
                  <div className="space-y-3 border-t border-blue-200 dark:border-blue-700 pt-4 mt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="enableReminders"
                        checked={enableReminders}
                        onChange={(e) => setEnableReminders(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableReminders" className="text-sm text-gray-700 dark:text-gray-300">
                        Schedule automatic reminders
                      </label>
                    </div>
                    
                    {enableReminders && (
                      <div className="ml-6 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sendOnStart"
                            checked={reminderSettings.sendOnStart}
                            onChange={(e) => setReminderSettings(prev => ({ ...prev, sendOnStart: e.target.checked }))}
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="sendOnStart" className="text-gray-600 dark:text-gray-400">
                            Send reminder when survey opens
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sendOnEnd"
                            checked={reminderSettings.sendOnEnd}
                            onChange={(e) => setReminderSettings(prev => ({ ...prev, sendOnEnd: e.target.checked }))}
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="sendOnEnd" className="text-gray-600 dark:text-gray-400">
                            Send reminder on closing day
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sendMidpoint"
                            checked={reminderSettings.sendMidpoint}
                            onChange={(e) => setReminderSettings(prev => ({ ...prev, sendMidpoint: e.target.checked }))}
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="sendMidpoint" className="text-gray-600 dark:text-gray-400">
                            Send follow-up reminder after
                          </label>
                          <input
                            type="number"
                            value={reminderSettings.midpointDays}
                            onChange={(e) => setReminderSettings(prev => ({ ...prev, midpointDays: parseInt(e.target.value) }))}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            min="1"
                            max="30"
                          />
                          <span className="text-gray-600 dark:text-gray-400">days</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      AI will generate personalized reminder messages based on your survey topic and timing. Use these buttons to quickly create professional email content.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Email Content */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Email Content
              </h3>
              
              <div>
                <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Line</label>
                <input 
                  type="text" 
                  id="emailSubject" 
                  value={emailSubject} 
                  onChange={(e) => setEmailSubject(e.target.value)} 
                  required 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
              
              <div>
                <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Body</label>
                <textarea 
                  id="emailBody" 
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)} 
                  required 
                  rows={6} 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none" 
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  The survey link will be automatically appended to your message.
                </p>
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              {status && (
                <p className={`text-sm ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {status}
                </p>
              )}
              <div className="flex gap-4 ml-auto">
                <button 
                  type="button"
                  onClick={() => router.push('/surveys')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSending || !selectedSurvey || (emailInputMethod === 'audience' && selectedAudiences.length === 0) || (emailInputMethod === 'manual' && !studentEmails.trim())} 
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Survey
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}