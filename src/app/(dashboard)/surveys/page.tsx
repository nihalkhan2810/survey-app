'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, EyeIcon, PaperAirplaneIcon, PhoneArrowUpRightIcon, ClipboardDocumentIcon, CheckIcon, TrashIcon, CalendarIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getSurveyUrl } from '@/lib/utils';
import { ResultsModal } from "@/components/surveys/ResultsModal";
import { CallModal } from "@/components/surveys/CallModal";
import VapiCallModal from "@/components/surveys/VapiCallModal";

type Survey = {
  id: string;
  topic: string;
  created_at: string;
  start_date?: string;
  end_date?: string;
  questions?: Array<{ text: string }>;
};

type SurveyStatus = 'yet-to-start' | 'active' | 'expired';

type ModalType = 'results' | 'call' | 'vapi-call' | null;

const gradients = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-cyan-600', 
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-500',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-purple-600',
  'from-yellow-500 to-orange-500',
  'from-green-500 to-emerald-600',
];

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingFullSurvey, setLoadingFullSurvey] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load view mode from localStorage on component mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('surveys-view-mode') as 'grid' | 'list';
    if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage when it changes
  const handleViewModeChange = (newViewMode: 'grid' | 'list') => {
    setViewMode(newViewMode);
    localStorage.setItem('surveys-view-mode', newViewMode);
  };

  // Function to determine survey status based on dates
  const getSurveyStatus = (survey: Survey, timeToCheck: Date = currentTime): SurveyStatus => {
    if (!survey.start_date || !survey.end_date) {
      return 'active'; // Default for surveys without dates
    }
    
    const startDate = new Date(survey.start_date);
    const endDate = new Date(survey.end_date);
    const now = timeToCheck;
    
    if (now < startDate) {
      return 'yet-to-start';
    } else if (now > endDate) {
      return 'expired';
    } else {
      return 'active';
    }
  };

  // Schedule precise transitions for survey status changes
  useEffect(() => {
    const scheduleNextTransition = () => {
      const now = new Date();
      let nextTransitionTime: Date | null = null;
      
      // Find the earliest upcoming transition (start or end date)
      surveys.forEach(survey => {
        if (survey.start_date && survey.end_date) {
          const startDate = new Date(survey.start_date);
          const endDate = new Date(survey.end_date);
          
          // Check start date if it's in the future
          if (startDate > now) {
            if (!nextTransitionTime || startDate < nextTransitionTime) {
              nextTransitionTime = startDate;
            }
          }
          
          // Check end date if it's in the future
          if (endDate > now) {
            if (!nextTransitionTime || endDate < nextTransitionTime) {
              nextTransitionTime = endDate;
            }
          }
        }
      });
      
      // Schedule update for the next transition
      if (nextTransitionTime) {
        const timeUntilTransition = nextTransitionTime.getTime() - now.getTime();
        
        // Add small buffer (1 second) to ensure transition happens
        const timeout = setTimeout(() => {
          setCurrentTime(new Date());
          scheduleNextTransition(); // Schedule the next one
        }, timeUntilTransition + 1000);
        
        return timeout;
      }
      
      return null;
    };
    
    const timeout = scheduleNextTransition();
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [surveys, currentTime]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/surveys")
      .then((res) => res.json())
      .then((data) => {
        setSurveys(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setSurveys([]);
        setLoading(false);
      });
  }, []);

  const fetchFullSurvey = async (surveyId: string): Promise<Survey | null> => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch survey details:', error);
      return null;
    }
  };

  const openModal = async (survey: Survey, modal: ModalType) => {
    if (modal === 'vapi-call') {
      setLoadingFullSurvey(true);
      const fullSurvey = await fetchFullSurvey(survey.id);
      if (fullSurvey) {
        setActiveSurvey(fullSurvey);
      } else {
        setActiveSurvey(survey);
      }
      setLoadingFullSurvey(false);
    } else {
      setActiveSurvey(survey);
    }
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveSurvey(null);
    setActiveModal(null);
  };
  
  const handleCopyLink = (id: string) => {
    const link = getSurveyUrl(id);
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteSurvey = async (id: string) => {
    const survey = surveys.find(s => s.id === id);
    if (!survey) return;
    
    const status = getSurveyStatus(survey, currentTime);
    
    // Prevent deletion of active surveys
    if (status === 'active') {
      alert('The survey is currently active, and participants may still be submitting their responses. Therefore, it cannot be deleted at this time.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/surveys/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSurveys(prev => prev.filter(survey => survey.id !== id));
      } else {
        alert('Failed to delete survey. Please try again.');
      }
    } catch (error) {
      alert('Failed to delete survey. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Status display component with animations
  const StatusIndicator = ({ survey, currentTime }: { survey: Survey; currentTime: Date }) => {
    const status = getSurveyStatus(survey, currentTime);
    
    const statusConfig = {
      'yet-to-start': {
        text: 'Yet to Start',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
      },
      'active': {
        text: 'Active',
        color: 'bg-green-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      },
      'expired': {
        text: 'Expired',
        color: 'bg-red-500',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
      }
    };
    
    const config = statusConfig[status];
    
    return (
      <motion.div
        key={status} // Key ensures animation on status change
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex items-center gap-2 text-sm ${config.textColor} px-2 py-1 rounded-lg ${config.bgColor}`}
      >
        <motion.div
          className={`h-2 w-2 ${config.color} rounded-full`}
          animate={status === 'active' ? { scale: [1, 1.2, 1] } : {}}
          transition={status === 'active' ? { duration: 2, repeat: Infinity } : {}}
        />
        <span className="font-medium">{config.text}</span>
      </motion.div>
    );
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Surveys
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Create, manage, and view your surveys.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
              Grid
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
              List
            </button>
          </div>
          <Link href="/calendar">
            <motion.span
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <CalendarIcon className="h-5 w-5" />
            Calendar
          </motion.span>
          </Link>
          <Link href="/surveys/send">
            <motion.span
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            Send Survey
          </motion.span>
          </Link>
          <Link href="/surveys/create">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow">
              <PlusIcon className="h-5 w-5" />
              Create New Survey
            </motion.span>
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-600"
          />
        </div>
      ) : surveys.length > 0 ? (
        viewMode === 'grid' ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {surveys.map((survey, index) => (
              <motion.div 
                key={survey.id} 
                variants={itemVariants} 
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${gradients[index % gradients.length]} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-xl shadow-lg`}>
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {new Date(survey.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{survey.topic}</h2>
                    <StatusIndicator survey={survey} currentTime={currentTime} />
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">
                    <div className="flex items-center justify-center gap-2">
                      <motion.button 
                        onClick={() => handleCopyLink(survey.id)} 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50" 
                        title="Copy Survey Link"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={copiedId === survey.id ? 'check' : 'copy'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            {copiedId === survey.id ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardDocumentIcon className="h-5 w-5"/>}
                          </motion.div>
                        </AnimatePresence>
                      </motion.button>
                      <motion.button 
                        onClick={() => openModal(survey, 'results')} 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50" 
                        title="View Results"
                      >
                        <EyeIcon className="h-5 w-5"/>
                      </motion.button>
                      <Link href={`/surveys/send?surveyId=${survey.id}`}>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50" 
                          title="Send via Email"
                        >
                          <PaperAirplaneIcon className="h-5 w-5"/>
                        </motion.button>
                      </Link>
                      <motion.button 
                        onClick={() => openModal(survey, 'vapi-call')} 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50" 
                        title="Demo Voice Call"
                      >
                        <PhoneArrowUpRightIcon className="h-5 w-5"/>
                      </motion.button>
                      <motion.button 
                        onClick={() => handleDeleteSurvey(survey.id)} 
                        disabled={deletingId === survey.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 disabled:opacity-50" 
                        title="Delete Survey"
                      >
                        {deletingId === survey.id ? (
                          <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <TrashIcon className="h-5 w-5"/>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 mt-6">
            {surveys.map((survey, index) => (
              <motion.div 
                key={survey.id} 
                variants={itemVariants} 
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${gradients[index % gradients.length]} rounded-xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-gradient-to-br ${gradients[index % gradients.length]} rounded-xl shadow-lg`}>
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{survey.topic}</h2>
                          <div className="flex items-center gap-4 mt-2">
                            <StatusIndicator survey={survey} currentTime={currentTime} />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Created {new Date(survey.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button 
                          onClick={() => handleCopyLink(survey.id)} 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" 
                          title="Copy Survey Link"
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={copiedId === survey.id ? 'check' : 'copy'}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                            >
                              {copiedId === survey.id ? <CheckIcon className="h-5 w-5 text-green-500" /> : <ClipboardDocumentIcon className="h-5 w-5"/>}
                            </motion.div>
                          </AnimatePresence>
                        </motion.button>
                        <motion.button 
                          onClick={() => openModal(survey, 'results')} 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" 
                          title="View Results"
                        >
                          <EyeIcon className="h-5 w-5"/>
                        </motion.button>
                        <Link href={`/surveys/send?surveyId=${survey.id}`}>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" 
                            title="Send via Email"
                          >
                            <PaperAirplaneIcon className="h-5 w-5"/>
                          </motion.button>
                        </Link>
                        <motion.button 
                          onClick={() => openModal(survey, 'vapi-call')} 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" 
                          title="Demo Voice Call"
                        >
                          <PhoneArrowUpRightIcon className="h-5 w-5"/>
                        </motion.button>
                        <motion.button 
                          onClick={() => handleDeleteSurvey(survey.id)} 
                          disabled={deletingId === survey.id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" 
                          title="Delete Survey"
                        >
                          {deletingId === survey.id ? (
                            <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <TrashIcon className="h-5 w-5"/>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 mt-6">
          <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-full mb-6">
            <Sparkles className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Surveys Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first survey to get started</p>
          <Link href="/surveys/create">
            <motion.span 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <PlusIcon className="h-5 w-5" />
              Create Your First Survey
            </motion.span>
          </Link>
        </motion.div>
      )}
      <AnimatePresence>
        {activeModal === 'results' && activeSurvey && <ResultsModal surveyId={activeSurvey.id} onClose={closeModal} />}
        {activeModal === 'call' && activeSurvey && <CallModal survey={activeSurvey} onClose={closeModal} />}
        {activeModal === 'vapi-call' && activeSurvey && !loadingFullSurvey && (
          <VapiCallModal 
            isOpen={true}
            onClose={closeModal}
            surveyData={{
              id: activeSurvey.id,
              topic: activeSurvey.topic,
              questions: activeSurvey.questions || []
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
} 