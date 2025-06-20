'use client';

import { useState } from 'react';
import { Clock, Send, Bot, Edit3, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { generateAIReminderMessage, getSurveyUrl } from '@/lib/utils';

interface ReminderControlProps {
  surveyId: string;
  surveyTopic: string;
  reminderConfig: any[];
  autoSendEnabled: boolean;
  selectedEmails: string[];
  emailCount: number;
  onReminderSent?: () => void;
}

export function ReminderControl({ 
  surveyId, 
  surveyTopic, 
  reminderConfig, 
  autoSendEnabled,
  selectedEmails,
  emailCount,
  onReminderSent 
}: ReminderControlProps) {
  const [selectedReminderType, setSelectedReminderType] = useState<'opening' | 'midpoint' | 'closing'>('closing');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [customMessage, setCustomMessage] = useState('');

  // Get the configuration for the selected reminder type
  const currentConfig = reminderConfig.find(config => config.type === selectedReminderType);
  const surveyUrl = getSurveyUrl(surveyId);

  const handleSendReminder = async () => {
    if (selectedEmails.length === 0) {
      setStatus('Please select recipients from the main survey form first.');
      return;
    }

    if (!useAI && !customMessage.trim()) {
      setStatus('Please enter a custom message or enable AI generation.');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const response = await fetch('/api/generate-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          reminderType: selectedReminderType,
          emails: selectedEmails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reminder');
      }

      const data = await response.json();
      setStatus(`✅ Reminder sent successfully to ${data.emailsSent} recipients!`);
      onReminderSent?.();
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const previewMessage = useAI 
    ? generateAIReminderMessage(surveyTopic, surveyUrl, selectedReminderType)
    : `${customMessage}\n\n📋 Take the survey: ${surveyUrl}`;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300">
            {autoSendEnabled ? 'Manual Override' : 'Send Reminders'}
          </h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-400">
            {autoSendEnabled 
              ? 'Send additional reminders beyond automatic scheduling'
              : 'Manually send reminder emails to participants'
            }
          </p>
        </div>
      </div>

      {/* Reminder Type Selection */}
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Reminder Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['opening', 'midpoint', 'closing'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedReminderType(type as any)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedReminderType === type
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                type === 'opening' ? 'bg-green-500' :
                type === 'midpoint' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <p className="text-sm font-medium capitalize">{type}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Message Configuration */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {useAI ? (
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <Edit3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {useAI ? 'AI-Generated Message' : 'Custom Message'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {useAI 
                  ? 'Use professional AI-crafted reminder message'
                  : 'Write your own personalized message'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setUseAI(!useAI)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              useAI ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              useAI ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Custom Message Input */}
        {!useAI && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Message
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write your personalized reminder message..."
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            />
          </div>
        )}

        {/* Message Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message Preview
          </label>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
              {previewMessage}
            </pre>
          </div>
        </div>
      </div>

      {/* Email Recipients Display */}
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <Users className="h-4 w-4 inline mr-2" />
          Email Recipients ({emailCount} total)
        </label>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          {selectedEmails.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-300">
                Reminder will be sent to {emailCount} recipients
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Recipients selected from the main survey form above
              </p>
              {selectedEmails.length <= 5 && (
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {selectedEmails.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No recipients selected
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Please select target audiences or enter emails in the main form above
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Send Button */}
      <div className="space-y-4">
        <button
          onClick={handleSendReminder}
          disabled={loading || selectedEmails.length === 0 || (!useAI && !customMessage.trim())}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending Reminders...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Send {selectedReminderType} Reminder
            </>
          )}
        </button>

        {/* Status Message */}
        {status && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            status.includes('✅') 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {status.includes('✅') ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-sm font-medium ${
              status.includes('✅') 
                ? 'text-green-800 dark:text-green-300'
                : 'text-red-800 dark:text-red-300'
            }`}>
              {status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 