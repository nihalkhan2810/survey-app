'use client';

import { motion } from 'framer-motion';
import { 
  Database,
  Activity,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  BarChart3,
  Clock,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the existing DatabaseStatus component
const DatabaseStatus = dynamic(
  () => import('@/components/dashboard/DatabaseStatus'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading database status...</p>
      </div>
    )
  }
);

interface DatabaseMetric {
  name: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
}

interface BackupInfo {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'failed' | 'in_progress';
}

export default function DatabaseManagementPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'backups' | 'maintenance'>('overview');
  const [isBackingUp, setIsBackingUp] = useState(false);

  const metrics: DatabaseMetric[] = [
    {
      name: 'Total Records',
      value: '45,230',
      change: '+12% this month',
      positive: true,
      icon: Database
    },
    {
      name: 'Storage Used',
      value: '2.3 GB',
      change: '+5% this week',
      positive: true,
      icon: HardDrive
    },
    {
      name: 'Query Response',
      value: '45ms',
      change: '-8% faster',
      positive: true,
      icon: Zap
    },
    {
      name: 'Uptime',
      value: '99.98%',
      change: 'Excellent',
      positive: true,
      icon: Activity
    }
  ];

  const backups: BackupInfo[] = [
    {
      id: '1',
      name: 'Daily Backup - 2024-01-20',
      size: '234 MB',
      date: '2024-01-20 02:00:00',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Manual Backup - Pre-deployment',
      size: '231 MB',
      date: '2024-01-19 14:30:00',
      type: 'manual',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Daily Backup - 2024-01-19',
      size: '229 MB',
      date: '2024-01-19 02:00:00',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '4',
      name: 'Daily Backup - 2024-01-18',
      size: '227 MB',
      date: '2024-01-18 02:00:00',
      type: 'automatic',
      status: 'failed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsBackingUp(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Database className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Database Management</h1>
            <p className="text-green-100 mt-1">
              Monitor database health, manage backups, and perform maintenance
            </p>
          </div>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                <p className={`text-sm flex items-center gap-1 ${
                  metric.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <metric.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'backups', name: 'Backups', icon: HardDrive },
              { id: 'maintenance', name: 'Maintenance', icon: Server }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
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
              <DatabaseStatus />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Connection Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Primary Database</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Connected</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Backup Database</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Synced</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cache Layer</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Query Time</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">45ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Connections</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">12/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                      <span className="text-sm font-medium text-green-600">94.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database Backups</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage database backups and recovery points
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBackup}
                    disabled={isBackingUp}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isBackingUp ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {backups.map((backup) => (
                  <motion.div
                    key={backup.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(backup.status)}
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{backup.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{backup.size}</span>
                            <span>{backup.date}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              backup.type === 'automatic' 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}>
                              {backup.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                          {backup.status}
                        </span>
                        {backup.status === 'completed' && (
                          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database Maintenance</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Perform routine maintenance tasks and optimizations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Routine Tasks</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Optimize Tables</span>
                      <RefreshCw className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Clear Old Logs</span>
                      <RefreshCw className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Update Statistics</span>
                      <RefreshCw className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Maintenance Schedule</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Next backup</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Tonight 2:00 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Table optimization</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Weekly (Sunday)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Index rebuild</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Monthly</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}