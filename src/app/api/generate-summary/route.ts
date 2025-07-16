import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api-config';

// Simple in-memory cache for summaries
const summaryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests per minute (more restrictive due to AI usage)
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
  return `summary:${query.toLowerCase().trim()}:${resultsHash}`;
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
  const cachedResult = summaryCache.get(cacheKey);
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

  // Prepare search results for AI processing
  const searchContext = searchResults.map((result: any, index: number) => 
    `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.displayLink}\n`
  ).join('\n');

  const prompt = `You are an expert at analyzing web search results and creating concise, accurate TL;DR summaries. Your task is to analyze the provided search results and create a comprehensive yet concise summary about the topic.

Search Query: "${query}"

Search Results:
${searchContext}

Please provide a response in the following JSON format:
{
  "summary": "A comprehensive 2-3 sentence TL;DR summary of the key information found about the topic",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "sources": [
    {
      "title": "Source title",
      "url": "source url",
      "credibility": "high/medium/low"
    }
  ],
  "confidence": "high/medium/low",
  "lastUpdated": "Information about when this information was last updated or if it's current",
  "additionalContext": "Any important context, disclaimers, or conflicting information found"
}

Guidelines:
- Focus on factual information from the search results
- Highlight the most recent and relevant information
- Include disclaimers for speculative or unconfirmed information
- Assess source credibility based on the domains and content quality
- Keep the summary concise but informative
- If information is conflicting or unclear, mention this in additionalContext
- Include up to 5 key points and up to 5 most relevant sources

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
          message: `Failed to generate summary. API responded with status ${response.status}`,
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
      generatedAt: new Date().toISOString(),
      cached: false
    };

    // Cache the result
    summaryCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { message: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}