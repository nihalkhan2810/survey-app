'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingUp, MapPin, ChevronRight, Users, Clock, Zap, AlertOctagon } from 'lucide-react';

interface CivicInitiative {
  initiative: string;
  district: string;
  impactScore: number;
  communitySupport: number;
  budget: number;
  timeline: string;
  participantCount: number;
  statusHealth: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical';
  progressPercentage: number;
  leadOfficer: string;
}

interface CommunityAnalyticsProps {
  onInitiativeClick?: (initiative: CivicInitiative) => void;
}

const civicInitiatives: CivicInitiative[] = [
  {
    initiative: 'Smart City Infrastructure Hub',
    district: 'Tech Corridor',
    impactScore: 94.7,
    communitySupport: 87.3,
    budget: 2840000,
    timeline: 'Q4 2024',
    participantCount: 15600,
    statusHealth: 'Excellent',
    progressPercentage: 78,
    leadOfficer: 'Dr. Maria Santos'
  },
  {
    initiative: 'Green Energy Transformation',
    district: 'Riverside Commons',
    impactScore: 89.2,
    communitySupport: 92.1,
    budget: 4200000,
    timeline: 'Q2 2025',
    participantCount: 23400,
    statusHealth: 'Good',
    progressPercentage: 65,
    leadOfficer: 'James Mitchell'
  },
  {
    initiative: 'Community Safety Network',
    district: 'Downtown Core',
    impactScore: 91.8,
    communitySupport: 84.6,
    budget: 1650000,
    timeline: 'Q3 2024',
    participantCount: 8900,
    statusHealth: 'Good',
    progressPercentage: 82,
    leadOfficer: 'Chief Angela Rodriguez'
  },
  {
    initiative: 'Youth Innovation Labs',
    district: 'Education District',
    impactScore: 86.4,
    communitySupport: 95.7,
    budget: 980000,
    timeline: 'Q1 2025',
    participantCount: 4200,
    statusHealth: 'Needs Attention',
    progressPercentage: 45,
    leadOfficer: 'Prof. David Kim'
  },
  {
    initiative: 'Affordable Housing Coalition',
    district: 'Northside Village',
    impactScore: 88.9,
    communitySupport: 78.2,
    budget: 8500000,
    timeline: 'Q4 2025',
    participantCount: 12800,
    statusHealth: 'Critical',
    progressPercentage: 32,
    leadOfficer: 'Sarah Thompson'
  }
];

export function CommunityAnalytics({ onInitiativeClick }: CommunityAnalyticsProps) {
  const getImpactColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (score >= 85) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (score >= 80) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Excellent': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700';
      case 'Good': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'Needs Attention': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      default: return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'Excellent': return Shield;
      case 'Good': return Zap;
      case 'Needs Attention': return Clock;
      default: return AlertOctagon;
    }
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  };

  const topInitiatives = [...civicInitiatives]
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">High-Impact Civic Initiatives</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Community transformation & engagement metrics</p>
        </div>
      </div>

      <div className="space-y-4">
        {topInitiatives.map((initiative, index) => {
          const HealthIcon = getHealthIcon(initiative.statusHealth);
          
          return (
            <motion.div
              key={initiative.initiative}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.12 }}
              onClick={() => onInitiativeClick?.(initiative)}
              className="group relative overflow-hidden p-5 bg-gradient-to-r from-gray-50 to-gray-100/60 dark:from-gray-700/60 dark:to-gray-600/40 rounded-xl border border-gray-200/70 dark:border-gray-600/50 hover:border-emerald-200 dark:hover:border-emerald-700/50 transition-all cursor-pointer hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl text-lg font-bold shadow-lg">
                      #{index + 1}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Shield className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{initiative.initiative}</h4>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getHealthColor(initiative.statusHealth)}`}>
                        <HealthIcon className="h-3 w-3" />
                        {initiative.statusHealth}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{initiative.district}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{initiative.participantCount.toLocaleString()} engaged</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Target: {initiative.timeline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{formatBudget(initiative.budget)} budget</span>
                      </div>
                    </div>

                    {/* Progress Visualization */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progress: {initiative.progressPercentage}%
                        </span>
                        <span className="text-sm text-gray-500">
                          Lead: {initiative.leadOfficer}
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${initiative.progressPercentage}%` }}
                          transition={{ delay: index * 0.3, duration: 1.5, ease: "easeOut" }}
                          className="h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm ${getImpactColor(initiative.impactScore)}`}>
                    <Zap className="h-4 w-4" />
                    {initiative.impactScore.toFixed(1)}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">{initiative.communitySupport.toFixed(1)}%</span> support
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all mt-2 ml-auto" />
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-full group-hover:scale-110 transition-transform" />
              <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-gradient-to-br from-emerald-400/5 to-teal-500/5 rounded-full group-hover:scale-110 transition-transform" />
            </motion.div>
          );
        })}
      </div>

      {/* Civic Health Dashboard */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/60 dark:border-emerald-700/50 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {(civicInitiatives.reduce((sum, init) => sum + init.impactScore, 0) / civicInitiatives.length).toFixed(1)}
              </p>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Avg Impact Score</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/60 dark:border-blue-700/50 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {(civicInitiatives.reduce((sum, init) => sum + init.participantCount, 0) / 1000).toFixed(0)}K
              </p>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Total Participants</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/60 dark:border-purple-700/50 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {civicInitiatives.filter(init => init.statusHealth === 'Excellent' || init.statusHealth === 'Good').length}
              </p>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Healthy Projects</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}