'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCogIcon, 
  Database, 
  Users, 
  Settings, 
  Shield, 
  BarChart3, 
  Zap, 
  Server,
  Activity,
  FileText,
  Globe,
  ArrowRight,
  TrendingUp,
  Building,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { hasPermission } from '@/types/permissions';

interface QuickStatProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
}

function QuickStat({ title, value, change, positive, icon: Icon }: QuickStatProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className={`text-sm flex items-center gap-1 ${
            positive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="h-3 w-3" />
            {change}
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );
}

interface AdminSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  href: string;
  permissions?: string[];
  children?: React.ReactNode;
}

function AdminSection({ title, description, icon: Icon, color, href, children }: AdminSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-all duration-200"
    >
      <Link href={href}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${color} rounded-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </div>
          {children}
        </div>
      </Link>
    </motion.div>
  );
}

export default function AdminPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'USER';
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSurveys: 0,
    activeSurveys: 0,
    closedSurveys: 0,
    totalResponses: 0,
    responseRate: 0,
    loading: true
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [surveysRes, responsesRes, usersRes] = await Promise.all([
          fetch('/api/surveys'),
          fetch('/api/all-responses'),
          fetch('/api/users') // We'll need to create this endpoint
        ]);

        const surveys = await surveysRes.json();
        const responses = await responsesRes.json();
        let users = [];
        
        // Handle users endpoint gracefully
        if (usersRes.ok) {
          users = await usersRes.json();
        }

        const now = new Date();
        const surveysArray = Array.isArray(surveys) ? surveys : [];
        const responsesArray = Array.isArray(responses) ? responses : [];
        const usersArray = Array.isArray(users) ? users : [];

        // Calculate active vs closed surveys
        const activeSurveys = surveysArray.filter(survey => {
          if (!survey.start_date || !survey.end_date) return true; // No dates = active
          const startDate = new Date(survey.start_date);
          const endDate = new Date(survey.end_date);
          return now >= startDate && now <= endDate;
        }).length;

        const closedSurveys = surveysArray.filter(survey => {
          if (!survey.end_date) return false;
          const endDate = new Date(survey.end_date);
          return now > endDate;
        }).length;

        const responseRate = surveysArray.length > 0 
          ? Math.round((responsesArray.length / surveysArray.length) * 100) 
          : 0;

        setStats({
          totalUsers: usersArray.length,
          totalSurveys: surveysArray.length,
          activeSurveys,
          closedSurveys,
          totalResponses: responsesArray.length,
          responseRate,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <UserCogIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">
              Welcome back, {session?.user?.name || session?.user?.email}. Here's your system overview.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {stats.loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <QuickStat
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            change="+12% this month"
            positive={true}
            icon={Users}
          />
          <QuickStat
            title="Total Surveys"
            value={stats.totalSurveys.toString()}
            change={`${stats.activeSurveys} active`}
            positive={true}
            icon={FileText}
          />
          <QuickStat
            title="Active Surveys"
            value={stats.activeSurveys.toString()}
            change={`${Math.round((stats.activeSurveys / Math.max(stats.totalSurveys, 1)) * 100)}% of total`}
            positive={true}
            icon={CheckCircle}
          />
          <QuickStat
            title="Closed Surveys"
            value={stats.closedSurveys.toString()}
            change={`${Math.round((stats.closedSurveys / Math.max(stats.totalSurveys, 1)) * 100)}% of total`}
            positive={false}
            icon={XCircle}
          />
          <QuickStat
            title="Response Rate"
            value={`${stats.responseRate}%`}
            change={`${stats.totalResponses} responses`}
            positive={stats.responseRate > 50}
            icon={BarChart3}
          />
        </div>
      )}

      {/* Admin Sections */}
      <div className="space-y-8">
        {/* User Management */}
        {hasPermission(userRole, 'users.view') && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminSection
                title="Users & Permissions"
                description="Manage user accounts, roles, and permissions"
                icon={Users}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                href="/admin/users"
              />
              <AdminSection
                title="Security & Access"
                description="Configure security settings and access controls"
                icon={Shield}
                color="bg-gradient-to-r from-green-500 to-green-600"
                href="/admin/security"
              />
            </div>
          </div>
        )}

        {/* Content Management */}
        {hasPermission(userRole, 'surveys.view') && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Content Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminSection
                title="Survey Management"
                description="Create, edit, and manage all surveys"
                icon={FileText}
                color="bg-gradient-to-r from-purple-500 to-purple-600"
                href="/admin/surveys"
              />
              <AdminSection
                title="Analytics & Reports"
                description="View detailed analytics and generate reports"
                icon={BarChart3}
                color="bg-gradient-to-r from-indigo-500 to-indigo-600"
                href="/admin/analytics"
              />
            </div>
          </div>
        )}

        {/* Integrations & API */}
        {hasPermission(userRole, 'integrations.view') && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Integrations & API</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AdminSection
                title="API Management"
                description="Configure API keys and webhooks"
                icon={Zap}
                color="bg-gradient-to-r from-orange-500 to-orange-600"
                href="/admin/api"
              />
              <AdminSection
                title="External Services"
                description="Manage Salesforce, VAPI, and other integrations"
                icon={Globe}
                color="bg-gradient-to-r from-teal-500 to-teal-600"
                href="/admin/integrations"
              />
              <AdminSection
                title="Voice & Communication"
                description="Configure voice surveys and communication settings"
                icon={Activity}
                color="bg-gradient-to-r from-pink-500 to-pink-600"
                href="/admin/calls"
              />
            </div>
          </div>
        )}

        {/* System Management */}
        {hasPermission(userRole, 'system.view') && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AdminSection
                title="Industry Setup"
                description="Configure industry-specific survey categories and metrics"
                icon={Building}
                color="bg-gradient-to-r from-emerald-500 to-emerald-600"
                href="/admin/industry-setup"
              />
              <AdminSection
                title="Database & Storage"
                description="Monitor database health and manage storage"
                icon={Database}
                color="bg-gradient-to-r from-gray-500 to-gray-600"
                href="/admin/database"
              />
              <AdminSection
                title="System Settings"
                description="Configure global system settings and preferences"
                icon={Settings}
                color="bg-gradient-to-r from-slate-500 to-slate-600"
                href="/admin/system"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 