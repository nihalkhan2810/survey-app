'use client';

import { useState } from 'react';
import { X, Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface VapiCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyData: {
    id: string;
    topic: string;
    questions: Array<{ text: string }>;
  };
}

export default function VapiCallModal({ isOpen, onClose, surveyData }: VapiCallModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'creating-assistant' | 'calling' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [assistantId, setAssistantId] = useState('');

  if (!isOpen) return null;

  const handleCall = async () => {
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    setCallStatus('creating-assistant');
    setErrorMessage('');

    try {
      // Step 1: Create VAPI assistant for this survey
      const assistantResponse = await fetch('/api/surveys/vapi-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: surveyData.id,
          surveyData: {
            topic: surveyData.topic,
            questions: surveyData.questions
          }
        })
      });

      if (!assistantResponse.ok) {
        const errorData = await assistantResponse.json();
        throw new Error(errorData.details || 'Failed to create survey assistant');
      }

      const { assistantId } = await assistantResponse.json();
      setAssistantId(assistantId);
      setCallStatus('calling');

      // Step 2: Make the call using VAPI
      const callResponse = await fetch('/api/surveys/vapi-assistant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId,
          phoneNumber: phoneNumber.trim(),
          surveyId: surveyData.id
        })
      });

      if (!callResponse.ok) {
        const errorData = await callResponse.json();
        throw new Error(errorData.details || 'Failed to initiate call');
      }

      setCallStatus('success');
      
    } catch (error: any) {
      console.error('Call failed:', error);
      setErrorMessage(error.message || 'Failed to make call');
      setCallStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (callStatus) {
      case 'creating-assistant':
        return 'Creating AI assistant for your survey...';
      case 'calling':
        return 'Calling participant...';
      case 'success':
        return 'Call initiated successfully! The participant will receive the call shortly.';
      case 'error':
        return errorMessage;
      default:
        return '';
    }
  };

  const resetModal = () => {
    setPhoneNumber('');
    setCallStatus('idle');
    setErrorMessage('');
    setAssistantId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Make Survey Call with VAPI
          </h3>
          <button
            onClick={resetModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Survey: <span className="font-medium">{surveyData.topic}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {surveyData.questions.length} questions will be asked
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Participant Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            disabled={isLoading}
          />
        </div>

        {/* Status Message */}
        {callStatus !== 'idle' && (
          <div className={`mb-4 p-3 rounded-md flex items-center ${
            callStatus === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
              : callStatus === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
          }`}>
            {callStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : callStatus === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <div className="w-5 h-5 mr-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              </div>
            )}
            <span className="text-sm">{getStatusMessage()}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={resetModal}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            {callStatus === 'success' ? 'Close' : 'Cancel'}
          </button>
          
          {callStatus !== 'success' && (
            <button
              onClick={handleCall}
              disabled={isLoading || !phoneNumber.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Make Call
                </>
              )}
            </button>
          )}
        </div>

        {assistantId && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Assistant ID: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{assistantId}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 