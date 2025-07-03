import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { AnalyticsEngine } from '@/lib/analytics-engine';

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
          recommendationScore: 0,
          peakResponseDay: '',
          averageDaily: 0,
          activeDays: 0,
          responseGrowth: 0,
          ratingTrend: 'stable'
        },
        npsScore: 0,
        npsBreakdown: {
          promoters: 0,
          passives: 0,
          detractors: 0,
          promotersPercent: 0,
          passivesPercent: 0,
          detractorsPercent: 0
        },
        surveys: surveys
      });
    }

    // Collect all responses
    let allResponses: any[] = [];

    for (const survey of surveys) {
      try {
        const responses = await database.getResponsesBySurvey(survey.id);
        
        responses.forEach(response => {
          // Normalize response structure
          let answers = [];
          if (Array.isArray(response.answers)) {
            answers = response.answers;
          } else if (response.answers && typeof response.answers === 'object') {
            answers = Object.values(response.answers);
          } else if (response.answer) {
            answers = Array.isArray(response.answer) ? response.answer : [response.answer];
          }

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

    // Use advanced analytics engine
    const engine = new AnalyticsEngine(allResponses);
    const advancedAnalytics = engine.analyze();

    // Format response to match existing structure
    const analytics = {
      totalResponses: advancedAnalytics.totalResponses,
      averageSatisfaction: advancedAnalytics.averageRating,
      completionRate: advancedAnalytics.completionRate,
      sentiment: {
        basic: {
          positive: advancedAnalytics.sentimentAnalysis.positive,
          neutral: advancedAnalytics.sentimentAnalysis.neutral,
          negative: advancedAnalytics.sentimentAnalysis.negative,
          positivePercentage: advancedAnalytics.sentimentAnalysis.positivePercentage,
          neutralPercentage: advancedAnalytics.sentimentAnalysis.neutralPercentage,
          negativePercentage: advancedAnalytics.sentimentAnalysis.negativePercentage
        }
      },
      responses: allResponses,
      trends: advancedAnalytics.trends,
      insights: {
        mostCommonRating: Math.round(advancedAnalytics.averageRating),
        responseRate: `${advancedAnalytics.completionRate}%`,
        topKeywords: advancedAnalytics.insights.topKeywords,
        recommendationScore: Math.max(0, advancedAnalytics.npsScore + 50), // Convert NPS (-100 to +100) to 0-100 scale
        peakResponseDay: advancedAnalytics.insights.peakResponseDay,
        averageDaily: advancedAnalytics.insights.averageDaily,
        activeDays: advancedAnalytics.insights.activeDays,
        responseGrowth: advancedAnalytics.insights.responseGrowth,
        ratingTrend: advancedAnalytics.insights.ratingTrend
      },
      npsScore: advancedAnalytics.npsScore,
      npsBreakdown: advancedAnalytics.npsBreakdown,
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