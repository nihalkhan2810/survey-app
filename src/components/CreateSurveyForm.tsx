'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, FileText, Copy, Send, Plus, Trash2, ArrowLeft, Calendar, Clock, MessageSquare, Bot, Edit3 } from 'lucide-react';
import { getSurveyUrl, calculateReminderDates, generateAIReminderMessage, validateReminderMessage, type ReminderConfig } from '@/lib/utils';
import { CallReminderToggle, type CallReminderConfig } from '@/components/CallReminderToggle';

type Question = {
  text: string;
  type: 'text' | 'multiple-choice' | 'single-choice' | 'rating';
  options?: string[];
  min?: number;
  max?: number;
};

type Survey = {
  id: string;
  topic: string;
  created_at?: string;
  start_date?: string;
  end_date?: string;
  reminder_dates?: string[];
  reminder_config?: any[];
  auto_send_reminders?: boolean;
};

export function CreateSurveyForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([{ text: '', type: 'text' }]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [surveyLink, setSurveyLink] = useState('');
  const [createdSurvey, setCreatedSurvey] = useState<Survey | null>(null);
  
  // Survey deadline states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Professional Reminder System states
  const [useAIReminders, setUseAIReminders] = useState(true);
  const [autoSendReminders, setAutoSendReminders] = useState(false);
  const [customReminderMessage, setCustomReminderMessage] = useState('');
  const [calculatedReminders, setCalculatedReminders] = useState<ReminderConfig[]>([]);
  const [reminderError, setReminderError] = useState('');
  
  // AI Assistant states
  const [aiSuggestions, setAiSuggestions] = useState<Question[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Call Reminder states
  const [callReminderConfig, setCallReminderConfig] = useState<CallReminderConfig>({
    enabled: false,
    phoneNumber: '',
    testMode: true
  });

  // Professional reminder calculation effect
  useEffect(() => {
    if (startDate && endDate) {
      try {
        const reminders = calculateReminderDates(startDate, endDate);
        setCalculatedReminders(reminders);
        setReminderError('');
      } catch (error) {
        setReminderError('Invalid date range selected');
        setCalculatedReminders([]);
      }
    } else {
      setCalculatedReminders([]);
      setReminderError('');
    }
  }, [startDate, endDate]);

  // Validate custom reminder message when it changes
  useEffect(() => {
    if (!useAIReminders && customReminderMessage) {
      const validation = validateReminderMessage(customReminderMessage);
      setReminderError(validation.isValid ? '' : validation.error || '');
    } else {
      setReminderError('');
    }
  }, [useAIReminders, customReminderMessage]);

  const handleGenerateQuestions = async () => {
    if (!topic) {
      setStatus('Please enter a topic to generate questions.');
      return;
    }
    setLoading(true);
    setStatus('');
    setAiSuggestions([]);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate questions.');
      }
      const data = await response.json();
      setAiSuggestions(data.questions);
      setShowSuggestions(true);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAllSuggestions = () => {
    setQuestions(aiSuggestions.filter(q => q.text.trim() !== ''));
    setShowSuggestions(false);
  };

  const handleAcceptSuggestion = (question: Question) => {
    if (question.text.trim() !== '') {
      setQuestions(prev => [...prev.filter(q => q.text.trim() !== ''), question]);
    }
  };

  const handleRejectSuggestions = () => {
    setShowSuggestions(false);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    if (field === 'type') {
      newQuestions[index].type = value;
      // Reset type-specific fields
      if (value === 'text') {
        delete newQuestions[index].options;
        delete newQuestions[index].min;
        delete newQuestions[index].max;
      } else if (value === 'multiple-choice' || value === 'single-choice') {
        newQuestions[index].options = ['Option 1'];
        delete newQuestions[index].min;
        delete newQuestions[index].max;
      } else if (value === 'rating') {
        delete newQuestions[index].options;
        newQuestions[index].min = 1;
        newQuestions[index].max = 10;
      }
    } else {
      (newQuestions[index] as any)[field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
      newQuestions[qIndex].options![oIndex] = value;
    }
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
      newQuestions[qIndex].options!.push('');
    } else {
      newQuestions[qIndex].options = [''];
    }
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options && newQuestions[qIndex].options!.length > 1) {
      newQuestions[qIndex].options = newQuestions[qIndex].options!.filter((_, index) => index !== oIndex);
    }
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', type: 'text' }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSaveSurvey = async () => {
    if (!topic.trim()) {
      setStatus('Please provide a survey topic.');
      return;
    }
    if (questions.length === 0) {
      setStatus('Please add at least one question.');
      return;
    }
    if (questions.some(q => !q.text.trim())) {
      setStatus('Please fill in all question text.');
      return;
    }
    if (!startDate || !endDate) {
      setStatus('Please provide both start and end dates for the survey.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setStatus('End date must be after start date.');
      return;
    }
    
    // Professional reminder validation
    if (autoSendReminders && !useAIReminders) {
      const validation = validateReminderMessage(customReminderMessage);
      if (!validation.isValid) {
        setStatus(`Reminder message error: ${validation.error}`);
        return;
      }
    }
    
    if (calculatedReminders.length === 0) {
      setStatus('No reminders calculated. Please check your date range.');
      return;
    }
    
    setLoading(true);
    setStatus('');

    try {
      // Prepare professional reminder data
      const reminderData = calculatedReminders.map(reminder => ({
        dates: reminder.dates,
        type: reminder.type,
        description: reminder.description,
        useAI: useAIReminders,
        autoSend: autoSendReminders,
        customMessage: useAIReminders ? null : customReminderMessage
      }));

      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          questions,
          start_date: startDate,
          end_date: endDate,
          reminder_dates: calculatedReminders.flatMap(r => r.dates),
          reminder_config: reminderData,
          call_reminder_enabled: callReminderConfig.enabled,
          call_reminder_phone: callReminderConfig.phoneNumber,
          call_reminder_test_mode: callReminderConfig.testMode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save survey.');
      }

      const data = await response.json();
      const link = getSurveyUrl(data.surveyId);
      setSurveyLink(link);
      setCreatedSurvey({
        id: data.surveyId,
        topic,
        created_at: new Date().toISOString(),
        start_date: startDate,
        end_date: endDate,
        reminder_dates: calculatedReminders.flatMap(r => r.dates),
        reminder_config: reminderData,
        auto_send_reminders: autoSendReminders
      });
      setStatus('Survey created successfully! Check your calendar to see the scheduled dates.');
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (surveyLink) {
      navigator.clipboard.writeText(surveyLink);
      setStatus('Survey link copied to clipboard!');
      setTimeout(() => setStatus('Survey created successfully!'), 2000);
    }
  };

  const handleSendSurvey = () => {
    if (createdSurvey) {
      router.push(`/surveys/send?surveyId=${createdSurvey.id}`);
    }
  };

  return (
    <>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/surveys')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Surveys
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 flex">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-xl ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            Manual Creation
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-xl ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </button>
        </div>

        {/* Basic Information Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Survey Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="surveyTopic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Survey Topic
                </label>
                <input
                  type="text"
                  id="surveyTopic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Student satisfaction with campus dining"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-black dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-black dark:text-white"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-black dark:text-white"
                    min={startDate || new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-900 dark:text-gray-400">
                Survey will be active from start date to end date. Links will expire after the end date.
              </p>
            </div>
          </div>

          {/* Smart Reminders Section */}
          {calculatedReminders.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-300">Smart Reminders</h3>
                  <p className="text-sm text-gray-900 dark:text-blue-400">Automatically calculated based on your survey duration</p>
                </div>
              </div>

              {/* Calculated Reminders Display */}
              <div className="grid gap-3 mb-6">
                {calculatedReminders.map((reminder, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-600">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      reminder.type === 'opening' ? 'bg-green-500' :
                      reminder.type === 'midpoint' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">{reminder.description}</p>
                      <p className="text-sm text-gray-900 dark:text-gray-400 truncate">
                        {reminder.dates.map(date => new Date(date).toLocaleDateString()).join(', ')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      reminder.type === 'opening' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      reminder.type === 'midpoint' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {reminder.type}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reminder Configuration */}
              <div className="space-y-4">
                {/* Enable Reminders Toggle */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-600">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Send Automatic Reminders
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-400">
                        Reminders will be sent automatically on calculated dates
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoSendReminders(!autoSendReminders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSendReminders ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoSendReminders ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {autoSendReminders && (
                  <div className="space-y-4">
                    {/* AI vs Custom Message Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-600">
                      <div className="flex items-center gap-3">
                        {useAIReminders ? (
                          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Edit3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {useAIReminders ? 'AI-Generated Messages' : 'Custom Message'}
                          </p>
                          <p className="text-sm text-gray-900 dark:text-gray-400">
                            {useAIReminders 
                              ? 'Professionally crafted reminder messages with survey links'
                              : 'Write your own personalized reminder message'
                            }
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseAIReminders(!useAIReminders)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          useAIReminders ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useAIReminders ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Custom Message Input */}
                    {!useAIReminders && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          <MessageSquare className="h-4 w-4 inline mr-2" />
                          Custom Reminder Message
                        </label>
                        <textarea
                          value={customReminderMessage}
                          onChange={(e) => setCustomReminderMessage(e.target.value)}
                          placeholder="Write your personalized reminder message. The survey link will be automatically included."
                          rows={4}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-black dark:text-white"
                        />
                        {reminderError && (
                          <p className="text-sm text-red-600 dark:text-red-400">{reminderError}</p>
                        )}
                        <p className="text-xs text-gray-900 dark:text-gray-400">
                          Message will be used for all reminder types. Survey link will be automatically appended.
                        </p>
                      </div>
                    )}

                    {/* AI Message Preview */}
                    {useAIReminders && topic && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Bot className="h-4 w-4 inline mr-2" />
                          AI Message Preview (Closing Reminder)
                        </label>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                            {generateAIReminderMessage(topic, getSurveyUrl('SURVEY_ID'), 'closing')}
                          </pre>
                        </div>
                        <p className="text-xs text-gray-900 dark:text-gray-400">
                          Different messages will be generated for opening, midpoint, and closing reminders.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Call Reminder Section */}
          {calculatedReminders.length > 0 && (
            <CallReminderToggle 
              surveyTopic={topic}
              surveyId={createdSurvey?.id}
              onConfigChange={setCallReminderConfig}
              initialConfig={callReminderConfig}
              showPhoneInput={false}
            />
          )}
        </div>

        {/* AI Assistant Mode */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-2xl p-8 border border-emerald-200 dark:border-emerald-700">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">AI Question Generator</h3>
                <p className="text-gray-900 dark:text-gray-400">Let AI create personalized questions based on your survey topic</p>
              </div>
              
              <button
                onClick={handleGenerateQuestions}
                disabled={loading || !topic.trim()}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Questions with AI
                  </>
                )}
              </button>
            </div>

            {/* AI Suggestions */}
            {showSuggestions && aiSuggestions.length > 0 && (
              <div className="space-y-6 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 dark:border-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-blue-900 dark:text-blue-300">
                      AI Generated Questions
                    </h3>
                    <p className="text-gray-900 dark:text-blue-400 mt-1">
                      Review and add the questions you'd like to use
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAcceptAllSuggestions}
                      className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={handleRejectSuggestions}
                      className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <div className="grid gap-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-600 dark:bg-gray-800">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white mb-3">{suggestion.text}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 dark:text-gray-400">
                            <span className="font-medium">Type:</span> {suggestion.type === 'multiple-choice' ? 'Multiple Choice' : suggestion.type === 'single-choice' ? 'Single Choice' : suggestion.type === 'rating' ? 'Rating Scale' : 'Text'}
                          </p>
                          {suggestion.options && (
                            <p className="text-sm text-gray-900 dark:text-gray-400">
                              <span className="font-medium">Options:</span> {suggestion.options.join(', ')}
                            </p>
                          )}
                          {suggestion.type === 'rating' && (
                            <p className="text-sm text-gray-900 dark:text-gray-400">
                              <span className="font-medium">Rating:</span> {suggestion.min || 1} to {suggestion.max || 10}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        className="flex-shrink-0 rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 transition-colors shadow-lg"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Survey Questions
              </h2>
              <p className="text-gray-900 dark:text-gray-400 mt-1">
                {questions.length} {questions.length === 1 ? 'question' : 'questions'} added
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-6">
                  <span className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 text-white font-bold rounded-xl shadow-md">
                    {qIndex + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter your question"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg text-black dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveQuestion(qIndex)}
                    disabled={questions.length <= 1}
                    className="p-3 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Question Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Answer Type
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-black dark:text-white"
                  >
                    <option value="text">Text (Open Answer)</option>
                    <option value="single-choice">Single Choice</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="rating">Rating Scale</option>
                  </select>
                </div>

                {/* Type-specific options */}
                {(question.type === 'multiple-choice' || question.type === 'single-choice') && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Options
                    </label>
                    <div className="space-y-2">
                      {question.options?.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Enter option"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-black dark:text-white"
                          />
                          <button
                            onClick={() => handleRemoveOption(qIndex, oIndex)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAddOption(qIndex)}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Option
                    </button>
                  </div>
                )}

                {question.type === 'rating' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rating Scale
                    </label>
                                          <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-900 dark:text-gray-400">Min:</label>
                        <input
                          type="number"
                          value={question.min || 1}
                          onChange={(e) => handleQuestionChange(qIndex, 'min', parseInt(e.target.value))}
                          className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-black dark:text-white"
                          min="1"
                          max="10"
                        />
                      </div>
                                              <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-900 dark:text-gray-400">Max:</label>
                        <input
                          type="number"
                          value={question.max || 10}
                          onChange={(e) => handleQuestionChange(qIndex, 'max', parseInt(e.target.value))}
                          className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-black dark:text-white"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                                          <p className="text-xs text-gray-900 dark:text-gray-400">
                        Rating from {question.min || 1} to {question.max || 10}
                      </p>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={handleAddQuestion}
              className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-gray-600 dark:text-gray-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 flex items-center justify-center gap-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
            >
              <Plus className="h-6 w-6" />
              <span className="font-medium">Add Another Question</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`p-4 rounded-xl text-sm ${status.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'}`}>
            {status}
          </div>
        )}

        {/* Success State with Link */}
        {surveyLink && (
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
            <h4 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-3">
              Survey Created Successfully!
            </h4>
            <div className="space-y-3 mb-4">
              <p className="text-green-700 dark:text-green-400">
                Your survey is ready. You can copy the link or send it directly to recipients.
              </p>
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <Calendar className="h-4 w-4" />
                <span>Survey dates automatically added to your calendar</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="text"
                readOnly
                value={surveyLink}
                className="flex-1 px-4 py-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-green-900 dark:text-green-200"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={handleCopyLink}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/calendar')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Calendar className="h-4 w-4" />
                View Calendar
              </button>
              <button
                onClick={handleSendSurvey}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Send className="h-4 w-4" />
                Send Survey
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSaveSurvey}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Survey'}
          </button>
        </div>
      </div>
    </>
  );
}