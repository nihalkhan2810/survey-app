'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Zap,
  Settings
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ApiConfig {
  geminiApiKey: string;
  vapiApiKey: string;
  vapiWebhookSecret: string;
  vapiAssistantId: string;
  vapiPhoneNumberId: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  salesforceConsumerKey: string;
  salesforceConsumerSecret: string;
  salesforceSecurityToken: string;
  salesforceLoginUrl: string;
}

interface ServiceAvailability {
  gemini: boolean;
  vapi: boolean;
  twilio: boolean;
  salesforce: boolean;
}

interface ApiConfigFormProps {
  title: string;
  description: string;
  icon: React.ElementType;
  fields: Array<{
    key: keyof ApiConfig;
    label: string;
    placeholder: string;
    type?: 'text' | 'password' | 'url';
    required?: boolean;
  }>;
  config: ApiConfig;
  onConfigChange: (key: keyof ApiConfig, value: string) => void;
  isAvailable: boolean;
}

function ApiConfigForm({ title, description, icon: Icon, fields, config, onConfigChange, isAvailable }: ApiConfigFormProps) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (fieldKey: string) => {
    setShowSecrets(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isAvailable ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <Icon className={`h-5 w-5 ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
          <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
            {isAvailable ? 'Configured' : 'Not Configured'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                value={config[field.key] || ''}
                onChange={(e) => onConfigChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
              />
              {field.type === 'password' && (
                <button
                  type="button"
                  onClick={() => toggleSecret(field.key)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ApiManagementPage() {
  const { data: session } = useSession();
  const [config, setConfig] = useState<ApiConfig>({
    geminiApiKey: '',
    vapiApiKey: '',
    vapiWebhookSecret: '',
    vapiAssistantId: '',
    vapiPhoneNumberId: '',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    salesforceConsumerKey: '',
    salesforceConsumerSecret: '',
    salesforceSecurityToken: '',
    salesforceLoginUrl: '',
  });
  const [availability, setAvailability] = useState<ServiceAvailability>({
    gemini: false,
    vapi: false,
    twilio: false,
    salesforce: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUserConfig, setHasUserConfig] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/api-config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        setAvailability(data.availability);
        setHasUserConfig(data.hasUserConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof ApiConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/api-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'API configuration saved successfully!' });
        await loadConfig(); // Reload to get updated availability
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Key className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">API Management</h1>
            <p className="text-orange-100 mt-1">Configure API keys and external service integrations</p>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      {!hasUserConfig && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Configure Your API Keys</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Currently using default environment variables. Configure your own API keys below to override the defaults and enable full functionality for your users.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        </motion.div>
      )}

      {/* API Configuration Forms */}
      <div className="space-y-6">
        {/* AI Services */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Services</h2>
          <ApiConfigForm
            title="Google Gemini AI"
            description="Configure AI-powered question generation and analysis"
            icon={Zap}
            fields={[
              { key: 'geminiApiKey', label: 'Gemini API Key', placeholder: 'AIza...', type: 'password', required: true }
            ]}
            config={config}
            onConfigChange={handleConfigChange}
            isAvailable={availability.gemini}
          />
        </div>

        {/* Voice Services */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Voice Services</h2>
          <div className="space-y-6">
            <ApiConfigForm
              title="VAPI Voice AI"
              description="Advanced AI-powered voice survey capabilities"
              icon={Zap}
              fields={[
                { key: 'vapiApiKey', label: 'VAPI API Key', placeholder: 'vapi_...', type: 'password', required: true },
                { key: 'vapiWebhookSecret', label: 'Webhook Secret', placeholder: 'webhook_secret...', type: 'password' },
                { key: 'vapiAssistantId', label: 'Assistant ID', placeholder: 'assistant_...', type: 'text' },
                { key: 'vapiPhoneNumberId', label: 'Phone Number ID', placeholder: 'phone_...', type: 'text' }
              ]}
              config={config}
              onConfigChange={handleConfigChange}
              isAvailable={availability.vapi}
            />

            <ApiConfigForm
              title="Twilio Voice & SMS"
              description="Traditional voice calls and SMS capabilities"
              icon={Key}
              fields={[
                { key: 'twilioAccountSid', label: 'Account SID', placeholder: 'AC...', type: 'password', required: true },
                { key: 'twilioAuthToken', label: 'Auth Token', placeholder: 'auth_token...', type: 'password', required: true },
                { key: 'twilioPhoneNumber', label: 'Phone Number', placeholder: '+1234567890', type: 'text', required: true }
              ]}
              config={config}
              onConfigChange={handleConfigChange}
              isAvailable={availability.twilio}
            />
          </div>
        </div>

        {/* CRM Integration */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">CRM Integration</h2>
          <ApiConfigForm
            title="Salesforce"
            description="Sync survey data with Salesforce CRM"
            icon={Settings}
            fields={[
              { key: 'salesforceConsumerKey', label: 'Consumer Key', placeholder: 'consumer_key...', type: 'password', required: true },
              { key: 'salesforceConsumerSecret', label: 'Consumer Secret', placeholder: 'consumer_secret...', type: 'password', required: true },
              { key: 'salesforceSecurityToken', label: 'Security Token', placeholder: 'security_token...', type: 'password', required: true },
              { key: 'salesforceLoginUrl', label: 'Login URL', placeholder: 'https://login.salesforce.com', type: 'url' }
            ]}
            config={config}
            onConfigChange={handleConfigChange}
            isAvailable={availability.salesforce}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Configuration'}
        </motion.button>
      </div>
    </div>
  );
}