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

  // Enhanced search query based on mode
  let searchQuery;
  if (mode === 'hashtag') {
    // Extract hashtags and search for social media discussions
    const hashtags = query.match(/#\w+/g) || [];
    searchQuery = `${hashtags.join(' ')} twitter reddit comments discussions`;
  } else {
    // Normal mode: focus on comments, opinions, and social discussions
    searchQuery = `${query} reddit twitter comments discussions opinions thoughts`;
  }
  
  const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${customSearchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`;

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
    
    // Extract and filter for social media comments and discussions
    const searchResults = data.items?.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      displayLink: item.displayLink,
      formattedUrl: item.formattedUrl,
      isReddit: item.link.includes('reddit.com'),
      isTwitter: item.link.includes('twitter.com') || item.link.includes('x.com'),
      isYouTube: item.link.includes('youtube.com'),
    })).filter((item: any) => {
      // Prioritize social media discussions and user comments
      const socialKeywords = ['comments', 'discussion', 'opinion', 'thoughts', 'users say', 'fans', 'thread', 'post'];
      const hasSocialContent = socialKeywords.some(keyword => 
        item.title.toLowerCase().includes(keyword) || 
        item.snippet.toLowerCase().includes(keyword)
      );
      // Always include Reddit, Twitter, and social content
      return item.isReddit || item.isTwitter || item.isYouTube || hasSocialContent;
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