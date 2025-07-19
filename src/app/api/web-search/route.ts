import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api-config';

// Simple in-memory cache for search results
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Rate limiting - simple in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

function getCacheKey(query: string): string {
  return `search:${query.toLowerCase().trim()}`;
}

export async function POST(req: NextRequest) {
  const { query, mode = 'normal' } = await req.json();

  if (!query) {
    return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
  }

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // Check cache first
  const cacheKey = getCacheKey(query);
  const cachedResult = searchCache.get(cacheKey);
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    return NextResponse.json({ 
      ...cachedResult.data,
      cached: true 
    }, { status: 200 });
  }

  const googleApiKey = await getApiKey('googleApiKey');
  const customSearchEngineId = await getApiKey('customSearchEngineId');

  if (!googleApiKey || !customSearchEngineId) {
    return NextResponse.json(
      { message: 'Google Custom Search API not configured.' },
      { status: 500 }
    );
  }

  // Enhanced search query for recent trending content with current date targeting
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentDay = currentDate.getDate();
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  const yesterdayDate = yesterday.getDate();
  
  let searchQuery;
  if (mode === 'hashtag') {
    // Extract hashtags and search for recent trending discussions
    const hashtags = query.match(/#\w+/g) || [];
    searchQuery = `${hashtags.join(' ')} (site:twitter.com OR site:reddit.com) ("${currentMonth} ${currentDay}" OR "today" OR "yesterday" OR "hours ago" OR "breaking" OR "trending now" OR "${currentYear}")`;
  } else {
    // Normal mode: focus on recent news, trending discussions, what's happening now
    searchQuery = `"${query}" (site:twitter.com OR site:reddit.com OR site:news.ycombinator.com) ("${currentMonth} ${currentDay}" OR "latest news" OR "breaking" OR "trending" OR "today" OR "hours ago" OR "${currentYear}")`;
  }
  
  // Add date range parameter to prioritize recent content
  const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${customSearchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10&sort=date`;

  try {
    const response = await fetch(searchUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Custom Search API Error:', errorText);
      return NextResponse.json(
        {
          message: `Failed to search. API responded with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract and filter for recent trending discussions
    const searchResults = data.items?.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      displayLink: item.displayLink,
      formattedUrl: item.formattedUrl,
      isReddit: item.link.includes('reddit.com'),
      isTwitter: item.link.includes('twitter.com') || item.link.includes('x.com'),
      isNews: item.link.includes('news') || item.link.includes('reuters') || item.link.includes('bbc') || item.link.includes('cnn') || item.link.includes('bloomberg') || item.link.includes('ap.org') || item.link.includes('theguardian'),
      isYoutube: item.link.includes('youtube.com'),
    })).filter((item: any) => {
      // Prioritize very recent content with time indicators
      const recentKeywords = [
        'breaking', 'trending', 'latest', 'hours ago', 'minutes ago', 'today', 
        currentMonth.toLowerCase(), currentDay.toString(), currentYear.toString(),
        'happening now', 'live', 'just in', 'update', 'developing'
      ];
      const hasRecentContent = recentKeywords.some(keyword => 
        item.title.toLowerCase().includes(keyword) || 
        item.snippet.toLowerCase().includes(keyword)
      );
      
      // Score based on recency and platform
      const recentScore = hasRecentContent ? 2 : 0;
      const platformScore = (item.isReddit || item.isTwitter) ? 2 : (item.isNews ? 1 : 0);
      
      // Only include if it has good recency or platform score
      return (recentScore + platformScore) >= 1;
    }).sort((a: any, b: any) => {
      // Sort by recency indicators
      const aRecent = ['breaking', 'trending', 'hours ago', 'today'].some(keyword => 
        a.title.toLowerCase().includes(keyword) || a.snippet.toLowerCase().includes(keyword)
      );
      const bRecent = ['breaking', 'trending', 'hours ago', 'today'].some(keyword => 
        b.title.toLowerCase().includes(keyword) || b.snippet.toLowerCase().includes(keyword)
      );
      
      if (aRecent && !bRecent) return -1;
      if (!aRecent && bRecent) return 1;
      return 0;
    }) || [];

    const responseData = { 
      query,
      results: searchResults,
      searchInformation: {
        totalResults: data.searchInformation?.totalResults || 0,
        searchTime: data.searchInformation?.searchTime || 0,
      },
      cached: false
    };

    // Cache the result
    searchCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error('Error performing web search:', error);
    return NextResponse.json(
      { message: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}