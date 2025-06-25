'use client';

import { useState, useEffect } from 'react';
import { Phone, Play, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface CallReminderConfig {
  enabled: boolean;
  phoneNumber: string;
  testMode: boolean;
}

interface CallReminderToggleProps {
  surveyTopic: string;
  surveyId?: string;
  onConfigChange: (config: CallReminderConfig) => void;
  initialConfig?: CallReminderConfig;
}

export function CallReminderToggle({ 
  surveyTopic, 
  surveyId, 
  onConfigChange, 
  initialConfig 
}: CallReminderToggleProps) {
  const [enabled, setEnabled] = useState(initialConfig?.enabled || false);
  const [phoneNumber, setPhoneNumber] = useState(initialConfig?.phoneNumber || '');
  const [testMode] = useState(true); // Always true for this implementation
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<'success' | 'error' | null>(null);

  // Update parent component when config changes
  useEffect(() => {
    onConfigChange({
      enabled,
      phoneNumber,
      testMode
    });
  }, [enabled, phoneNumber, testMode, onConfigChange]);

  const handleSimulateVoiceReminder = async () => {
    if (!surveyId || !phoneNumber) {
      setSimulationStatus('Error: Survey ID and phone number are required for simulation');
      setSimulationResult('error');
      return;
    }

    setIsSimulating(true);
    setSimulationStatus('Initializing call reminder simulation...');
    setSimulationResult(null);

    try {
      // Create a test survey and schedule call reminder
      const response = await fetch('/api/test-call-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId,
          phoneNumber,
          surveyTopic,
          testMode: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start simulation');
      }

      const result = await response.json();
      setSimulationStatus(result.message || 'Call reminder simulation started successfully');
      setSimulationResult('success');
      
      // Show additional timeline information
      if (result.timeline) {
        setSimulationStatus(prev => `${prev}\n\nSimulation Timeline:\n${result.timeline}`);
      }
    } catch (error) {
      console.error('Simulation error:', error);
      setSimulationStatus(`Simulation failed: ${error.message}`);
      setSimulationResult('error');
    } finally {
      setIsSimulating(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as +1 (XXX) XXX-XXXX for US numbers
    if (phoneNumber.length >= 10) {
      const areaCode = phoneNumber.slice(-10, -7);
      const first3 = phoneNumber.slice(-7, -4);
      const last4 = phoneNumber.slice(-4);
      return `+1 (${areaCode}) ${first3}-${last4}`;
    }
    
    return phoneNumber;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
          <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300">
            Final Call Reminder (via VAPI)
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-400">
            Trigger voice call if participant hasn't responded after final email reminder
          </p>
        </div>
      </div>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-600 mb-4">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Enable Final Call Reminder
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Voice call will be triggered immediately when non-responders are detected
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-orange-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {enabled && (
        <div className="space-y-4">
          {/* Phone Number Input */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-600">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Phone Number (For Testing)
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Phone numbers will be mapped to email recipients on the send survey page. Format: +1 (XXX) XXX-XXXX
            </p>
          </div>

          {/* Configuration Note */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Call Reminder Configuration
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Calls will be triggered immediately when non-responders are detected after sending emails. 
                You'll be able to map phone numbers to email recipients on the send survey page.
              </p>
            </div>
          </div>

          {/* Simulation Preview */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-600">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Clock className="h-4 w-4 inline mr-2" />
              Call Reminder Preview
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Survey Topic: <span className="font-medium text-gray-900 dark:text-white">"{surveyTopic}"</span></p>
              <p>• Your Phone: <span className="font-medium text-gray-900 dark:text-white">{phoneNumber || 'Not set'}</span></p>
              <p>• Trigger Condition: <span className="font-medium text-gray-900 dark:text-white">Immediate when non-responder detected</span></p>
              <p>• Configuration: <span className="font-medium text-gray-900 dark:text-white">Will be completed on send survey page</span></p>
            </div>
          </div>

          {/* Setup Complete */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✓ Call reminder configuration will be saved with survey. Complete setup on the send survey page.
            </p>
          </div>

          {/* Implementation Note */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Implementation Note:</strong> This feature schedules voice calls using VAPI only for participants who haven't responded 
              by the final email reminder. In production, this would integrate with a proper job scheduler 
              (like AWS EventBridge, node-cron, or Redis Queue) for reliable scheduling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}