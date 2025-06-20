'use client';

import { useState, useEffect } from 'react';
import { Key, Volume2, Save, TestTube, AlertCircle, CheckCircle } from 'lucide-react';

export function VapiSettings() {
  const [apiKey, setApiKey] = useState('');
  const [voiceId, setVoiceId] = useState('assistant');
  const [customVoiceId, setCustomVoiceId] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [assistants, setAssistants] = useState<Array<{id: string, name: string, voice?: any}>>([]);
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loadingAssistants, setLoadingAssistants] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if VAPI is already configured
    checkVapiConfig();
  }, []);

  const checkVapiConfig = async () => {
    try {
      const response = await fetch('/api/admin/vapi/status');
      const data = await response.json();
      setIsConfigured(data.configured);
      if (data.configured) {
        setStatus('✅ VAPI is configured and ready');
        setVoiceId(data.voiceId || voiceId);
      }
    } catch (error) {
      console.error('Error checking VAPI config:', error);
    }
  };

  const testVapiConnection = async () => {
    if (!apiKey.trim()) {
      setStatus('Please enter your VAPI API key');
      return;
    }

    setLoadingAssistants(true);
    setStatus('Testing VAPI connection and fetching assistants...');

    try {
      const response = await fetch('/api/admin/vapi/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus(`✅ Connection successful! Found ${data.assistants?.length || 0} assistants`);
        setAssistants(data.assistants || []);
        if (data.assistants?.length > 0) {
          setSelectedAssistant(data.assistants[0].id);
        }
      } else {
        setStatus(`❌ Connection failed: ${data.message}`);
        setAssistants([]);
      }
    } catch (error) {
      setStatus('❌ Connection test failed');
      setAssistants([]);
    } finally {
      setLoadingAssistants(false);
    }
  };

  const saveVapiConfig = async () => {
    if (!apiKey.trim()) {
      setStatus('Please enter your VAPI API key');
      return;
    }

    setLoading(true);
    setStatus('Saving VAPI configuration...');

    try {
      const actualVoiceId = voiceId === 'custom' ? customVoiceId : voiceId;

      const response = await fetch('/api/admin/vapi/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey: apiKey.trim(),
          voiceId: actualVoiceId.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus('✅ VAPI configuration saved successfully!');
        setIsConfigured(true);
        setApiKey(''); // Clear the input for security
      } else {
        setStatus(`❌ Failed to save: ${data.message}`);
      }
    } catch (error) {
      setStatus('❌ Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const testVoice = async () => {
    setTesting(true);
    
    if (voiceId === 'assistant') {
      setStatus('Testing existing assistant...');
      
      try {
        const response = await fetch('/api/admin/vapi/test-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            assistantId: assistantId.trim(),
            testText: 'Hello! This is a test call using your existing VAPI assistant.'
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setStatus(`✅ Assistant test successful! Call ID: ${data.callId || 'N/A'}. Check your VAPI dashboard for the test call.`);
        } else {
          setStatus(`❌ Assistant test failed: ${data.message}`);
        }
      } catch (error) {
        setStatus('❌ Assistant test failed');
      }
    } else {
      setStatus('Testing voice synthesis...');

      try {
        const response = await fetch('/api/admin/vapi/test-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: 'Hello! This is a test of the VAPI voice system for surveys.',
            voiceId: voiceId
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setStatus(`✅ Voice test successful! Assistant ID: ${data.assistantId}. Test it in your VAPI dashboard.`);
        } else {
          setStatus(`❌ Voice test failed: ${data.message}`);
        }
      } catch (error) {
        setStatus('❌ Voice test failed');
      }
    }
    
    setTesting(false);
  };

  const talkToAssistant = () => {
    if (!selectedAssistant) {
      setStatus('Please select an assistant first');
      return;
    }
    
    // Open VAPI dashboard assistants page - the correct URL format
    const dashboardUrl = `https://dashboard.vapi.ai/assistants`;
    window.open(dashboardUrl, '_blank');
    setStatus(`✅ Opened VAPI dashboard! Find assistant "${assistants.find(a => a.id === selectedAssistant)?.name}" and click "Talk to Assistant" to test the voice!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Volume2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">VAPI Voice Configuration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure high-quality AI voice for survey calls</p>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="vapi-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Key className="h-4 w-4 inline mr-2" />
              VAPI API Key
            </label>
            <div className="flex gap-3">
              <input
                type="password"
                id="vapi-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={isConfigured ? "API key is configured" : "Enter your VAPI API key"}
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                disabled={loading || testing}
              />
              <button
                onClick={testVapiConnection}
                disabled={!apiKey.trim() || loadingAssistants}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                {loadingAssistants ? 'Loading...' : 'Test & Load'}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Get your API key from: <a href="https://dashboard.vapi.ai" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">VAPI Dashboard → Vapi API Keys</a>
            </p>
          </div>

          {/* Assistant Selection */}
          {assistants.length > 0 && (
            <div>
              <label htmlFor="assistant-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your VAPI Assistants
              </label>
              <div className="flex gap-3">
                <select
                  id="assistant-select"
                  value={selectedAssistant}
                  onChange={(e) => setSelectedAssistant(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  disabled={loading}
                >
                  {assistants.map((assistant) => (
                    <option key={assistant.id} value={assistant.id}>
                      {assistant.name} {assistant.voice ? `(${assistant.voice.provider} - ${assistant.voice.voiceId})` : '(default voice)'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={talkToAssistant}
                  disabled={!selectedAssistant}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Talk to Assistant
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select an assistant and click "Talk to Assistant" to test its voice in a new tab
              </p>
            </div>
          )}

          {assistants.length === 0 && !loadingAssistants && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Volume2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No assistants found. Click "Test & Load" above to fetch your assistants.</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={saveVapiConfig}
            disabled={!apiKey.trim() || loading}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>

          {/* Status Display */}
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

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Pure VAPI Implementation</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Replaces complex Twilio + Gemini + VAPI setup</li>
              <li>• VAPI handles all: calling, AI conversation, and voice synthesis</li>
              <li>• No more ngrok or audio file management needed</li>
              <li>• Much simpler and more reliable architecture</li>
            </ul>
          </div>

          {/* Setup Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">Setup Instructions</h4>
            <ol className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1 list-decimal list-inside">
              <li>Get your API key from VAPI Dashboard → Vapi API Keys</li>
              <li>Get a phone number from VAPI Dashboard → Phone Numbers</li>
              <li>Add to your .env.local:
                <div className="bg-yellow-100 dark:bg-yellow-800/30 p-2 mt-1 rounded text-xs font-mono">
                  VAPI_API_KEY=your_api_key<br/>
                  VAPI_PHONE_NUMBER_ID=your_phone_id<br/>
                  <span className="text-yellow-700 dark:text-yellow-300"># Optional: For production webhooks</span><br/>
                  VAPI_WEBHOOK_URL=https://your-domain.com/api/surveys/vapi-webhook
                </div>
              </li>
              <li>Test your setup using the buttons above</li>
            </ol>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
              <strong>Development mode:</strong> Webhooks are disabled (no HTTPS required)<br/>
              <strong>Production mode:</strong> Set VAPI_WEBHOOK_URL with HTTPS for call tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}