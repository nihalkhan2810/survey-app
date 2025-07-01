'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { SentimentAnalysis } from '@/components/analytics/SentimentAnalysis';
import { RecentResponses } from '@/components/analytics/RecentResponses';
import { OpinionOverview } from '@/components/analytics/OpinionOverview';
import { TopProfessors } from '@/components/analytics/TopProfessors';
import { DepartmentAnalytics } from '@/components/analytics/DepartmentAnalytics';
import { ProfessorDetailModal } from '@/components/analytics/ProfessorDetailModal';
import { UniversalTopEntities } from '@/components/analytics/UniversalTopEntities';
import { UniversalEntityModal } from '@/components/analytics/UniversalEntityModal';
import { TrendingUp, TrendingDown, Activity, Users, MessageSquare, Phone, GraduationCap, Building2 } from 'lucide-react';
import { getUniversitySentimentAnalysis, ProfessorStats, departmentStats } from '@/lib/university-demo-data';
import { getCurrentIndustryConfig, getIndustryMetrics } from '@/lib/industry-config';
import { getUniversalSentimentAnalysis, UniversalEntityStats } from '@/lib/universal-analytics';

export default function AnalyticsPage() {
  const [selectedProfessor, setSelectedProfessor] = useState<ProfessorStats | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<UniversalEntityStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUniversalModalOpen, setIsUniversalModalOpen] = useState(false);
  const [industryConfig, setIndustryConfig] = useState(getCurrentIndustryConfig());
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Load analysis data
  useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true);
      try {
        if (industryConfig.id === 'education') {
          setAnalysis(getUniversitySentimentAnalysis());
        } else {
          const universalAnalysis = await getUniversalSentimentAnalysis();
          setAnalysis(universalAnalysis);
        }
      } catch (error) {
        console.error('Failed to load analysis:', error);
        // Fallback to university analysis
        setAnalysis(getUniversitySentimentAnalysis());
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [industryConfig]);

  // Update industry config when component mounts or localStorage changes
  useEffect(() => {
    const updateConfig = () => {
      setIndustryConfig(getCurrentIndustryConfig());
    };
    
    updateConfig();
    
    // Listen for storage changes (when industry is changed in admin)
    window.addEventListener('storage', updateConfig);
    return () => window.removeEventListener('storage', updateConfig);
  }, []);

  const handleProfessorClick = (professor: ProfessorStats) => {
    setSelectedProfessor(professor);
    setIsModalOpen(true);
  };

  const handleEntityClick = (entity: UniversalEntityStats) => {
    setSelectedEntity(entity);
    setIsUniversalModalOpen(true);
  };

  const handleDepartmentClick = (department: typeof departmentStats[0]) => {
    console.log('Department clicked:', department);
  };

  // Render industry-specific analytics component
  const renderIndustryAnalytics = () => {
    if (industryConfig.id === 'education') {
      return <TopProfessors onProfessorClick={handleProfessorClick} />;
    } else {
      return <UniversalTopEntities onEntityClick={handleEntityClick} />;
    }
  };

  // Render department analytics only for education
  const renderDepartmentAnalytics = () => {
    if (industryConfig.id === 'education') {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DepartmentAnalytics onDepartmentClick={handleDepartmentClick} />
        </motion.div>
      );
    }
    return null;
  };

  // Industry-adaptive stats
  const getStatsForIndustry = () => {
    const baseStats = [
      {
        title: 'Total Responses',
        value: analysis.totalResponses.toString(),
        change: '+12.5%',
        trend: 'up',
        icon: Activity,
        gradient: 'from-blue-500 to-cyan-500',
      }
    ];

    switch (industryConfig.id) {
      case 'education':
        return [
          ...baseStats,
          {
            title: 'Active Professors',
            value: '24',
            change: '+2',
            trend: 'up',
            icon: GraduationCap,
            gradient: 'from-emerald-500 to-teal-500',
          },
          {
            title: 'Departments',
            value: departmentStats.length.toString(),
            change: '0',
            trend: 'up',
            icon: Building2,
            gradient: 'from-purple-500 to-indigo-500',
          }
        ];
      case 'employee':
        return [
          ...baseStats,
          {
            title: 'Active Employees',
            value: '156',
            change: '+8',
            trend: 'up',
            icon: Users,
            gradient: 'from-emerald-500 to-teal-500',
          },
          {
            title: 'Departments',
            value: '12',
            change: '+1',
            trend: 'up',
            icon: Building2,
            gradient: 'from-purple-500 to-indigo-500',
          }
        ];
      case 'customer':
        return [
          ...baseStats,
          {
            title: 'Active Customers',
            value: '2,341',
            change: '+156',
            trend: 'up',
            icon: Users,
            gradient: 'from-emerald-500 to-teal-500',
          },
          {
            title: 'Product Categories',
            value: '8',
            change: '0',
            trend: 'up',
            icon: Building2,
            gradient: 'from-purple-500 to-indigo-500',
          }
        ];
      case 'community':
        return [
          ...baseStats,
          {
            title: 'Community Issues',
            value: '18',
            change: '+3',
            trend: 'up',
            icon: Users,
            gradient: 'from-emerald-500 to-teal-500',
          },
          {
            title: 'Active Districts',
            value: '5',
            change: '0',
            trend: 'up',
            icon: Building2,
            gradient: 'from-purple-500 to-indigo-500',
          }
        ];
      case 'public':
        return [
          ...baseStats,
          {
            title: 'Active Polls',
            value: '12',
            change: '+2',
            trend: 'up',
            icon: Users,
            gradient: 'from-emerald-500 to-teal-500',
          },
          {
            title: 'Policy Categories',
            value: '7',
            change: '+1',
            trend: 'up',
            icon: Building2,
            gradient: 'from-purple-500 to-indigo-500',
          }
        ];
      case 'event':
        return [
          ...baseStats,
          {
            title: 'Active Events',
            value: '9',
            change: '+1',
            trend: 'up',
            icon: Users,
            gradient: 'from-emerald-500 to-teal-500',
          },
          {
            title: 'Event Types',
            value: '4',
            change: '0',
            trend: 'up',
            icon: Building2,
            gradient: 'from-purple-500 to-indigo-500',
          }
        ];
      case 'healthcare':
        return [
          ...baseStats,
          {
            title: 'Healthcare Providers',
            value: '47',
            change: '+3',
            trend: 'up',
            icon: Users,
            gradient: 'from-emerald-500 to-teal-500',
          },
          {
            title: 'Specialties',
            value: '12',
            change: '+1',
            trend: 'up',
            icon: Building2,
            gradient: 'from-purple-500 to-indigo-500',
          }
        ];
      default:
        return [
          ...baseStats,
          {
            title: 'Active Participants',
            value: '234',
            change: '+12',
            trend: 'up',
            icon: Users,
            gradient: 'from-emerald-500 to-teal-500',
          },
          {
            title: 'Categories',
            value: '6',
            change: '0',
            trend: 'up',
            icon: Building2,
            gradient: 'from-purple-500 to-indigo-500',
          }
        ];
    }
  };

  // Show loading state
  if (loading || !analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = [
    ...getStatsForIndustry(),
    {
      title: 'Avg. Rating',
      value: `${analysis.averageSatisfaction}/10`,
      change: '+0.3',
      trend: 'up',
      icon: Users,
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Comprehensive Evaluations & Real-Time Performance Insights for Smarter Decision-Making
            </p>
          </div>
          <div className="hidden md:block">
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {industryConfig.name}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className={`absolute -right-8 -bottom-8 h-24 w-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
          </motion.div>
        ))}
      </div>

      {/* Industry-Specific Analytics Section */}
      <div className={`grid gap-6 mb-8 ${industryConfig.id === 'education' ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1'}`}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={industryConfig.id === 'education' ? 'xl:col-span-2' : ''}
        >
          {renderIndustryAnalytics()}
        </motion.div>

        {renderDepartmentAnalytics()}
      </div>

      {/* Sentiment & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SentimentAnalysis />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <OpinionOverview />
        </motion.div>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Rating Trends Over Time
          </h3>
          <AnalyticsChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <RecentResponses />
        </motion.div>
      </div>

      {/* Professor Detail Modal - Education Only */}
      <ProfessorDetailModal
        professor={selectedProfessor}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProfessor(null);
        }}
      />

      {/* Universal Entity Modal - All Other Industries */}
      <UniversalEntityModal
        entity={selectedEntity}
        isOpen={isUniversalModalOpen}
        onClose={() => {
          setIsUniversalModalOpen(false);
          setSelectedEntity(null);
        }}
      />
    </>
  );
} 