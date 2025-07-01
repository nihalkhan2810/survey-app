'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, 
  GraduationCap, 
  Users, 
  Star, 
  MessageCircle, 
  BarChart, 
  Calendar, 
  Heart,
  Save,
  Check,
  ArrowLeft,
  Database,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import Link from 'next/link';
import { 
  getDataSourceConfig, 
  setDataSourceConfig, 
  toggleDummyData, 
  isUsingDummyData 
} from '@/lib/industry-config';

interface IndustryCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  metrics: string[];
  questionTypes: string[];
}

const industryCategories: IndustryCategory[] = [
  {
    id: 'education',
    name: 'Education Surveys',
    description: 'Course evaluations, student feedback, and academic assessments',
    icon: GraduationCap,
    color: 'from-blue-500 to-blue-600',
    metrics: ['Student Satisfaction', 'Course Difficulty', 'Teaching Quality', 'Learning Outcomes'],
    questionTypes: ['Course Rating', 'Professor Evaluation', 'Curriculum Feedback', 'Campus Experience']
  },
  {
    id: 'employee',
    name: 'Employee Feedback',
    description: 'Workplace satisfaction, performance reviews, and team dynamics',
    icon: Users,
    color: 'from-green-500 to-green-600',
    metrics: ['Job Satisfaction', 'Work-Life Balance', 'Management Quality', 'Career Development'],
    questionTypes: ['Performance Review', 'Team Collaboration', 'Company Culture', 'Training Needs']
  },
  {
    id: 'customer',
    name: 'Customer Insights',
    description: 'Product feedback, service quality, and customer satisfaction',
    icon: Star,
    color: 'from-yellow-500 to-orange-500',
    metrics: ['Customer Satisfaction', 'Product Quality', 'Service Rating', 'Loyalty Score'],
    questionTypes: ['Product Review', 'Service Experience', 'Purchase Intent', 'Recommendation']
  },
  {
    id: 'community',
    name: 'Community Voices',
    description: 'Local opinions, civic engagement, and community feedback',
    icon: MessageCircle,
    color: 'from-purple-500 to-purple-600',
    metrics: ['Community Engagement', 'Service Satisfaction', 'Local Issues', 'Participation Rate'],
    questionTypes: ['Public Opinion', 'Local Services', 'Community Events', 'Civic Participation']
  },
  {
    id: 'public',
    name: 'Public Polls',
    description: 'Political opinions, social issues, and demographic research',
    icon: BarChart,
    color: 'from-indigo-500 to-indigo-600',
    metrics: ['Opinion Distribution', 'Demographic Breakdown', 'Trend Analysis', 'Confidence Level'],
    questionTypes: ['Political Opinion', 'Social Issues', 'Demographics', 'Trend Questions']
  },
  {
    id: 'event',
    name: 'Event Feedback',
    description: 'Conference evaluations, event experience, and attendee satisfaction',
    icon: Calendar,
    color: 'from-pink-500 to-pink-600',
    metrics: ['Event Satisfaction', 'Content Quality', 'Organization Rating', 'Attendance Value'],
    questionTypes: ['Session Rating', 'Speaker Evaluation', 'Venue Experience', 'Future Attendance']
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Wellness',
    description: 'Patient satisfaction, treatment feedback, and wellness assessments',
    icon: Heart,
    color: 'from-red-500 to-red-600',
    metrics: ['Patient Satisfaction', 'Treatment Effectiveness', 'Care Quality', 'Wellness Score'],
    questionTypes: ['Treatment Review', 'Care Experience', 'Health Assessment', 'Provider Rating']
  }
];

