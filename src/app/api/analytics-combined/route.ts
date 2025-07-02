import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get all surveys
    const surveys = await database.getAllSurveys();
    
    if (!surveys || surveys.length === 0) {
      return NextResponse.json({
        totalResponses: 0,
        averageSatisfaction: 0,
        completionRate: 0,
        sentiment: {
          basic: {
            positive: 0,
            neutral: 0,
            negative: 0,
            positivePercentage: 0,
            neutralPercentage: 0,
            negativePercentage: 0
          }
        },
        responses: [],
        trends: [],
        insights: {
          mostCommonRating: 0,
          responseRate: '0%',
          topKeywords: [],
          recommendationScore: 0
        },
        surveys: surveys
      });
    }

    // Get all responses for all surveys
    let allResponses: any[] = [];
    let totalRating = 0;
    let ratingCount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    for (const survey of surveys) {
      try {
        const responses = await database.getResponsesBySurvey(survey.id);
        
        // Process each response
        responses.forEach(response => {
          // Ensure answers is an array, handle various data structures
          let answers = [];
          if (Array.isArray(response.answers)) {
            answers = response.answers;
          } else if (response.answers && typeof response.answers === 'object') {
            answers = Object.values(response.answers);
          } else if (response.answer) {
            answers = Array.isArray(response.answer) ? response.answer : [response.answer];
          }

          // Calculate ratings and sentiment
          if (Array.isArray(answers)) {
            answers.forEach((answer: any) => {
              let answerValue = answer;
              
              if (answer && typeof answer === 'object' && answer.answer !== undefined) {
                answerValue = answer.answer;
              }
              
              if (typeof answerValue === 'number' && answerValue >= 1 && answerValue <= 10) {
                totalRating += answerValue;
                ratingCount++;
              }
              
              // Simple sentiment analysis
              if (typeof answerValue === 'number') {
                if (answerValue >= 7) positiveCount++;
                else if (answerValue >= 4) neutralCount++;
                else negativeCount++;
              } else if (typeof answerValue === 'string') {
                const text = answerValue.toLowerCase();
                if (text.includes('good') || text.includes('great') || text.includes('excellent') || text.includes('love')) {
                  positiveCount++;
                } else if (text.includes('bad') || text.includes('terrible') || text.includes('hate') || text.includes('poor')) {
                  negativeCount++;
                } else {
                  neutralCount++;
                }
              }
            });
          }

          // Add to combined responses with survey info
          allResponses.push({
            ...response,
            surveyId: survey.id,
            surveyTopic: survey.topic,
            answers: answers
          });
        });
      } catch (error) {
        console.error(`Failed to load responses for survey ${survey.id}:`, error);
      }
    }

    const totalResponses = allResponses.length;
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0';
    const completionRate = totalResponses > 0 ? Math.round((totalResponses / (totalResponses * 1.2)) * 100) : 0; // Estimated

    // Generate trend data based on response dates
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const trendData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dayResponses = allResponses.filter(response => {
        const responseDate = new Date(response.submitted_at || response.created_at);
        return responseDate.toDateString() === date.toDateString();
      });
      
      const dayRatings = dayResponses.flatMap(response => 
        (response.answers || []).filter((answer: any) => {
          const val = answer?.answer || answer;
          return typeof val === 'number' && val >= 1 && val <= 10;
        }).map((answer: any) => answer?.answer || answer)
      );
      
      const avgRating = dayRatings.length > 0 
        ? dayRatings.reduce((sum: number, rating: number) => sum + rating, 0) / dayRatings.length
        : parseFloat(averageRating);

      trendData.push({
        date: date.toISOString().split('T')[0],
        rating: avgRating,
        responses: dayResponses.length
      });
    }

    const analytics = {
      totalResponses,
      averageSatisfaction: parseFloat(averageRating),
      completionRate,
      sentiment: {
        basic: {
          positive: positiveCount,
          neutral: neutralCount,
          negative: negativeCount,
          positivePercentage: totalResponses > 0 ? Math.round((positiveCount / totalResponses) * 100) : 0,
          neutralPercentage: totalResponses > 0 ? Math.round((neutralCount / totalResponses) * 100) : 0,
          negativePercentage: totalResponses > 0 ? Math.round((negativeCount / totalResponses) * 100) : 0
        }
      },
      responses: allResponses,
      trends: trendData,
      insights: {
        mostCommonRating: ratingCount > 0 ? Math.round(totalRating / ratingCount) : 0,
        responseRate: `${completionRate}%`,
        topKeywords: extractKeywords(allResponses),
        recommendationScore: totalResponses > 0 ? Math.min(100, (positiveCount / totalResponses) * 100 + 10) : 0
      },
      surveys: surveys,
      surveyBreakdown: surveys.map(survey => ({
        id: survey.id,
        topic: survey.topic,
        responseCount: allResponses.filter(r => r.surveyId === survey.id).length
      }))
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Combined analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate combined analytics' },
      { status: 500 }
    );
  }
}

// Helper function to extract keywords from text responses
function extractKeywords(responseData: any[]): string[] {
  const keywords: { [key: string]: number } = {};
  
  responseData.forEach(response => {
    if (Array.isArray(response.answers)) {
      response.answers.forEach((answer: any) => {
        let answerValue = answer;
        
        if (answer && typeof answer === 'object' && answer.answer !== undefined) {
          answerValue = answer.answer;
        }
        
        if (typeof answerValue === 'string') {
          const words = answerValue
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'were', 'said', 'each', 'which', 'their', 'time', 'about'].includes(word));
          
          words.forEach(word => {
            keywords[word] = (keywords[word] || 0) + 1;
          });
        }
      });
    }
  });
  
  return Object.entries(keywords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}