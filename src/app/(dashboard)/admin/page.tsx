'use client';

import { motion } from 'framer-motion';
import { UserCogIcon, Database, Users, Settings } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import SalesforceIntegration to avoid SSR issues
const SalesforceIntegration = dynamic(
  () => import('@/components/admin/SalesforceIntegration'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading Salesforce integration...</p>
      </div>
    )
  }
);

// Dynamically import DatabaseStatus
const DatabaseStatus = dynamic(
  () => import('@/components/dashboard/DatabaseStatus'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading database status...</p>
      </div>
    )
  }
);

// Dynamically import VapiSettings
const VapiSettings = dynamic(
  () => import('@/components/admin/VapiSettings').then(mod => ({ default: mod.VapiSettings })),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading VAPI settings...</p>
      </div>
    )
  }
);

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <UserCogIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage system settings, users, and integrations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Users</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manage user accounts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Database</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Import & export data</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Settings</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">System configuration</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <DatabaseStatus />
      
      <VapiSettings />
      
      <SalesforceIntegration />
    </div>
  );
} 