export default function IndustrySetupPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('education');
  const [customMetrics, setCustomMetrics] = useState<string[]>([]);
  const [newMetric, setNewMetric] = useState('');
  const [saved, setSaved] = useState(false);
  const [useDummyData, setUseDummyData] = useState(true);
  const [dataSourceSaved, setDataSourceSaved] = useState(false);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedIndustry = localStorage.getItem('selectedIndustry');
    const savedMetrics = localStorage.getItem('customMetrics');
    
    if (savedIndustry) {
      setSelectedIndustry(savedIndustry);
    }
    if (savedMetrics) {
      setCustomMetrics(JSON.parse(savedMetrics));
    }
    
    // Load data source configuration
    const dataSourceConfig = getDataSourceConfig();
    setUseDummyData(dataSourceConfig.useDummyData);
  }, []);

  const handleSave = () => {
    localStorage.setItem('selectedIndustry', selectedIndustry);
    localStorage.setItem('customMetrics', JSON.stringify(customMetrics));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDataSourceToggle = () => {
    const newUseDummyData = toggleDummyData();
    setUseDummyData(newUseDummyData);
    setDataSourceSaved(true);
    setTimeout(() => setDataSourceSaved(false), 2000);
  };

  const addCustomMetric = () => {
    if (newMetric.trim() && !customMetrics.includes(newMetric.trim())) {
      setCustomMetrics([...customMetrics, newMetric.trim()]);
      setNewMetric('');
    }
  };

  const removeCustomMetric = (metric: string) => {
    setCustomMetrics(customMetrics.filter(m => m !== metric));
  };

  const selectedCategory = industryCategories.find(cat => cat.id === selectedIndustry);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link 
            href="/admin"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all ${
            saved 
              ? 'bg-green-500' 
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg'
          }`}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Building className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Industry Setup</h1>
            <p className="text-emerald-100 mt-1">
              Configure your survey platform for industry-specific analytics and metrics
            </p>
          </div>
        </div>
      </motion.div>

      {/* Industry Category Selection */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Select Your Primary Industry
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industryCategories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedIndustry === category.id;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedIndustry(category.id)}
                className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-gradient-to-r ${category.color} rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Key Metrics
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {category.metrics.slice(0, 2).map((metric) => (
                      <span
                        key={metric}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md text-gray-600 dark:text-gray-300"
                      >
                        {metric}
                      </span>
                    ))}
                    {category.metrics.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md text-gray-500 dark:text-gray-400">
                        +{category.metrics.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Data Source Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Source Configuration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose between demo data or real survey responses for analytics
              </p>
            </div>
          </div>
          {dataSourceSaved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm"
            >
              <Check className="h-4 w-4" />
              Saved!
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Demo Data Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => !useDummyData && handleDataSourceToggle()}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              useDummyData
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <BarChart className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Demo Data
                </h4>
              </div>
              {useDummyData ? (
                <ToggleRight className="h-6 w-6 text-blue-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use pre-generated sample data to explore analytics features and visualizations. Perfect for demos and testing.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="h-4 w-4 text-green-500" />
                Rich sample data across all industries
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="h-4 w-4 text-green-500" />
                Instant analytics and visualizations
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="h-4 w-4 text-green-500" />
                Perfect for demonstrations
              </div>
            </div>
          </motion.div>

          {/* Real Data Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => useDummyData && handleDataSourceToggle()}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              !useDummyData
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Real Survey Data
                </h4>
              </div>
              {!useDummyData ? (
                <ToggleRight className="h-6 w-6 text-green-500" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use actual survey responses from your users. Analytics will reflect real feedback and insights from your surveys.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="h-4 w-4 text-green-500" />
                Authentic user feedback
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="h-4 w-4 text-green-500" />
                Real-time analytics updates
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Check className="h-4 w-4 text-green-500" />
                Production-ready insights
              </div>
            </div>
          </motion.div>
        </div>

        {/* Current Status */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white">
                Current Data Source
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analytics are currently showing {useDummyData ? 'demo data' : 'real survey responses'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              useDummyData 
                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            }`}>
              {useDummyData ? 'Demo Mode' : 'Production Mode'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected Industry Details */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 bg-gradient-to-r ${selectedCategory.color} rounded-lg`}>
              <selectedCategory.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCategory.name} Configuration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize metrics and analytics for your industry
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Default Metrics */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Default Metrics
              </h4>
              <div className="space-y-2">
                {selectedCategory.metrics.map((metric) => (
                  <div
                    key={metric}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{metric}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Metrics */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Custom Metrics
              </h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMetric}
                    onChange={(e) => setNewMetric(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomMetric()}
                    placeholder="Add custom metric..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={addCustomMetric}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {customMetrics.map((metric) => (
                    <div
                      key={metric}
                      className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{metric}</span>
                      <button
                        onClick={() => removeCustomMetric(metric)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {customMetrics.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No custom metrics added yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Types */}
          <div className="mt-8">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Recommended Question Types
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {selectedCategory.questionTypes.map((type) => (
                <div
                  key={type}
                  className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center"
                >
                  <span className="text-sm text-blue-700 dark:text-blue-300">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analytics Preview
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Your analytics dashboard will be customized based on your industry selection and will include:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Industry-Specific Metrics
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Metrics tailored to {selectedCategory?.name.toLowerCase()} use cases
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Smart Dashboards
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pre-configured charts and visualizations for your industry
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Benchmark Comparisons
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare your results against industry standards
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}