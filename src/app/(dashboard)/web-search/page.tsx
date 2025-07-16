'use client';

import { motion } from 'framer-motion';
import WebSearch from '@/components/WebSearch';
import { Search, Sparkles, Globe } from 'lucide-react';

export default function WebSearchPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-lg">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Web Search
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Search the web and get AI-powered TL;DR summaries on any topic. Get quick, accurate insights with source attribution and credibility indicators.
        </p>
      </motion.div>

      {/* Features */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6 mb-8"
      >
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg w-fit mx-auto mb-3">
            <Search className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Search</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get up-to-date information from across the web with our powerful search engine
          </p>
        </div>
        
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg w-fit mx-auto mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Summaries</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get concise TL;DR summaries powered by advanced AI analysis
          </p>
        </div>
        
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg w-fit mx-auto mb-3">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Source Credibility</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            See source attribution and credibility indicators for all information
          </p>
        </div>
      </motion.div>

      {/* Web Search Component */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <WebSearch />
      </motion.div>
    </div>
  );
}