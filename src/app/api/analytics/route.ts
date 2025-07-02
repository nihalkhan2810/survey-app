import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId');
    
    if (!surveyId) {
      return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
    }

    // Get survey details
    const survey = await database.findSurveyById(surveyId);
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    // Get all responses for this survey
    const responses = await database.getResponsesBySurvey(surveyId);
    
    // Calculate analytics
    const totalResponses = responses.length;
    
    // Calculate average rating (assuming surveys have rating questions)
    let totalRating = 0;
    let ratingCount = 0;
    
    // Sentiment analysis
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    // Response analysis
    const responseData = responses.map(response => {
      // Ensure answers is an array, handle various data structures
      let answers = [];
      if (Array.isArray(response.answers)) {
        answers = response.answers;
      } else if (response.answers && typeof response.answers === 'object') {
        // If answers is an object, convert to array
        answers = Object.values(response.answers);
      } else if (response.answer) {
        // Some responses might have 'answer' instead of 'answers'
        answers = Array.isArray(response.answer) ? response.answer : [response.answer];
      }
      
      // Calculate ratings
      if (Array.isArray(answers)) {
        answers.forEach((answer: any) => {
          let answerValue = answer;
          
          // Handle nested answer structure
          if (answer && typeof answer === 'object' && answer.answer !== undefined) {
            answerValue = answer.answer;
          }
          
          if (typeof answerValue === 'number' && answerValue >= 1 && answerValue <= 10) {
            totalRating += answerValue;
            ratingCount++;
          }
          
          // Simple sentiment analysis based on rating
          if (typeof answerValue === 'number') {
            if (answerValue >= 7) positiveCount++;
            else if (answerValue >= 4) neutralCount++;
            else negativeCount++;
          } else if (typeof answerValue === 'string') {
            // Simple text sentiment (you can enhance this with actual NLP)
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
      
      return {
        id: response.id,
        submittedAt: response.submitted_at,
        answers: answers
      };
    });
    
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0';
    
    // Calculate completion rate (assuming you track survey views vs submissions)
    const completionRate = totalResponses > 0 ? 85 : 0; // Mock completion rate
    
    // Generate trend data based on actual response dates
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const trendData = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dayResponses = responseData.filter(response => {
        const responseDate = new Date(response.submittedAt || new Date());
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

    // Don't call Gemini from here to avoid loops - frontend will call it separately

    const analytics = {
      survey: {
        id: survey.id,
        topic: survey.topic,
        created_at: survey.created_at,
        start_date: survey.start_date,
        end_date: survey.end_date
      },
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
      responses: responseData,
      trends: trendData,
      insights: {
        mostCommonRating: ratingCount > 0 ? Math.round(totalRating / ratingCount) : 0,
        responseRate: `${completionRate}%`,
        topKeywords: extractKeywords(responseData),
        recommendationScore: totalResponses > 0 ? Math.min(100, (positiveCount / totalResponses) * 100 + 10) : 0
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
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
        
        // Handle nested answer structure
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