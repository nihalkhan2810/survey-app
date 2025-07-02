import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { responses, surveyTopic } = await request.json();
    
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'No responses provided' }, { status: 400 });
    }

    // Extract text responses
    const textResponses = responses
      .flatMap(response => 
        Array.isArray(response.answers) 
          ? response.answers.map(answer => {
              if (typeof answer === 'string') return answer;
              if (answer && typeof answer === 'object' && answer.answer) return answer.answer;
              return null;
            }).filter(Boolean)
          : []
      )
      .filter(text => typeof text === 'string' && text.trim().length > 10);

    if (textResponses.length === 0) {
      return NextResponse.json({
        sentiment: {
          overall: 'neutral',
          confidence: 0,
          breakdown: { positive: 0, neutral: 100, negative: 0 }
        },
        insights: [],
        themes: [],
        recommendations: []
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Analyze the sentiment and provide insights for survey responses about "${surveyTopic}".

Survey Responses:
${textResponses.slice(0, 20).map((response, i) => `${i + 1}. "${response}"`).join('\n')}

Please provide a JSON response with:
1. Overall sentiment analysis (positive/neutral/negative with confidence score)
2. Key themes and topics mentioned
3. Specific insights about satisfaction levels
4. Actionable recommendations for improvement

Format your response as valid JSON:
{
  "sentiment": {
    "overall": "positive|neutral|negative",
    "confidence": 0.85,
    "breakdown": {
      "positive": 60,
      "neutral": 25,
      "negative": 15
    },
    "reasoning": "Brief explanation of the sentiment"
  },
  "themes": [
    {
      "theme": "Theme name",
      "frequency": 12,
      "sentiment": "positive|neutral|negative",
      "examples": ["example quote 1", "example quote 2"]
    }
  ],
  "insights": [
    {
      "category": "Satisfaction|Quality|Service|etc",
      "finding": "Specific insight about this area",
      "impact": "high|medium|low",
      "evidence": ["supporting quote 1", "supporting quote 2"]
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "Specific recommended action",
      "rationale": "Why this recommendation is important",
      "expectedImpact": "What improvement this could bring"
    }
  ]
}

Ensure the response is valid JSON only, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Clean the response text and parse JSON
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      const analysis = JSON.parse(cleanedText);
      
      return NextResponse.json({
        ...analysis,
        totalResponsesAnalyzed: textResponses.length,
        analysisDate: new Date().toISOString()
      });
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      
      // Fallback response if JSON parsing fails
      return NextResponse.json({
        sentiment: {
          overall: 'neutral',
          confidence: 0.5,
          breakdown: { positive: 40, neutral: 40, negative: 20 },
          reasoning: 'AI analysis completed but response formatting failed'
        },
        themes: [
          {
            theme: 'General Feedback',
            frequency: textResponses.length,
            sentiment: 'mixed',
            examples: textResponses.slice(0, 2)
          }
        ],
        insights: [
          {
            category: 'Analysis',
            finding: 'Automated sentiment analysis completed',
            impact: 'medium',
            evidence: []
          }
        ],
        recommendations: [
          {
            priority: 'medium',
            action: 'Review individual responses for detailed insights',
            rationale: 'AI parsing encountered formatting issues',
            expectedImpact: 'Better understanding of feedback'
          }
        ],
        totalResponsesAnalyzed: textResponses.length,
        analysisDate: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Gemini sentiment analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}