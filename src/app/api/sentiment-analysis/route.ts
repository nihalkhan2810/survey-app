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

  const prompt = `You are an expert social media sentiment analyst specializing in analyzing real user comments, discussions, and opinions from platforms like Reddit, Twitter, and social media. Your task is to analyze what people are actually saying and provide insights based on genuine user sentiment.

Search Query: "${query}"

Social Media Comments and Discussions:
${reviewContext}

Please provide a response in the following JSON format:
{
  "overallSentiment": "positive/negative/neutral/mixed",
  "sentimentScore": 0.75,
  "generalOpinion": "2-3 sentence summary of what users generally think about this product/topic",
  "sentimentBreakdown": {
    "positive": 60,
    "negative": 20,
    "neutral": 20
  },
  "claimsVsReality": [
    {
      "claim": "Marketing claim or expectation",
      "reality": "What users actually experience",
      "verdict": "accurate/exaggerated/false",
      "evidence": ["Quote from user review", "Another supporting quote"],
      "sources": ["Source title 1", "Source title 2"]
    }
  ],
  "keyFindings": [
    {
      "finding": "Major insight about the product/topic",
      "evidence": "Supporting quote or data",
      "source": "Source title",
      "impact": "high/medium/low"
    }
  ],
  "prosAndCons": {
    "pros": [
      {
        "point": "What users love",
        "frequency": "how often mentioned",
        "evidence": "Supporting quote",
        "source": "Source"
      }
    ],
    "cons": [
      {
        "point": "What users complain about",
        "frequency": "how often mentioned", 
        "evidence": "Supporting quote",
        "source": "Source"
      }
    ]
  },
  "trendAnalysis": "Analysis of whether sentiment is improving or declining over time",
  "credibilityAssessment": "Assessment of source credibility and potential bias",
  "recommendationScore": 7.5,
  "bottomLine": "Clear, actionable conclusion based on user sentiment",
  "sources": [
    {
      "title": "Source title",
      "url": "source url",
      "platform": "reddit/twitter/review_site/other",
      "sentiment": "positive/negative/neutral",
      "credibility": "high/medium/low",
      "keyQuote": "Most relevant quote from this source"
    }
  ]
}

Guidelines:
- Focus on extracting genuine user opinions and experiences
- Distinguish between promotional content and authentic reviews
- Look for patterns in what users love, hate, or are neutral about
- Consider the source platform (Reddit tends to be more critical, Twitter more brief)
- Sentiment score should be between -1 (very negative) and 1 (very positive)
- Recommendation score should be 1-10 based on overall user sentiment
- Identify specific themes users discuss (price, quality, customer service, etc.)
- Include representative quotes that capture the sentiment
- Assess if reviews seem genuine or potentially fake/biased
- Note any trending opinions or changes in sentiment over time

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