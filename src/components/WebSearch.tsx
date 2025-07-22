'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, ExternalLink, Clock, Shield, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, Quote, Target, Eye, Hash, X, Loader2, Globe, Users, Play } from 'lucide-react';

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
  whatsHappening: string;
  recentDevelopments: {
    development: string;
    timestamp: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    source: string;
    evidence: string;
  }[];
  trendingReactions: {
    positive: {
      reaction: string;
      popularity: 'high' | 'medium' | 'low';
      evidence: string;
      platform: string;
    }[];
    negative: {
      reaction: string;
      popularity: 'high' | 'medium' | 'low';
      evidence: string;
      platform: string;
    }[];
  };
  breakingPoints: {
    point: string;
    intensity: 'high' | 'medium' | 'low';
    evidence: string;
    platforms: string[];
  }[];
  momentumAnalysis: string;
  timeframe: string;
  viralContent: {
    content: string;
    platform: string;
    engagement: 'high' | 'medium' | 'low';
    quote: string;
  }[];
  bottomLine: string;
  sources: {
    title: string;
    url: string;
    platform: string;
    recency: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    keyQuote: string;
  }[];
  analyzedAt: string;
}

type Platform = 'all' | 'twitter' | 'reddit' | 'youtube' | 'news';

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
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [allResults, setAllResults] = useState<SearchResult[]>([]);

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

  const filterResultsByPlatform = (results: SearchResult[], platform: Platform): SearchResult[] => {
    if (platform === 'all') return results;
    
    return results.filter(result => {
      const link = result.link.toLowerCase();
      switch (platform) {
        case 'twitter':
          return link.includes('twitter.com') || link.includes('x.com');
        case 'reddit':
          return link.includes('reddit.com');
        case 'youtube':
          return link.includes('youtube.com');
        case 'news':
          return link.includes('news') || link.includes('reuters') || link.includes('bbc') || 
                 link.includes('cnn') || link.includes('bloomberg') || link.includes('ap.org') || 
                 link.includes('theguardian') || link.includes('wsj.') || link.includes('nytimes.');
        default:
          return true;
      }
    });
  };

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
    setAllResults([]);

    try {
      // Always search all platforms - no platform restriction in API
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
      setAllResults(searchData.results);
      
      // Filter results based on selected platform
      const filteredResults = filterResultsByPlatform(searchData.results, selectedPlatform);
      setSearchResults(filteredResults);

      // Generate sentiment analysis based on filtered results
      const sentimentResponse = await fetch('/api/sentiment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery, 
          searchResults: filteredResults 
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

  // Handle platform change and re-filter existing results
  const handlePlatformChange = async (platform: Platform) => {
    setSelectedPlatform(platform);
    
    if (allResults.length > 0) {
      const filteredResults = filterResultsByPlatform(allResults, platform);
      setSearchResults(filteredResults);
      
      // Regenerate sentiment analysis for filtered results
      if (query.trim()) {
        try {
          const sentimentResponse = await fetch('/api/sentiment-analysis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              query: query, 
              searchResults: filteredResults 
            }),
          });

          if (sentimentResponse.ok) {
            const sentimentAnalysis = await sentimentResponse.json();
            setSentimentData(sentimentAnalysis);
          }
        } catch (err) {
          console.error('Failed to update sentiment analysis:', err);
        }
      }
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'twitter': return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
      case 'reddit': return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      );
      case 'youtube': return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
      case 'news': return <Globe className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getPlatformName = (platform: Platform) => {
    switch (platform) {
      case 'twitter': return 'X';
      case 'reddit': return 'Reddit';
      case 'youtube': return 'YouTube';
      case 'news': return 'News';
      default: return 'All';
    }
  };

  const getPlatformColor = (platform: Platform) => {
    switch (platform) {
      case 'twitter': return 'from-black to-gray-800';
      case 'reddit': return 'from-orange-500 to-red-500';
      case 'youtube': return 'from-red-500 to-red-600';
      case 'news': return 'from-blue-500 to-blue-600';
      default: return 'from-violet-500 to-purple-500';
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
          What's Happening
        </h2>
      </motion.div>

      {/* Search Mode Toggle */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="flex justify-center mb-6"
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

      {/* Platform Selector - Bento Grid Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Choose a platform or search all</p>
        </div>
        
        {/* Mobile Layout - Single Column */}
        <div className="grid grid-cols-2 sm:hidden gap-3">
          {(['all', 'twitter', 'reddit', 'youtube', 'news'] as Platform[]).map((platform) => (
            <button
              key={platform}
              onClick={() => handlePlatformChange(platform)}
              className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-200 transform hover:scale-110 hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-white/10 ${
                selectedPlatform === platform
                  ? `bg-gradient-to-br ${getPlatformColor(platform)} text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  selectedPlatform === platform 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {getPlatformIcon(platform)}
                </div>
                <span className="text-sm font-medium">
                  {getPlatformName(platform)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Tablet/Desktop Layout - Bento Grid */}
        <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {/* All - Takes 2 columns on smaller screens, 1 on larger */}
          <button
            onClick={() => handlePlatformChange('all')}
            className={`relative overflow-hidden rounded-2xl p-6 sm:col-span-2 lg:col-span-1 transition-all duration-200 transform hover:scale-110 hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-white/10 ${
              selectedPlatform === 'all'
                ? `bg-gradient-to-br ${getPlatformColor('all')} text-white shadow-lg`
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-3 rounded-xl ${
                selectedPlatform === 'all' 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {getPlatformIcon('all')}
              </div>
              <span className="text-lg font-semibold">
                {getPlatformName('all')}
              </span>
              <span className="text-xs opacity-80">Search everywhere</span>
            </div>
          </button>

          {/* Individual Platforms */}
          {(['twitter', 'reddit', 'youtube', 'news'] as Platform[]).map((platform) => (
            <button
              key={platform}
              onClick={() => handlePlatformChange(platform)}
              className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-200 transform hover:scale-110 hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-white/10 ${
                selectedPlatform === platform
                  ? `bg-gradient-to-br ${getPlatformColor(platform)} text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  selectedPlatform === platform 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {getPlatformIcon(platform)}
                </div>
                <span className="text-sm font-medium">
                  {getPlatformName(platform)}
                </span>
              </div>
            </button>
          ))}
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
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black dark:text-white shadow-sm pl-12 pr-24 sm:pr-20 py-4"
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
                  Checking what's happening...
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Finding recent trends, breaking news, and viral content
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
          {/* What's Happening Card */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              {getSentimentIcon(sentimentData.overallSentiment)}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">What's Happening</h3>
                <span className={`text-sm font-medium ${getSentimentColor(sentimentData.overallSentiment)}`}>
                  {sentimentData.overallSentiment.toUpperCase()} • {sentimentData.timeframe}
                </span>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{sentimentData.whatsHappening}</p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3">
              <p className="text-blue-800 dark:text-blue-200 font-medium">{sentimentData.bottomLine}</p>
            </div>
          </div>

          {/* Momentum Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Momentum</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{sentimentData.timeframe}</div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{sentimentData.momentumAnalysis}</p>
            </div>
          </div>

          {/* Recent Developments */}
          {sentimentData.recentDevelopments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Recent Developments</h4>
              </div>
              <div className="space-y-3">
                {sentimentData.recentDevelopments.slice(0, 3).map((dev, index) => (
                  <div key={index} className="border-l-2 border-blue-200 dark:border-blue-700 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dev.development}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(dev.sentiment)} bg-opacity-20`}>
                        {dev.sentiment}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{dev.timestamp} • {dev.source}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 italic">"{dev.evidence}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Positive */}
          {sentimentData.trendingReactions.positive.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-900 dark:text-green-300">Trending Positive</h4>
              </div>
              <div className="space-y-2">
                {sentimentData.trendingReactions.positive.slice(0, 2).map((reaction, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-green-800 dark:text-green-200">{reaction.reaction}</span>
                      <span className="text-xs bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        {reaction.popularity}
                      </span>
                    </div>
                    <div className="text-green-600 dark:text-green-400 text-xs">"{reaction.evidence}"</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{reaction.platform}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Negative */}
          {sentimentData.trendingReactions.negative.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <h4 className="font-medium text-red-900 dark:text-red-300">Trending Negative</h4>
              </div>
              <div className="space-y-2">
                {sentimentData.trendingReactions.negative.slice(0, 2).map((reaction, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-red-800 dark:text-red-200">{reaction.reaction}</span>
                      <span className="text-xs bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                        {reaction.popularity}
                      </span>
                    </div>
                    <div className="text-red-600 dark:text-red-400 text-xs">"{reaction.evidence}"</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{reaction.platform}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Viral Content */}
          {sentimentData.viralContent.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-purple-900 dark:text-purple-300">Viral Content</h4>
              </div>
              <div className="space-y-2">
                {sentimentData.viralContent.slice(0, 2).map((viral, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-purple-800 dark:text-purple-200">{viral.content}</span>
                      <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        {viral.engagement}
                      </span>
                    </div>
                    <div className="text-purple-600 dark:text-purple-400 text-xs">"{viral.quote}"</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{viral.platform}</div>
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
              {/* Breaking Points */}
              {sentimentData.breakingPoints && sentimentData.breakingPoints.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    Breaking Discussion Points
                  </h4>
                  <div className="space-y-3">
                    {sentimentData.breakingPoints.map((item, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle className={`w-4 h-4 ${
                            item.intensity === 'high' ? 'text-red-500' : 
                            item.intensity === 'medium' ? 'text-yellow-500' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            item.intensity === 'high' ? 'text-red-600' : 
                            item.intensity === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {item.intensity.toUpperCase()} INTENSITY
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Discussion Point:</span>
                            <p className="text-gray-700 dark:text-gray-300">{item.point}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Evidence:</span>
                            <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1">
                              <Quote className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
                              <span className="text-sm text-gray-600 dark:text-gray-400 italic">{item.evidence}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {item.platforms.map((platform, platformIndex) => (
                              <span key={platformIndex} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Viral Content */}
              {sentimentData.viralContent && sentimentData.viralContent.length > 2 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-purple-900 dark:text-purple-300">All Viral Content</h4>
                  </div>
                  <div className="space-y-3">
                    {sentimentData.viralContent.map((viral, index) => (
                      <div key={index} className="border border-purple-200 dark:border-purple-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-purple-800 dark:text-purple-200">{viral.content}</span>
                          <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                            {viral.engagement}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 bg-purple-100 dark:bg-purple-800 rounded p-2">
                          <Quote className="w-3 h-3 text-purple-400 mt-1 flex-shrink-0" />
                          <span className="text-sm text-purple-700 dark:text-purple-300 italic">"{viral.quote}"</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{viral.platform}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Momentum Analysis */}
              {sentimentData.momentumAnalysis && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-blue-800 dark:text-blue-200 font-medium">Momentum Analysis:</span>
                      <p className="text-blue-700 dark:text-blue-300 mt-1">{sentimentData.momentumAnalysis}</p>
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
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {source.recency}
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