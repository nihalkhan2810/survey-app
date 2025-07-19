'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, ExternalLink, Clock, Shield, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, Quote, Target, Eye, Hash, X, Loader2 } from 'lucide-react';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  displayLink: string;
  formattedUrl: string;
}

interface SentimentData {
  overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;
  generalOpinion: string;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  claimsVsReality: {
    claim: string;
    reality: string;
    verdict: 'accurate' | 'exaggerated' | 'false';
    evidence: string[];
    sources: string[];
  }[];
  keyFindings: {
    finding: string;
    evidence: string;
    source: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  prosAndCons: {
    pros: {
      point: string;
      frequency: string;
      evidence: string;
      source: string;
    }[];
    cons: {
      point: string;
      frequency: string;
      evidence: string;
      source: string;
    }[];
  };
  trendAnalysis: string;
  credibilityAssessment: string;
  recommendationScore: number;
  bottomLine: string;
  sources: {
    title: string;
    url: string;
    platform: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    credibility: 'high' | 'medium' | 'low';
    keyQuote: string;
  }[];
  analyzedAt: string;
}

export default function WebSearch() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [searchMode, setSearchMode] = useState<'normal' | 'hashtag'>('normal');

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
    
    // Handle hashtag mode validation
    if (searchMode === 'hashtag') {
      const hasHashtags = searchQuery.includes('#');
      if (!hasHashtags) {
        setError('Hashtag mode requires at least one hashtag (e.g., #hashtag)');
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    setSentimentData(null);
    setSearchResults([]);

    try {
      // Perform web search
      const searchResponse = await fetch('/api/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          mode: searchMode 
        }),
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to perform web search');
      }

      const searchData = await searchResponse.json();
      setSearchResults(searchData.results);

      // Generate sentiment analysis
      const sentimentResponse = await fetch('/api/sentiment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery, 
          searchResults: searchData.results 
        }),
      });

      if (!sentimentResponse.ok) {
        throw new Error('Failed to analyze sentiment');
      }

      const sentimentAnalysis = await sentimentResponse.json();
      setSentimentData(sentimentAnalysis);

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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      case 'neutral': return 'text-gray-600 dark:text-gray-400';
      case 'mixed': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'negative': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'neutral': return <Minus className="w-5 h-5 text-gray-500" />;
      case 'mixed': return <MessageSquare className="w-5 h-5 text-yellow-500" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'accurate': return 'text-green-600 dark:text-green-400';
      case 'exaggerated': return 'text-yellow-600 dark:text-yellow-400';
      case 'false': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'accurate': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'exaggerated': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'false': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
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
      {/* Minimalist Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Social Sentiment
        </h2>
      </motion.div>

      {/* Search Mode Toggle */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="flex justify-center mb-4"
      >
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setSearchMode('normal')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              searchMode === 'normal'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setSearchMode('hashtag')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
              searchMode === 'hashtag'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Hash className="w-3 h-3" />
            Hashtag
          </button>
        </div>
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
            placeholder={searchMode === 'hashtag' ? '#hashtag1, #hashtag2, #hashtag3...' : 'Search anything...'}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black dark:text-white shadow-sm pl-12 pr-20 py-4"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
        
        {/* Loading Animation */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Analyzing social sentiment...
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Searching Reddit, Twitter, and social discussions
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2 mt-4"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">Recent:</span>
          {searchHistory.map((historyItem, index) => (
            <div key={index} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full">
              <button
                onClick={() => handleSearch(historyItem)}
                className="text-sm text-gray-700 dark:text-gray-300 px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors rounded-l-full"
              >
                {historyItem}
              </button>
              <button
                onClick={() => {
                  const newHistory = searchHistory.filter((_, i) => i !== index);
                  setSearchHistory(newHistory);
                  localStorage.setItem('webSearchHistory', JSON.stringify(newHistory));
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors rounded-r-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
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

      {/* Sentiment Analysis - Bento Grid Layout */}
      {sentimentData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Main Sentiment Card */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              {getSentimentIcon(sentimentData.overallSentiment)}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Social Sentiment</h3>
                <span className={`text-sm font-medium ${getSentimentColor(sentimentData.overallSentiment)}`}>
                  {sentimentData.overallSentiment.toUpperCase()} • {sentimentData.sentimentScore.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{sentimentData.generalOpinion}</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3">
              <p className="text-blue-800 dark:text-blue-200 font-medium">{sentimentData.bottomLine}</p>
            </div>
          </div>

          {/* Recommendation Score Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {sentimentData.recommendationScore}/10
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">User Score</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(sentimentData.recommendationScore / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Distribution</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Positive</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {sentimentData.sentimentBreakdown.positive}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Negative</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {sentimentData.sentimentBreakdown.negative}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Neutral</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {sentimentData.sentimentBreakdown.neutral}%
                </span>
              </div>
            </div>
          </div>

          {/* What Users Love */}
          {sentimentData.prosAndCons.pros.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-900 dark:text-green-300">Users Love</h4>
              </div>
              <div className="space-y-2">
                {sentimentData.prosAndCons.pros.slice(0, 3).map((pro, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-green-800 dark:text-green-200">{pro.point}</div>
                    <div className="text-green-600 dark:text-green-400 text-xs">"{pro.evidence}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Complaints */}
          {sentimentData.prosAndCons.cons.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="w-4 h-4 text-red-600" />
                <h4 className="font-medium text-red-900 dark:text-red-300">Complaints</h4>
              </div>
              <div className="space-y-2">
                {sentimentData.prosAndCons.cons.slice(0, 3).map((con, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-red-800 dark:text-red-200">{con.point}</div>
                    <div className="text-red-600 dark:text-red-400 text-xs">"{con.evidence}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Detailed View */}
          <div className="md:col-span-3 flex justify-center">
            <button
              onClick={() => setShowDetailedView(!showDetailedView)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showDetailedView ? 'Hide Details' : 'Show Full Analysis'}
              {showDetailedView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Detailed View */}
          {showDetailedView && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="md:col-span-3 space-y-4"
            >
              {/* Claims vs Reality */}
              {sentimentData.claimsVsReality.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    Claims vs Reality
                  </h4>
                  <div className="space-y-3">
                    {sentimentData.claimsVsReality.map((item, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-2">
                          {getVerdictIcon(item.verdict)}
                          <span className={`text-sm font-medium ${getVerdictColor(item.verdict)}`}>
                            {item.verdict.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Claim:</span>
                            <p className="text-gray-700 dark:text-gray-300">{item.claim}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Reality:</span>
                            <p className="text-gray-700 dark:text-gray-300">{item.reality}</p>
                          </div>
                          {item.evidence.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Evidence:</span>
                              <div className="mt-1 space-y-1">
                                {item.evidence.map((evidence, evidenceIndex) => (
                                  <div key={evidenceIndex} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700 rounded p-2">
                                    <Quote className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 italic">{evidence}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trend Analysis */}
              {sentimentData.trendAnalysis && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-6">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-purple-800 dark:text-purple-200 font-medium">Trend Analysis:</span>
                      <p className="text-purple-700 dark:text-purple-300 mt-1">{sentimentData.trendAnalysis}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Sources */}
      {sentimentData?.sources && sentimentData.sources.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Sources</h3>
          <div className="space-y-3">
            {sentimentData.sources.map((source, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0 mt-1 flex flex-col gap-1">
                  {getCredibilityIcon(source.credibility)}
                  {getSentimentIcon(source.sentiment)}
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
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {source.platform}
                    </span>
                    <span className={`text-xs font-medium ${getSentimentColor(source.sentiment)}`}>
                      {source.sentiment}
                    </span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {source.url}
                  </div>
                  {source.keyQuote && (
                    <div className="flex items-start gap-2 mt-2 bg-gray-100 dark:bg-gray-600 rounded p-2">
                      <Quote className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 italic">"{source.keyQuote}"</span>
                    </div>
                  )}
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
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6"
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