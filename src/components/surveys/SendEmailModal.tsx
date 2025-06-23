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
  category: string;
  emails: string[];
};

const mockTargetAudiences: TargetAudience[] = [
  // Engineering Students - Year-wise
  { 
    id: 'ece-1st', 
    name: 'ECE 1st Year', 
    description: 'Electronics and Communication Engineering - First Year', 
    count: 45, 
    category: 'Engineering',
    emails: Array.from({length: 45}, (_, i) => `ece1st.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  { 
    id: 'ece-2nd', 
    name: 'ECE 2nd Year', 
    description: 'Electronics and Communication Engineering - Second Year', 
    count: 42, 
    category: 'Engineering',
    emails: Array.from({length: 42}, (_, i) => `ece2nd.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  { 
    id: 'ece-3rd', 
    name: 'ECE 3rd Year', 
    description: 'Electronics and Communication Engineering - Third Year', 
    count: 38, 
    category: 'Engineering',
    emails: Array.from({length: 38}, (_, i) => `ece3rd.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  { 
    id: 'ece-4th', 
    name: 'ECE 4th Year', 
    description: 'Electronics and Communication Engineering - Final Year', 
    count: 35, 
    category: 'Engineering',
    emails: Array.from({length: 35}, (_, i) => `ece4th.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  
  // Computer Science Students
  { 
    id: 'cs-1st', 
    name: 'CS 1st Year', 
    description: 'Computer Science - First Year', 
    count: 67, 
    category: 'Engineering',
    emails: Array.from({length: 67}, (_, i) => `cs1st.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  { 
    id: 'cs-2nd', 
    name: 'CS 2nd Year', 
    description: 'Computer Science - Second Year', 
    count: 59, 
    category: 'Engineering',
    emails: Array.from({length: 59}, (_, i) => `cs2nd.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  { 
    id: 'cs-3rd', 
    name: 'CS 3rd Year', 
    description: 'Computer Science - Third Year', 
    count: 54, 
    category: 'Engineering',
    emails: Array.from({length: 54}, (_, i) => `cs3rd.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  { 
    id: 'cs-4th', 
    name: 'CS 4th Year', 
    description: 'Computer Science - Final Year', 
    count: 52, 
    category: 'Engineering',
    emails: Array.from({length: 52}, (_, i) => `cs4th.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  
  // Mechanical Engineering Students
  { 
    id: 'me-1st', 
    name: 'ME 1st Year', 
    description: 'Mechanical Engineering - First Year', 
    count: 41, 
    category: 'Engineering',
    emails: Array.from({length: 41}, (_, i) => `me1st.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  { 
    id: 'me-2nd', 
    name: 'ME 2nd Year', 
    description: 'Mechanical Engineering - Second Year', 
    count: 39, 
    category: 'Engineering',
    emails: Array.from({length: 39}, (_, i) => `me2nd.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  { 
    id: 'me-3rd', 
    name: 'ME 3rd Year', 
    description: 'Mechanical Engineering - Third Year', 
    count: 37, 
    category: 'Engineering',
    emails: Array.from({length: 37}, (_, i) => `me3rd.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  { 
    id: 'me-4th', 
    name: 'ME 4th Year', 
    description: 'Mechanical Engineering - Final Year', 
    count: 34, 
    category: 'Engineering',
    emails: Array.from({length: 34}, (_, i) => `me4th.${String(i+1).padStart(3, '0')}@university.edu`)
  },
  
  // Business Students
  { 
    id: 'mba-1st', 
    name: 'MBA 1st Year', 
    description: 'Master of Business Administration - First Year', 
    count: 45, 
    category: 'Business',
    emails: Array.from({length: 45}, (_, i) => `mba1st.${String(i+1).padStart(3, '0')}@business.university.edu`)
  },
  { 
    id: 'mba-2nd', 
    name: 'MBA 2nd Year', 
    description: 'Master of Business Administration - Second Year', 
    count: 42, 
    category: 'Business',
    emails: Array.from({length: 42}, (_, i) => `mba2nd.${String(i+1).padStart(3, '0')}@business.university.edu`)
  },
  { 
    id: 'business-undergrad', 
    name: 'Business Undergrad', 
    description: 'Undergraduate Business Students (All Years)', 
    count: 89, 
    category: 'Business',
    emails: Array.from({length: 89}, (_, i) => `busundergrad.${String(i+1).padStart(3, '0')}@business.university.edu`)
  },
  
  // Alumni Groups
  { 
    id: 'alumni-2020', 
    name: 'Alumni 2020', 
    description: '2020 Graduation Batch - All Departments', 
    count: 156, 
    category: 'Alumni',
    emails: Array.from({length: 156}, (_, i) => `alumni2020.${String(i+1).padStart(3, '0')}@alumni.university.edu`)
  },
  { 
    id: 'alumni-2021', 
    name: 'Alumni 2021', 
    description: '2021 Graduation Batch - All Departments', 
    count: 143, 
    category: 'Alumni',
    emails: Array.from({length: 143}, (_, i) => `alumni2021.${String(i+1).padStart(3, '0')}@alumni.university.edu`)
  },
  { 
    id: 'alumni-2022', 
    name: 'Alumni 2022', 
    description: '2022 Graduation Batch - All Departments', 
    count: 134, 
    category: 'Alumni',
    emails: Array.from({length: 134}, (_, i) => `alumni2022.${String(i+1).padStart(3, '0')}@alumni.university.edu`)
  },
  { 
    id: 'alumni-2023', 
    name: 'Alumni 2023', 
    description: '2023 Graduation Batch - All Departments', 
    count: 128, 
    category: 'Alumni',
    emails: Array.from({length: 128}, (_, i) => `alumni2023.${String(i+1).padStart(3, '0')}@alumni.university.edu`)
  },
  
  // Faculty and Staff
  { 
    id: 'faculty-cs', 
    name: 'CS Faculty', 
    description: 'Computer Science Department Faculty', 
    count: 12, 
    category: 'Faculty',
    emails: Array.from({length: 12}, (_, i) => `csfaculty.${String(i+1).padStart(2, '0')}@faculty.university.edu`)
  },
  { 
    id: 'faculty-ece', 
    name: 'ECE Faculty', 
    description: 'Electronics and Communication Engineering Faculty', 
    count: 10, 
    category: 'Faculty',
    emails: Array.from({length: 10}, (_, i) => `ecefaculty.${String(i+1).padStart(2, '0')}@faculty.university.edu`)
  },
  { 
    id: 'faculty-business', 
    name: 'Business Faculty', 
    description: 'Business School Faculty Members', 
    count: 15, 
    category: 'Faculty',
    emails: Array.from({length: 15}, (_, i) => `bizfaculty.${String(i+1).padStart(2, '0')}@business.university.edu`)
  },
  { 
    id: 'staff-admin', 
    name: 'Administrative Staff', 
    description: 'University Administrative and Support Staff', 
    count: 89, 
    category: 'Staff',
    emails: Array.from({length: 89}, (_, i) => `admin.${String(i+1).padStart(3, '0')}@admin.university.edu`)
  },
  
  // Research Students
  { 
    id: 'phd-engineering', 
    name: 'PhD Engineering', 
    description: 'Doctoral Students - Engineering Departments', 
    count: 45, 
    category: 'Research',
    emails: Array.from({length: 45}, (_, i) => `phdeng.${String(i+1).padStart(3, '0')}@research.university.edu`)
  },
  { 
    id: 'phd-business', 
    name: 'PhD Business', 
    description: 'Doctoral Students - Business School', 
    count: 18, 
    category: 'Research',
    emails: Array.from({length: 18}, (_, i) => `phdbiz.${String(i+1).padStart(2, '0')}@research.university.edu`)
  },
  { 
    id: 'research-associates', 
    name: 'Research Associates', 
    description: 'Post-doctoral and Research Associates', 
    count: 25, 
    category: 'Research',
    emails: Array.from({length: 25}, (_, i) => `research.${String(i+1).padStart(2, '0')}@research.university.edu`)
  },
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
  const [showEmailPreview, setShowEmailPreview] = useState(false);
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

  // Get current email list for preview
  const getCurrentEmails = () => {
    if (emailInputMethod === 'manual') {
      return studentEmails.split(',').map((email) => email.trim()).filter(Boolean);
    } else {
      const selectedAudienceData = mockTargetAudiences.filter(audience => 
        selectedAudiences.includes(audience.id)
      );
      return selectedAudienceData.flatMap(audience => audience.emails);
    }
  };

  const currentEmails = getCurrentEmails();

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
      // Use the actual email addresses from our detailed audience data
      emails = selectedAudienceData.flatMap(audience => audience.emails);
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
                  
                  {/* Search Input with Dropdown Toggle */}
                  <div ref={searchRef} className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search audiences (e.g., 'ECE 1st year', 'CS', 'MBA')..."
                        value={audienceSearch}
                        onChange={(e) => setAudienceSearch(e.target.value)}
                        onFocus={() => setShowAudienceDropdown(true)}
                        className="flex-1 px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg className={`h-4 w-4 transition-transform ${showAudienceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Browse
                      </button>
                    </div>
                    <div className="absolute right-[120px] top-3.5 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Dropdown Results */}
                  {showAudienceDropdown && (
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 z-10 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg">
                        {filteredAudiences.length > 0 ? (
                          <>
                            {/* Group by Category */}
                            {['Engineering', 'Business', 'Alumni', 'Faculty', 'Staff', 'Research'].map(category => {
                              const categoryAudiences = filteredAudiences.filter(aud => aud.category === category);
                              if (categoryAudiences.length === 0) return null;
                              
                              return (
                                <div key={category}>
                                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                      {category}
                                    </h5>
                                  </div>
                                  {categoryAudiences.map(audience => (
                                    <div
                                      key={audience.id}
                                      onClick={() => {
                                        handleAudienceToggle(audience.id);
                                        if (audienceSearch) {
                                          setAudienceSearch('');
                                          setShowAudienceDropdown(false);
                                        }
                                      }}
                                      className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
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
                                  ))}
                                </div>
                              );
                            })}
                          </>
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
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-green-800 dark:text-green-300">
                            Selected {selectedAudiences.length} audience(s) with total of{' '}
                            <span className="font-semibold">
                              {mockTargetAudiences
                                .filter(a => selectedAudiences.includes(a.id))
                                .reduce((sum, a) => sum + a.count, 0)}
                            </span>{' '}
                            recipients
                          </p>
                          {currentEmails.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setShowEmailPreview(!showEmailPreview)}
                              className="text-xs text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 underline"
                            >
                              {showEmailPreview ? 'Hide Emails' : 'View Email Addresses'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Preview Section */}
                  {(currentEmails.length > 0 && showEmailPreview) && (
                    <div className="border border-blue-200 dark:border-blue-700 rounded-xl p-4 bg-blue-50/30 dark:bg-blue-900/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.94a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Recipients ({currentEmails.length})
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(currentEmails.join(', '));
                              setStatus('Email addresses copied to clipboard!');
                              setTimeout(() => setStatus(''), 2000);
                            }}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Copy All
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowEmailPreview(false)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-40 overflow-y-auto border border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 text-xs">
                          {currentEmails.map((email, index) => (
                            <div key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-mono break-all">
                              {email}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-blue-700 dark:text-blue-300">
                        <p>✉️ These are the exact email addresses that will receive the survey invitation.</p>
                        {emailInputMethod === 'audience' && selectedAudiences.length > 0 && (
                          <p className="mt-1">
                            📊 Breakdown by audience: {selectedAudiences.map(id => {
                              const audience = mockTargetAudiences.find(a => a.id === id);
                              return audience ? `${audience.name} (${audience.count})` : '';
                            }).filter(Boolean).join(', ')}
                          </p>
                        )}
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