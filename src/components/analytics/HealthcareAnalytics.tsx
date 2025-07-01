'use client';

import { motion } from 'framer-motion';
import { Heart, TrendingUp, Stethoscope, ChevronRight } from 'lucide-react';

interface ProviderStats {
  id: string;
  name: string;
  specialty: string;
  department: string;
  patientSatisfaction: number;
  treatmentEffectiveness: number;
  careQuality: number;
  responses: number;
  patients: number;
}

interface HealthcareAnalyticsProps {
  providers?: ProviderStats[];
  onProviderClick?: (provider: ProviderStats) => void;
}

const dummyProviders: ProviderStats[] = [
  {
    id: '1',
    name: 'Cardiac Excellence Center',
    specialty: 'Cardiovascular Surgery',
    department: 'Heart & Vascular Institute',
    patientSatisfaction: 9.7,
    treatmentEffectiveness: 9.4,
    careQuality: 9.6,
    responses: 2847,
    patients: 4250
  },
  {
    id: '2',
    name: 'Neuroscience Innovation Hub',
    specialty: 'Neurological Care',
    department: 'Brain & Spine Center',
    patientSatisfaction: 9.3,
    treatmentEffectiveness: 9.1,
    careQuality: 9.2,
    responses: 1634,
    patients: 2890
  },
  {
    id: '3',
    name: 'Precision Oncology Division',
    specialty: 'Cancer Treatment',
    department: 'Comprehensive Cancer Center',
    patientSatisfaction: 9.8,
    treatmentEffectiveness: 9.3,
    careQuality: 9.5,
    responses: 1289,
    patients: 1950
  },
  {
    id: '4',
    name: 'Advanced Surgical Robotics',
    specialty: 'Minimally Invasive Surgery',
    department: 'Surgical Innovation Center',
    patientSatisfaction: 9.2,
    treatmentEffectiveness: 9.0,
    careQuality: 9.1,
    responses: 943,
    patients: 1580
  },
  {
    id: '5',
    name: 'Maternal-Fetal Medicine',
    specialty: 'High-Risk Pregnancy',
    department: 'Women\'s Health Institute',
    patientSatisfaction: 9.5,
    treatmentEffectiveness: 9.2,
    careQuality: 9.4,
    responses: 567,
    patients: 890
  }
];

export function HealthcareAnalytics({ providers = dummyProviders, onProviderClick }: HealthcareAnalyticsProps) {
  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 9) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (satisfaction >= 8) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (satisfaction >= 7) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getTopProviders = () => {
    return [...providers]
      .sort((a, b) => (b.patientSatisfaction + b.treatmentEffectiveness + b.careQuality) / 3 - (a.patientSatisfaction + a.treatmentEffectiveness + a.careQuality) / 3)
      .slice(0, 3);
  };

  const topProviders = getTopProviders();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Centers of Excellence</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Leading medical centers & patient outcomes</p>
        </div>
      </div>

      <div className="space-y-4">
        {topProviders.map((provider, index) => {
          const avgScore = ((provider.patientSatisfaction + provider.treatmentEffectiveness + provider.careQuality) / 3);
          
          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onProviderClick?.(provider)}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full text-sm font-bold">
                  #{index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{provider.name}</h4>
                    {index === 0 && <Heart className="h-4 w-4 text-emerald-500 fill-current" />}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{provider.specialty}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3 text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">{provider.department}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSatisfactionColor(avgScore)}`}>
                    <TrendingUp className="h-3 w-3" />
                    {avgScore.toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {provider.responses} reviews
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(providers.reduce((sum, provider) => sum + provider.patientSatisfaction, 0) / providers.length).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Patient Satisfaction</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(providers.reduce((sum, provider) => sum + provider.treatmentEffectiveness, 0) / providers.length).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Treatment Score</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(providers.reduce((sum, provider) => sum + provider.careQuality, 0) / providers.length).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Care Quality</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}