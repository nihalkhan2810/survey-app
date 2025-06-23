'use client';

import { motion } from 'framer-motion';
import { 
  Globe,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  Phone,
  Database,
  Shield,
  Activity,
  Plus
} from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import existing integration components
const SalesforceIntegration = dynamic(
  () => import('@/components/admin/SalesforceIntegration'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading Salesforce integration...</p>
      </div>
    )
  }
);

const VapiSettings = dynamic(
  () => import('@/components/admin/VapiSettings').then(mod => ({ default: mod.VapiSettings })),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading VAPI settings...</p>
      </div>
    )
  }
);

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'crm' | 'communication' | 'ai-providers'>('overview');

  const aiProviders = [
    {
      id: 'gemini',
      name: 'Google Gemini 1.5 Flash',
      description: 'Default AI provider for question generation and analysis',
      icon: Zap,
      status: 'connected',
      isDefault: true,
      config: { model: 'gemini-1.5-flash', temperature: 0.7 }
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4',
      description: 'Advanced language model for survey analysis',
      icon: Activity,
      status: 'disconnected',
      isDefault: false
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Constitutional AI for safe and helpful responses',
      icon: Shield,
      status: 'disconnected',
      isDefault: false
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Globe },
    { id: 'crm', name: 'CRM Systems', icon: Database },
    { id: 'communication', name: 'Voice & Communication', icon: Phone },
    { id: 'ai-providers', name: 'AI Providers', icon: Zap }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'disconnected':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Globe className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">External Integrations</h1>
            <p className="text-teal-100 mt-1">
              Connect with external services to enhance your survey platform
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">CRM Systems</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-200">1 connected</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">Salesforce CRM integration for contact management</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Phone className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100">Communication</h3>
                      <p className="text-sm text-green-700 dark:text-green-200">1 connected</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">VAPI voice integration for survey collection</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Providers</h3>
                      <p className="text-sm text-purple-700 dark:text-purple-200">1 connected</p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-800 dark:text-purple-200">Gemini 1.5 Flash for AI-powered features</p>
                </div>
              </div>
            </div>
          )}

          {/* CRM Tab */}
          {activeTab === 'crm' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">CRM Systems</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Manage customer relationship management integrations
                </p>
              </div>
              <SalesforceIntegration />
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Voice & Communication</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure voice survey and communication settings
                </p>
              </div>
              <VapiSettings />
            </div>
          )}

          {/* AI Providers Tab */}
          {activeTab === 'ai-providers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Providers</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure AI models for question generation and analysis
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {aiProviders.map((provider) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <provider.icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                            {provider.isDefault && (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                Default
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(provider.status)}`}>
                              {provider.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{provider.description}</p>
                          
                          {provider.config && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(provider.config).map(([key, value]) => (
                                <span key={key} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                          <Settings className="h-4 w-4" />
                          Configure
                        </button>
                        {!provider.isDefault && (
                          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Provider Button */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Add AI Provider</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Connect additional AI providers for enhanced capabilities</p>
                <button className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors mx-auto">
                  <Plus className="h-4 w-4" />
                  Add Provider
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Setup Guide */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Integration Overview</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>• Salesforce CRM integration for contact and lead management</p>
                <p>• VAPI voice integration for AI-powered survey collection</p>
                <p>• AI providers for intelligent question generation and analysis</p>
                <p>• All integrations are monitored for health and performance</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}