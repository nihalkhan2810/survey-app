'use client';

import { useState, useEffect, useRef } from 'react';

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

export function SendEmailModal({ 
  survey, 
  onClose, 
  showSurveyDropdown = false 
}: { 
  survey: Survey | null; 
  onClose: () => void;
  showSurveyDropdown?: boolean;
}) {
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(survey);
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [studentEmails, setStudentEmails] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [emailInputMethod, setEmailInputMethod] = useState<'manual' | 'audience'>('audience');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSalesforceImport, setShowSalesforceImport] = useState(false);
  
  // Reminder settings
  const [enableReminders, setEnableReminders] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    sendOnStart: true,
    sendOnEnd: true,
    sendMidpoint: false,
    midpointDays: 3,
    customReminders: [] as { date: string; type: string }[]
  });
  const [generatingReminder, setGeneratingReminder] = useState(false);
  const [showReminderOptions, setShowReminderOptions] = useState(false);
  
  // Search functionality for audiences
  const [audienceSearch, setAudienceSearch] = useState('');
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showSurveyDropdown) {
      fetch('/api/surveys')
        .then(res => res.json())
        .then(data => {
          setAvailableSurveys(Array.isArray(data) ? data : []);
        })
        .catch(() => setAvailableSurveys([]));
    }
  }, [showSurveyDropdown]);

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
  
  const surveyLink = selectedSurvey ? `${window.location.origin}/survey/${selectedSurvey.id}` : '';

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
      setTimeout(onClose, 2000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Send Survey via Email</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 text-2xl font-bold">&times;</button>
          </div>
          <p className="mt-2 text-gray-500">
            {selectedSurvey ? (
              <>Distribute <span className="font-semibold">{selectedSurvey.topic}</span></>
            ) : (
              'Select a survey to distribute'
            )}
          </p>
        </div>

        <div className="p-6">

        <form onSubmit={handleSubmit} className="space-y-6">
            {showSurveyDropdown && (
              <div>
                <label htmlFor="surveySelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Survey</label>
                <select 
                  id="surveySelect" 
                  value={selectedSurvey?.id || ''} 
                  onChange={(e) => {
                    const survey = availableSurveys.find(s => s.id === e.target.value);
                    setSelectedSurvey(survey || null);
                  }}
                  required 
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Choose a survey...</option>
                  {availableSurveys.map(survey => (
                    <option key={survey.id} value={survey.id}>{survey.topic}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recipients</label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setEmailInputMethod('audience')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    emailInputMethod === 'audience'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Target Audience
                </button>
                <button
                  type="button"
                  onClick={() => setEmailInputMethod('manual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    emailInputMethod === 'manual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Manual Entry
                </button>
              </div>
              
              {emailInputMethod === 'audience' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Select target audiences:</span>
                    <button
                      type="button"
                      onClick={handleSalesforceImport}
                      disabled={showSalesforceImport}
                      className="px-3 py-1 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
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
                      className="w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                      <div className="absolute top-0 left-0 right-0 z-10 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg">
                        {filteredAudiences.length > 0 ? (
                          filteredAudiences.map(audience => (
                            <div
                              key={audience.id}
                              onClick={() => {
                                handleAudienceToggle(audience.id);
                                setAudienceSearch('');
                                setShowAudienceDropdown(false);
                              }}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{audience.name}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{audience.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{audience.count}</span>
                                  {selectedAudiences.includes(audience.id) && (
                                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No audiences found matching "{audienceSearch}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Selected Audiences Pills */}
                  {selectedAudiences.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedAudiences.map(audienceId => {
                          const audience = mockTargetAudiences.find(a => a.id === audienceId);
                          if (!audience) return null;
                          return (
                            <div
                              key={audienceId}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                            >
                              <span className="font-medium">{audience.name}</span>
                              <span className="text-blue-600 dark:text-blue-400">({audience.count})</span>
                              <button
                                onClick={() => handleAudienceToggle(audienceId)}
                                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-300">
                          Selected {selectedAudiences.length} audience(s) with total of{' '}
                          <span className="font-semibold">
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
                  <label htmlFor="studentEmails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Emails (comma-separated)</label>
                  <textarea 
                    id="studentEmails" 
                    value={studentEmails} 
                    onChange={(e) => setStudentEmails(e.target.value)} 
                    required={emailInputMethod === 'manual'} 
                    rows={4} 
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" 
                    placeholder="student1@example.com, student2@example.com, ..."
                  />
                </div>
              )}
            </div>
            
            {/* AI Reminder Generator */}
            {selectedSurvey && (
              <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">AI Reminder Assistant</h4>
                  <button
                    type="button"
                    onClick={() => setShowReminderOptions(!showReminderOptions)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {showReminderOptions ? 'Hide Options' : 'Show Options'}
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => generateAIReminder('opening')}
                    disabled={generatingReminder}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {generatingReminder ? '⏳' : '🚀'} Opening Day
                  </button>
                  <button
                    type="button"
                    onClick={() => generateAIReminder('midpoint')}
                    disabled={generatingReminder}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {generatingReminder ? '⏳' : '📢'} Follow-up
                  </button>
                  <button
                    type="button"
                    onClick={() => generateAIReminder('closing')}
                    disabled={generatingReminder}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {generatingReminder ? '⏳' : '⚡'} Last Chance
                  </button>
                </div>
                
                {showReminderOptions && (
                  <div className="space-y-3 border-t border-blue-200 dark:border-blue-700 pt-3">
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
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  AI will generate personalized reminder messages based on your survey topic and timing.
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Subject</label>
              <input type="text" id="emailSubject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Body</label>
              <textarea id="emailBody" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} required rows={3} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <p className="mt-1 text-xs text-gray-500">The survey link will be automatically appended to the email body.</p>
            </div>
            <div className="flex justify-end items-center gap-4 pt-4">
                {status && <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>}
                <button 
                  type="submit" 
                  disabled={isSending || !selectedSurvey || (emailInputMethod === 'audience' && selectedAudiences.length === 0) || (emailInputMethod === 'manual' && !studentEmails.trim())} 
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSending ? 'Sending...' : 'Send Emails'}
                </button>
            </div>
        </form>
        </div>
      </div>
    </div>
  );
} 