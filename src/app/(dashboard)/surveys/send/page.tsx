'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Sparkles, Users, Mail, Clock } from 'lucide-react';
import { getSurveyUrl } from '@/lib/utils';

type Survey = {
  id: string;
  topic: string;
  created_at?: string;
  reminder_config?: any[];
  auto_send_reminders?: boolean;
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
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [emailInputMethod, setEmailInputMethod] = useState<'manual' | 'audience'>('audience');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSalesforceImport, setShowSalesforceImport] = useState(false);
  
  // Paired recipient inputs for call reminders
  const [recipients, setRecipients] = useState<{ email: string; phone: string; id: string }[]>([
    { email: '', phone: '', id: '1' },
    { email: '', phone: '', id: '2' }
  ]);
  
  // Email exclusion state - NEW
  const [excludedEmails, setExcludedEmails] = useState<Set<string>>(new Set());
  
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
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Call reminder states
  const [callReminderEnabled, setCallReminderEnabled] = useState(false);
  const [sentSurveyId, setSentSurveyId] = useState<string | null>(null);
  const [triggeringCalls, setTriggeringCalls] = useState(false);
  const [forceCallReminderMode, setForceCallReminderMode] = useState(false);

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
      
      // Check if call reminder is enabled for this survey
      setCallReminderEnabled((selectedSurvey as any).call_reminder_enabled || false);
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

  // Calculate current emails for reminder component
  const getCurrentEmails = (): string[] => {
    if (emailInputMethod === 'manual') {
      if (callReminderEnabled || forceCallReminderMode) {
        // Use paired recipients when call reminders are enabled
        return recipients.map(r => r.email.trim()).filter(Boolean);
      } else {
        // Use traditional comma-separated emails when no call reminders
        return studentEmails.split(',').map((email) => email.trim()).filter(Boolean);
      }
    } else {
      const selectedAudienceData = mockTargetAudiences.filter(audience => 
        selectedAudiences.includes(audience.id)
      );
      // Use the actual email addresses from our detailed audience data and filter out excluded emails
      const allEmails = selectedAudienceData.flatMap(audience => audience.emails);
      return allEmails.filter(email => !excludedEmails.has(email));
    }
  };

  const currentEmails = getCurrentEmails();
  const currentEmailCount = emailInputMethod === 'manual' 
    ? currentEmails.length 
    : currentEmails.length; // Changed to use filtered currentEmails.length

  const handleAudienceToggle = (audienceId: string) => {
    setSelectedAudiences(prev => {
      const newSelection = prev.includes(audienceId)
        ? prev.filter(id => id !== audienceId)
        : [...prev, audienceId];
      
      return newSelection;
    });
    
    // Clear excluded emails when audiences change
    setExcludedEmails(new Set());
  };

  // NEW: Handle email exclusion
  const handleEmailToggle = (email: string) => {
    setExcludedEmails(prev => {
      const newExcluded = new Set(prev);
      if (newExcluded.has(email)) {
        newExcluded.delete(email);
      } else {
        newExcluded.add(email);
      }
      return newExcluded;
    });
  };

  // NEW: Get all emails including excluded ones for display
  const getAllEmails = (): string[] => {
    if (emailInputMethod === 'manual') {
      return studentEmails.split(',').map((email) => email.trim()).filter(Boolean);
    } else {
      const selectedAudienceData = mockTargetAudiences.filter(audience => 
        selectedAudiences.includes(audience.id)
      );
      return selectedAudienceData.flatMap(audience => audience.emails);
    }
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

  // Functions to manage paired recipients
  const addRecipient = () => {
    const newId = (recipients.length + 1).toString();
    setRecipients(prev => [...prev, { email: '', phone: '', id: newId }]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(prev => prev.filter(r => r.id !== id));
    }
  };

  const updateRecipient = (id: string, field: 'email' | 'phone', value: string) => {
    setRecipients(prev => prev.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length >= 10) {
      // Format as +1XXXXXXXXXX (no spaces or parentheses)
      return `+1${phoneNumber.slice(-10)}`;
    }
    return phoneNumber;
  };

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

  const handleTriggerCallReminders = async () => {
    if (!sentSurveyId) return;
    
    setTriggeringCalls(true);
    try {
      const response = await fetch('/api/trigger-call-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId: sentSurveyId }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to trigger call reminders.');
      
      setStatus('Call reminders triggered! Check console logs for VAPI call status.');
    } catch (error: any) {
      setStatus(`Error triggering calls: ${error.message}`);
    } finally {
      setTriggeringCalls(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSurvey) {
      setStatus('Please select a survey to send.');
      return;
    }
    
    const emails = getCurrentEmails();
    
    // Validate recipients if call reminder is enabled and using manual entry
    let phoneNumbersList: string[] = [];
    if ((callReminderEnabled || forceCallReminderMode) && emailInputMethod === 'manual') {
      // Validate paired recipients
      const validRecipients = recipients.filter(r => r.email.trim() && r.phone.trim());
      
      if (validRecipients.length === 0) {
        setStatus('At least one email-phone pair is required when call reminders are enabled.');
        return;
      }
      
      // Check for incomplete pairs
      const incompleteRecipients = recipients.filter(r => 
        (r.email.trim() && !r.phone.trim()) || (!r.email.trim() && r.phone.trim())
      );
      
      if (incompleteRecipients.length > 0) {
        setStatus('All recipients must have both email and phone number filled in.');
        return;
      }
      
      phoneNumbersList = validRecipients.map(r => r.phone.trim());
    }
    
    setIsSending(true);
    setStatus('Sending...');
    
    try {
      const requestBody: any = { 
        surveyLink, 
        emailSubject, 
        emailBody, 
        emails,
        surveyId: selectedSurvey.id
      };
      
      // Include phone numbers and call reminder info if enabled
      if ((callReminderEnabled || forceCallReminderMode) && emailInputMethod === 'manual') {
        requestBody.phoneNumbers = phoneNumbersList;
        requestBody.callReminderEnabled = true;
      }
      
      const response = await fetch('/api/send-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send emails.');
      
      if ((callReminderEnabled || forceCallReminderMode) && emailInputMethod === 'manual') {
        setStatus('Emails sent successfully! Call reminders are now active for non-responders.');
        setSentSurveyId(selectedSurvey.id);
      } else {
        setStatus('Emails sent successfully!');
        setTimeout(() => router.push('/surveys'), 2000);
      }
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
                  
                  {/* Search Input with Dropdown Toggle */}
                  <div ref={searchRef} className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search audiences (e.g., 'ECE 1st year', 'CS', 'MBA')..."
                        value={audienceSearch}
                        onChange={(e) => setAudienceSearch(e.target.value)}
                        onFocus={() => setShowAudienceDropdown(true)}
                        className="flex-1 px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                        className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
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
                  
                  
                  {/* IMMEDIATE EMAIL DISPLAY - Show emails the moment an audience is selected */}
                  {selectedAudiences.length > 0 && (
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-xl animate-pulse">
                      <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
                        📧 SELECTED EMAILS ({currentEmails.length} total recipients)
                      </h3>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto border-2 border-blue-200 dark:border-blue-700">
                        <div className="text-sm font-mono space-y-1">
                          {currentEmails.map((email, idx) => (
                            <div key={idx} className="text-blue-700 dark:text-blue-300 p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded">
                              {idx + 1}. {email}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-600">
                        <div className="text-sm text-green-800 dark:text-green-300 font-medium">
                          ✅ These {currentEmails.length} email addresses will receive your survey when you click "Send Survey"
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                          Selected from: {selectedAudiences.map(id => {
                            const audience = mockTargetAudiences.find(a => a.id === id);
                            return audience ? audience.name : '';
                          }).filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Dropdown Results */}
                  {showAudienceDropdown && (
                    <div className="relative">
                      <div className="absolute top-0 left-0 right-0 z-10 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                        {filteredAudiences.length > 0 ? (
                          <>
                            {/* Group by Category */}
                            {['Engineering', 'Business', 'Alumni', 'Faculty', 'Staff', 'Research'].map(category => {
                              const categoryAudiences = filteredAudiences.filter(aud => aud.category === category);
                              if (categoryAudiences.length === 0) return null;
                              
                              return (
                                <div key={category}>
                                  <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-700 border-b border-emerald-200 dark:border-emerald-600">
                                    <h5 className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide">
                                      {category}
                                    </h5>
                                  </div>
                                  {categoryAudiences.map(audience => (
                                    <div
                                      key={audience.id}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAudienceToggle(audience.id);
                                      }}
                                      className="p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <h4 className="font-medium text-gray-900 dark:text-white">{audience.name}</h4>
                                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{audience.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{audience.count}</span>
                                          {selectedAudiences.includes(audience.id) && (
                                            <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                        <div className="flex items-center justify-between">
                          <p className="text-green-800 dark:text-green-300 font-medium">
                            Selected {selectedAudiences.length} audience(s) with{' '}
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                              {currentEmails.length}
                            </span>{' '}
                            final recipients
                            {excludedEmails.size > 0 && (
                              <span className="text-sm text-amber-700 dark:text-amber-400 ml-2">
                                ({excludedEmails.size} excluded)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Management Section - Always Show When Audiences Selected */}
                  {selectedAudiences.length > 0 && (
                    <div className="space-y-6">
                      {/* Email List Textarea - Similar to Manual Entry */}
                      <div>
                        <label htmlFor="selectedEmails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Selected Email Addresses ({currentEmails.length} recipients)
                        </label>
                        <textarea 
                          id="selectedEmails" 
                          value={currentEmails.join(', ')} 
                          readOnly
                          rows={6} 
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm" 
                          placeholder="No emails selected yet..."
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            These are the final email addresses that will receive your survey.
                            {excludedEmails.size > 0 && (
                              <span className="text-amber-600 dark:text-amber-500 ml-1">
                                ({excludedEmails.size} excluded from original selection)
                              </span>
                            )}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(currentEmails.join(', '));
                              setStatus('Email addresses copied to clipboard!');
                              setTimeout(() => setStatus(''), 3000);
                            }}
                            className="text-sm px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                          >
                            📋 Copy List
                          </button>
                        </div>
                      </div>
                      
                      {/* Detailed Email Management */}
                    <div className="border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 bg-emerald-50/30 dark:bg-emerald-900/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.94a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Recipients Management
                        </h4>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(currentEmails.join('\n'));
                              setStatus('Final email list copied to clipboard!');
                              setTimeout(() => setStatus(''), 3000);
                            }}
                            className="text-sm px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                          >
                            📋 Copy Final List ({currentEmails.length})
                          </button>
                          {excludedEmails.size > 0 && (
                            <button
                              type="button"
                              onClick={() => setExcludedEmails(new Set())}
                              className="text-sm px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                            >
                              ↩️ Include All
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{getAllEmails().length}</div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">Total Available</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-700">
                          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{currentEmails.length}</div>
                          <div className="text-sm text-emerald-700 dark:text-emerald-300">Will Receive Survey</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{excludedEmails.size}</div>
                          <div className="text-sm text-amber-700 dark:text-amber-300">Excluded</div>
                        </div>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto border border-emerald-200 dark:border-emerald-600 rounded-lg bg-white dark:bg-gray-800 p-4">
                        <div className="grid grid-cols-1 gap-1">
                          {getAllEmails().map((email, index) => {
                            const isExcluded = excludedEmails.has(email);
                            return (
                              <div 
                                key={index} 
                                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-mono transition-all duration-200 ${
                                  isExcluded 
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 opacity-60' 
                                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                                }`}
                              >
                                <span className="break-all">{email}</span>
                                <button
                                  type="button"
                                  onClick={() => handleEmailToggle(email)}
                                  className={`ml-3 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                                    isExcluded
                                      ? 'bg-green-600 hover:bg-green-700 text-white'
                                      : 'bg-red-600 hover:bg-red-700 text-white'
                                  }`}
                                >
                                  {isExcluded ? '✓ Include' : '✗ Exclude'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                        <p className="flex items-center gap-2">
                          <span>✉️</span>
                          <span>
                            <strong>{currentEmails.length} email addresses</strong> will receive your survey invitation.
                            {excludedEmails.size > 0 && <span className="text-amber-600 dark:text-amber-400"> ({excludedEmails.size} excluded from original list)</span>}
                          </span>
                        </p>
                        {emailInputMethod === 'audience' && selectedAudiences.length > 0 && (
                          <p className="flex items-start gap-2">
                            <span className="mt-0.5">📊</span>
                            <span>
                              <strong>Source audiences:</strong><br/>
                              {selectedAudiences.map(id => {
                                const audience = mockTargetAudiences.find(a => a.id === id);
                                if (!audience) return '';
                                const audienceEmails = audience.emails.filter(email => !excludedEmails.has(email));
                                return `• ${audience.name}: ${audienceEmails.length}/${audience.count} recipients`;
                              }).filter(Boolean).join('\n')}
                            </span>
                          </p>
                        )}
                        <p className="flex items-center gap-2 text-xs">
                          <span>💡</span>
                          <span>Click "✗ Exclude" to remove specific email addresses. Use "✓ Include" to add them back.</span>
                        </p>
                        <p className="flex items-center gap-2 text-xs">
                          <span>📋</span>
                          <span>"Copy Final List" exports only the emails that will actually receive the survey.</span>
                        </p>
                      </div>
                    </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Force Call Reminder Mode Toggle for Testing */}
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          🧪 Enable Call Reminder Testing Mode
                        </h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                          Toggle this to test the paired email-phone input feature
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForceCallReminderMode(!forceCallReminderMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          forceCallReminderMode ? 'bg-yellow-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          forceCallReminderMode ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                  
                  {(callReminderEnabled || forceCallReminderMode) ? (
                    /* Paired Email-Phone Input for Call Reminders */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            📧📞 Email & Phone Pairs
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Each recipient needs both email and phone number for call reminders
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addRecipient}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Recipient
                        </button>
                      </div>
                      
                      {recipients.map((recipient, index) => (
                        <div key={recipient.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              Recipient {index + 1}
                            </h5>
                            {recipients.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeRecipient(recipient.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                📧 Email Address
                              </label>
                              <input
                                type="email"
                                value={recipient.email}
                                onChange={(e) => updateRecipient(recipient.id, 'email', e.target.value)}
                                placeholder="your.email@example.com"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                📞 Phone Number
                              </label>
                              <input
                                type="tel"
                                value={recipient.phone}
                                onChange={(e) => updateRecipient(recipient.id, 'phone', formatPhoneNumber(e.target.value))}
                                placeholder="+12345564423"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                          🧪 Testing Setup
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          <strong>For testing:</strong> Add your email twice with different phone numbers (one real, one fake).
                          After sending, respond to one email to simulate a responder - the other will trigger a call.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Traditional comma-separated input when no call reminders */
                    <div>
                      <label htmlFor="studentEmails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Email Addresses (comma-separated)
                      </label>
                      <textarea 
                        id="studentEmails" 
                        value={studentEmails} 
                        onChange={(e) => setStudentEmails(e.target.value)} 
                        required={emailInputMethod === 'manual' && !callReminderEnabled} 
                        rows={4} 
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none" 
                        placeholder="email1@example.com, email2@example.com, ..."
                      />
                    </div>
                  )}
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

            {/* Reminder Status Display */}
            {selectedSurvey && selectedSurvey.auto_send_reminders && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Automatic Reminders Enabled
                </h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-medium text-emerald-900 dark:text-emerald-300">
                        Reminders will be sent automatically
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        When you send this survey, reminders will be automatically scheduled and sent according to the calculated dates.
                      </p>
                    </div>
                  </div>
                </div>
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
              <div className="flex-1">
                {status && (
                  <p className={`text-sm ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {status}
                  </p>
                )}
                
                {/* Call Reminder Test Button */}
                {sentSurveyId && (callReminderEnabled || forceCallReminderMode) && (
                  <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                    <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">
                      🧪 Test Call Reminders
                    </h4>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mb-3">
                      Manually trigger call reminders for testing. This will call all phone numbers immediately (simulating non-responders).
                    </p>
                    <button
                      type="button"
                      onClick={handleTriggerCallReminders}
                      disabled={triggeringCalls}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {triggeringCalls ? 'Triggering Calls...' : 'Trigger Test Calls Now'}
                    </button>
                  </div>
                )}
              </div>
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
                  disabled={isSending || !selectedSurvey || (emailInputMethod === 'audience' && selectedAudiences.length === 0) || (emailInputMethod === 'manual' && getCurrentEmails().length === 0)} 
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