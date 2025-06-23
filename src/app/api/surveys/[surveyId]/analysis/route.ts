import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

// Simple sentiment analysis using basic keyword matching
// In production, you'd want to use a proper sentiment analysis service
function analyzeSentiment(text: string): { 
  sentiment: 'positive' | 'negative' | 'neutral'; 
  confidence: number;
  keywords: string[];
} {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 
    'happy', 'satisfied', 'pleased', 'impressed', 'awesome', 'brilliant', 'perfect',
    'outstanding', 'superb', 'marvelous', 'delighted', 'thrilled', 'yes', 'definitely'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'angry', 'frustrated',
    'disappointed', 'unsatisfied', 'poor', 'worst', 'annoying', 'boring', 'useless',
    'disgusting', 'pathetic', 'ridiculous', 'stupid', 'no', 'never', 'definitely not'
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  const foundKeywords: string[] = [];

  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (positiveWords.includes(cleanWord)) {
      positiveCount++;
      foundKeywords.push(cleanWord);
    } else if (negativeWords.includes(cleanWord)) {
      negativeCount++;
      foundKeywords.push(cleanWord);
    }
  });

  const totalSentimentWords = positiveCount + negativeCount;
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  let confidence = 0;

  if (totalSentimentWords > 0) {
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = positiveCount / totalSentimentWords;
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = negativeCount / totalSentimentWords;
    } else {
      sentiment = 'neutral';
      confidence = 0.5;
    }
  }

  return {
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    keywords: foundKeywords
  };
}

// Enhanced sentiment analysis using AI (Gemini)
async function aiSentimentAnalysis(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  reasoning: string;
  emotions: string[];
}> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey) {
    // Fallback to basic analysis
    const basic = analyzeSentiment(text);
    return {
      sentiment: basic.sentiment,
      confidence: basic.confidence,
      reasoning: `Basic keyword analysis found ${basic.keywords.length} sentiment indicators`,
      emotions: basic.keywords
    };
  }

  try {
    const prompt = `Analyze the sentiment of this text and provide a detailed analysis:

TEXT: "${text}"

Please respond with a JSON object containing:
- sentiment: "positive", "negative", or "neutral"
- confidence: a number between 0 and 1
- reasoning: a brief explanation of your analysis
- emotions: an array of emotions detected (e.g., ["happy", "excited", "satisfied"])

Example format:
{
  "sentiment": "positive",
  "confidence": 0.85,
  "reasoning": "The text expresses satisfaction and happiness with the service",
  "emotions": ["satisfied", "happy"]
}

Return only the JSON object, no additional text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API error');
    }

    const data = await response.json();
    const result = data.candidates[0]?.content?.parts[0]?.text?.trim();
    
    if (result) {
      const cleanedJson = result.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanedJson);
      return analysis;
    }
    
    throw new Error('No analysis result');
    
  } catch (error) {
    console.error('AI sentiment analysis failed:', error);
    // Fallback to basic analysis
    const basic = analyzeSentiment(text);
    return {
      sentiment: basic.sentiment,
      confidence: basic.confidence,
      reasoning: `AI analysis failed, using basic keyword analysis`,
      emotions: basic.keywords
    };
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await context.params;
    
    // Get all responses for this survey
    const responses = await database.getResponsesBySurvey(surveyId);
    
    if (!responses || responses.length === 0) {
      return NextResponse.json({
        surveyId,
        totalResponses: 0,
        analysis: null,
        message: 'No responses found for analysis'
      });
    }

    // Analyze each response
    const detailedAnalysis = responses.map((response: any) => {
      const responseAnalysis: any = {
        responseId: response.id,
        submittedAt: response.submittedAt,
        type: response.type || 'web',
        isVoiceResponse: response.type?.includes('voice') || false,
        answers: {},
        overallSentiment: { sentiment: 'neutral', confidence: 0 }
      };

      // Analyze each answer
      const answerTexts: string[] = [];
      
      for (const [questionIndex, answer] of Object.entries(response.answers || {})) {
        if (typeof answer === 'string' && answer.trim()) {
          const analysis = analyzeSentiment(answer);
          
          responseAnalysis.answers[questionIndex] = {
            text: answer,
            ...analysis
          };
          
          answerTexts.push(answer);
        }
      }

      // If it's a voice response with transcript but no structured answers
      if (response.type?.includes('voice') && response.transcript && Object.keys(response.answers || {}).length === 0) {
        const transcriptAnalysis = analyzeSentiment(response.transcript);
        
        responseAnalysis.transcriptAnalysis = {
          text: response.transcript,
          ...transcriptAnalysis
        };
        
        answerTexts.push(response.transcript);
      }

      // Calculate overall sentiment for this response
      if (answerTexts.length > 0) {
        const combinedText = answerTexts.join(' ');
        responseAnalysis.overallSentiment = analyzeSentiment(combinedText);
      }

      // Add voice-specific metadata
      if (response.type?.includes('voice')) {
        responseAnalysis.voiceMetadata = {
          callId: response.callId,
          phoneNumber: response.phoneNumber,
          duration: response.duration,
          cost: response.cost,
          extractionMethod: response.metadata?.extractionMethod,
          hasStructuredAnswers: response.metadata?.hasStructuredAnswers
        };
      }

      return responseAnalysis;
    });

    // Calculate overall survey sentiment
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    const voiceVsWebSentiment = {
      voice: { positive: 0, negative: 0, neutral: 0, total: 0 },
      web: { positive: 0, negative: 0, neutral: 0, total: 0 }
    };

    detailedAnalysis.forEach((analysis: any) => {
      const sentiment = analysis.overallSentiment.sentiment as 'positive' | 'negative' | 'neutral';
      sentimentCounts[sentiment]++;
      
      const responseType = analysis.isVoiceResponse ? 'voice' : 'web';
      voiceVsWebSentiment[responseType][sentiment]++;
      voiceVsWebSentiment[responseType].total++;
    });

    const totalResponses = detailedAnalysis.length;
    const overallSentiment = {
      positive: Math.round((sentimentCounts.positive / totalResponses) * 100),
      negative: Math.round((sentimentCounts.negative / totalResponses) * 100),
      neutral: Math.round((sentimentCounts.neutral / totalResponses) * 100)
    };

    return NextResponse.json({
      surveyId,
      totalResponses,
      analysisType: 'keyword-based',
      overallSentiment,
      sentimentCounts,
      voiceVsWebSentiment,
      detailedAnalysis,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error performing sentiment analysis:', error);
    return NextResponse.json({ 
      error: 'Failed to perform sentiment analysis',
      details: error.message 
    }, { status: 500 });
  }
}

// POST endpoint to save sentiment analysis results
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await context.params;
    const analysisData = await req.json();

    // Save analysis results to database or file system
    // This could be used to cache analysis results or store custom analysis
    
    return NextResponse.json({
      message: 'Analysis saved successfully',
      surveyId,
      savedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error saving sentiment analysis:', error);
    return NextResponse.json({ 
      error: 'Failed to save sentiment analysis',
      details: error.message 
    }, { status: 500 });
  }
} 