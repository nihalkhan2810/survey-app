'use client';

import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, Clock, Target, ChevronRight, Users, AlertTriangle } from 'lucide-react';

interface TeamProductivity {
  teamName: string;
  productivity: number;
  burnoutRisk: 'Low' | 'Medium' | 'High';
  avgHoursWorked: number;
  projectsCompleted: number;
  satisfactionScore: number;
  retentionRate: number;
  innovationIndex: number;
}

interface EmployeeAnalyticsProps {
  onTeamClick?: (team: TeamProductivity) => void;
}

const teamData: TeamProductivity[] = [
  {
    teamName: 'Product Engineering',
    productivity: 94.2,
    burnoutRisk: 'Low',
    avgHoursWorked: 42.5,
    projectsCompleted: 28,
    satisfactionScore: 9.1,
    retentionRate: 96.8,
    innovationIndex: 8.9
  },
  {
    teamName: 'Data Science & Analytics',
    productivity: 91.7,
    burnoutRisk: 'Medium',
    avgHoursWorked: 44.2,
    projectsCompleted: 15,
    satisfactionScore: 8.8,
    retentionRate: 94.2,
    innovationIndex: 9.4
  },
  {
    teamName: 'Customer Success',
    productivity: 89.3,
    burnoutRisk: 'Low',
    avgHoursWorked: 40.8,
    projectsCompleted: 42,
    satisfactionScore: 9.3,
    retentionRate: 98.1,
    innovationIndex: 7.8
  },
  {
    teamName: 'Revenue Operations',
    productivity: 87.6,
    burnoutRisk: 'High',
    avgHoursWorked: 47.3,
    projectsCompleted: 22,
    satisfactionScore: 8.2,
    retentionRate: 89.4,
    innovationIndex: 8.1
  },
  {
    teamName: 'Design & UX Research',
    productivity: 92.1,
    burnoutRisk: 'Low',
    avgHoursWorked: 41.6,
    projectsCompleted: 18,
    satisfactionScore: 9.0,
    retentionRate: 95.7,
    innovationIndex: 9.2
  }
];

export function EmployeeAnalytics({ onTeamClick }: EmployeeAnalyticsProps) {
  const getProductivityColor = (productivity: number) => {
    if (productivity >= 90) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (productivity >= 85) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (productivity >= 80) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    }
  };

  const getBurnoutIcon = (risk: string) => {
    return risk === 'High' ? AlertTriangle : Target;
  };

  const topTeams = [...teamData]
    .sort((a, b) => b.productivity - a.productivity)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Productivity Intelligence</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time performance & wellness metrics</p>
        </div>
      </div>

      <div className="space-y-4">
        {topTeams.map((team, index) => {
          const BurnoutIcon = getBurnoutIcon(team.burnoutRisk);
          
          return (
            <motion.div
              key={team.teamName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onTeamClick?.(team)}
              className="relative overflow-hidden p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/30 rounded-xl hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-600/50 dark:hover:to-gray-500/30 transition-all cursor-pointer group border border-gray-200/50 dark:border-gray-600/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg">
                      #{index + 1}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{team.teamName}</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBurnoutColor(team.burnoutRisk)}`}>
                        <BurnoutIcon className="h-3 w-3" />
                        {team.burnoutRisk} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-6 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{team.avgHoursWorked}h/week</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{team.projectsCompleted} projects</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{team.retentionRate}% retention</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${getProductivityColor(team.productivity)}`}>
                      <TrendingUp className="h-4 w-4" />
                      {team.productivity.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                      Innovation: {team.innovationIndex}/10
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Productivity Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Satisfaction Score</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{team.satisfactionScore}/10</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(team.satisfactionScore / 10) * 100}%` }}
                    transition={{ delay: index * 0.2, duration: 1 }}
                    className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform" />
            </motion.div>
          );
        })}
      </div>

      {/* Advanced Metrics Grid */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {(teamData.reduce((sum, team) => sum + team.productivity, 0) / teamData.length).toFixed(1)}%
              </p>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Company Productivity</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {(teamData.reduce((sum, team) => sum + team.retentionRate, 0) / teamData.length).toFixed(1)}%
              </p>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Avg Retention</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-purple-600" />
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {teamData.filter(team => team.burnoutRisk === 'Low').length}
              </p>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Healthy Teams</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}