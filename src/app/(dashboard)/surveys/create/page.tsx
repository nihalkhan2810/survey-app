'use client';

import { motion } from 'framer-motion';
import { CreateSurveyForm } from '@/components/CreateSurveyForm';

export default function CreateSurveyPage() {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
    >
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Survey</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Design your survey manually or let AI help you generate questions</p>
        </div>

        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 overflow-hidden">
            <CreateSurveyForm />
        </div>
    </motion.div>
  );
}