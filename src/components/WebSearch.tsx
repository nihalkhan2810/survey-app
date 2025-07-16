'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, ExternalLink, Clock, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  displayLink: string;
  formattedUrl: string;
}

interface SummaryData {
  summary: string;
  keyPoints: string[];
  sources: {
    title: string;
    url: string;
    credibility: 'high' | 'medium' | 'low';
  }[];
  confidence: 'high' | 'medium' | 'low';
  lastUpdated: string;
  additionalContext: string;
  generatedAt: string;
}

export default function WebSearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('webSearchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setSummary(null);
    setSearchResults([]);

    try {
      // Perform web search
      const searchResponse = await fetch('/api/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to perform web search');
      }

      const searchData = await searchResponse.json();
      setSearchResults(searchData.results);

      // Generate AI summary
      const summaryResponse = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery, 
          searchResults: searchData.results 
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error('Failed to generate summary');
      }

      const summaryData = await summaryResponse.json();
      setSummary(summaryData);

      // Update search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('webSearchHistory', JSON.stringify(newHistory));

    } catch (err: any) {
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCredibilityIcon = (credibility: string) => {
    switch (credibility) {
      case 'high': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className={`font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent ${
          isMobile ? 'text-2xl' : 'text-3xl'
        }`}>
          Web Search & AI Summary
        </h2>
        <p className={`mt-2 text-gray-600 dark:text-gray-400 ${
          isMobile ? 'text-sm' : 'text-base'
        }`}>
          Search the web and get AI-powered TL;DR summaries
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for any topic... (e.g., 'Vini Jr Contract')"
            className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all text-black dark:text-white shadow-sm ${
              isMobile ? 'pl-12 pr-20 py-4 text-base' : 'pl-12 pr-20 py-3'
            }`}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isMobile ? 'px-4 py-2 text-sm' : 'px-4 py-2'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">Recent searches:</span>
          {searchHistory.map((historyItem, index) => (
            <button
              key={index}
              onClick={() => handleSearch(historyItem)}
              className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {historyItem}
            </button>
          ))}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300 font-medium">Error</span>
          </div>
          <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
        </motion.div>
      )}

      {/* AI Summary */}
      {summary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-violet-900 dark:text-violet-300">AI Summary</h3>
            <div className="flex items-center gap-1 ml-auto">
              <span className={`text-sm font-medium ${getConfidenceColor(summary.confidence)}`}>
                {summary.confidence} confidence
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {summary.summary}
            </div>
            
            {summary.keyPoints.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Points:</h4>
                <ul className="space-y-1">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-violet-600 dark:text-violet-400 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.additionalContext && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-yellow-800 dark:text-yellow-200 font-medium">Additional Context:</span>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-1">{summary.additionalContext}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Generated {new Date(summary.generatedAt).toLocaleString()}</span>
              </div>
              {summary.lastUpdated && (
                <div className="flex items-center gap-1">
                  <span>Updated: {summary.lastUpdated}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Sources */}
      {summary?.sources && summary.sources.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Sources</h3>
          <div className="space-y-3">
            {summary.sources.map((source, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getCredibilityIcon(source.credibility)}
                </div>
                <div className="flex-1 min-w-0">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    {source.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{source.url}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Search Results</h3>
          <div className="space-y-4">
            {searchResults.slice(0, 5).map((result, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                <a 
                  href={result.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                >
                  {result.title}
                </a>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm leading-relaxed">
                  {result.snippet}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{result.displayLink}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}