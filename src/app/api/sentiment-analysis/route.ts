import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api-config';

// Simple in-memory cache for sentiment analysis
const sentimentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests per minute
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

function getCacheKey(query: string, resultsHash: string): string {
  return `sentiment:${query.toLowerCase().trim()}:${resultsHash}`;
}

function hashSearchResults(results: any[]): string {
  return results.map(r => r.title + r.snippet).join('').slice(0, 100);
}

export async function POST(req: NextRequest) {
  const { query, searchResults } = await req.json();

  if (!query || !searchResults || !Array.isArray(searchResults)) {
    return NextResponse.json({ message: 'Query and search results are required' }, { status: 400 });
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
  const resultsHash = hashSearchResults(searchResults);
  const cacheKey = getCacheKey(query, resultsHash);
  const cachedResult = sentimentCache.get(cacheKey);
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    return NextResponse.json({ 
      ...cachedResult.data,
      cached: true 
    }, { status: 200 });
  }

  const geminiApiKey = await getApiKey('geminiApiKey');

  if (!geminiApiKey) {
    return NextResponse.json(
      { message: 'Gemini API key not configured.' },
      { status: 500 }
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

  // Prepare search results for sentiment analysis
  const reviewContext = searchResults.map((result: any, index: number) => 
    `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.displayLink} ${result.isReddit ? '(Reddit)' : ''} ${result.isTwitter ? '(Twitter/X)' : ''}\n`
  ).join('\n');

  const prompt = `You are a real-time social media trend analyst specializing in analyzing what's happening RIGHT NOW across platforms like Twitter, Reddit, and news sources. Your task is to provide a snapshot of current discussions, trending topics, and what people are actively talking about TODAY.

Search Query: "${query}"

Recent Discussions and Trending Content:
${reviewContext}

Please provide a response in the following JSON format focused on CURRENT activity:
{
  "overallSentiment": "positive/negative/neutral/mixed",
  "sentimentScore": 0.75,
  "whatsHappening": "2-3 sentence summary of what's trending or happening RIGHT NOW about this topic",
  "recentDevelopments": [
    {
      "development": "Recent news, update, or trending discussion",
      "timestamp": "when this is happening (today, hours ago, etc)",
      "sentiment": "positive/negative/neutral",
      "source": "where this is trending",
      "evidence": "Key quotes or reactions"
    }
  ],
  "trendingReactions": {
    "positive": [
      {
        "reaction": "What people are excited/positive about",
        "popularity": "high/medium/low",
        "evidence": "Recent quote or example",
        "platform": "twitter/reddit/news"
      }
    ],
    "negative": [
      {
        "reaction": "What people are upset/concerned about", 
        "popularity": "high/medium/low",
        "evidence": "Recent quote or example",
        "platform": "twitter/reddit/news"
      }
    ]
  },
  "breakingPoints": [
    {
      "point": "Key discussion point or controversy",
      "intensity": "high/medium/low",
      "evidence": "Supporting quotes from recent posts",
      "platforms": ["twitter", "reddit"]
    }
  ],
  "momentumAnalysis": "Is this topic gaining or losing momentum? Is it trending up or down?",
  "timeframe": "When this activity is happening (last 24 hours, today, this week)",
  "viralContent": [
    {
      "content": "What specific posts, threads, or news are going viral",
      "platform": "twitter/reddit/news",
      "engagement": "high/medium/low",
      "quote": "Key viral quote or headline"
    }
  ],
  "bottomLine": "What's the current state and direction of this topic",
  "sources": [
    {
      "title": "Source title", 
      "url": "source url",
      "platform": "twitter/reddit/news",
      "recency": "how recent (today, hours ago, etc)",
      "sentiment": "positive/negative/neutral",
      "keyQuote": "Most relevant recent quote"
    }
  ]
}

Guidelines:
- Focus on RECENT activity and current trends (what's happening now, not historical overview)
- Identify breaking news, viral posts, trending discussions happening TODAY
- Distinguish between ongoing conversations vs new developments
- Look for momentum - is this topic gaining steam or dying down?
- Prioritize recent quotes and reactions over older content
- Consider platform dynamics (Twitter for breaking news, Reddit for discussions)
- Sentiment score should reflect CURRENT mood, not historical sentiment
- Focus on what's viral, trending, or generating buzz right now
- Include timestamps and recency indicators when possible
- Capture the pulse of social media conversations happening in real-time
- Identify controversy, breaking points, or viral moments
- Note if this is a developing story or ongoing trend

Do not include any extra text, markdown, or explanation outside of the single JSON object.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json(
        {
          message: `Failed to analyze sentiment. API responded with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    const parsedContent = JSON.parse(content);

    const responseData = { 
      query,
      ...parsedContent,
      analyzedAt: new Date().toISOString(),
      cached: false
    };

    // Cache the result
    sentimentCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json(
      { message: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}