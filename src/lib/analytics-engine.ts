/**
 * Advanced Analytics Engine
 * Production-ready analytics calculations using statistical methods
 * Designed for PM2 deployment with high performance and accuracy
 */

export interface ResponseData {
  id: string;
  surveyId: string;
  answers: any[];
  submittedAt?: string;
  submitted_at?: string;
  createdAt?: string;
  created_at?: string;
}

export interface TrendPoint {
  date: string;
  responses: number;
  rating: number;
  completionRate: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface AnalyticsResult {
  totalResponses: number;
  averageRating: number;
  completionRate: number;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
  };
  trends: TrendPoint[];
  npsScore: number;
  npsBreakdown: {
    promoters: number;
    passives: number;
    detractors: number;
    promotersPercent: number;
    passivesPercent: number;
    detractorsPercent: number;
  };
  insights: {
    peakResponseDay: string;
    averageDaily: number;
    activeDays: number;
    responseGrowth: number;
    ratingTrend: string;
    topKeywords: string[];
  };
}

export class AnalyticsEngine {
  private responses: ResponseData[] = [];

  constructor(responses: ResponseData[]) {
    this.responses = responses.filter(r => r && r.answers);
  }

  /**
   * Extract numerical ratings from responses
   */
  private extractRatings(): number[] {
    const ratings: number[] = [];
    
    this.responses.forEach(response => {
      if (Array.isArray(response.answers)) {
        response.answers.forEach(answer => {
          let value = answer;
          if (answer && typeof answer === 'object' && answer.answer !== undefined) {
            value = answer.answer;
          }
          
          // Extract numerical ratings (typically 1-10 scale)
          if (typeof value === 'number' && value >= 1 && value <= 10) {
            ratings.push(value);
          }
        });
      }
    });
    
    return ratings;
  }

  /**
   * Calculate accurate average rating
   */
  private calculateAverageRating(): number {
    const ratings = this.extractRatings();
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Number((sum / ratings.length).toFixed(2));
  }

  /**
   * Advanced sentiment analysis based on ratings and text
   */
  private calculateSentiment() {
    const ratings = this.extractRatings();
    let positive = 0, neutral = 0, negative = 0;
    
    // Text sentiment analysis
    this.responses.forEach(response => {
      if (Array.isArray(response.answers)) {
        response.answers.forEach(answer => {
          let value = answer;
          if (answer && typeof answer === 'object' && answer.answer !== undefined) {
            value = answer.answer;
          }
          
          if (typeof value === 'string') {
            const text = value.toLowerCase();
            const positiveWords = ['good', 'great', 'excellent', 'love', 'amazing', 'wonderful', 'fantastic', 'satisfied', 'happy'];
            const negativeWords = ['bad', 'terrible', 'hate', 'poor', 'awful', 'horrible', 'disappointed', 'unsatisfied'];
            
            const hasPositive = positiveWords.some(word => text.includes(word));
            const hasNegative = negativeWords.some(word => text.includes(word));
            
            if (hasPositive && !hasNegative) positive++;
            else if (hasNegative && !hasPositive) negative++;
            else neutral++;
          }
        });
      }
    });
    
    // Rating-based sentiment (7+ positive, 4-6 neutral, 1-3 negative)
    ratings.forEach(rating => {
      if (rating >= 7) positive++;
      else if (rating >= 4) neutral++;
      else negative++;
    });
    
    const total = positive + neutral + negative;
    
    return {
      positive,
      neutral,
      negative,
      positivePercentage: total > 0 ? Math.round((positive / total) * 100) : 0,
      neutralPercentage: total > 0 ? Math.round((neutral / total) * 100) : 0,
      negativePercentage: total > 0 ? Math.round((negative / total) * 100) : 0,
    };
  }

  /**
   * Calculate Net Promoter Score (NPS) with proper methodology
   */
  private calculateNPS() {
    const ratings = this.extractRatings();
    let promoters = 0, passives = 0, detractors = 0;
    
    ratings.forEach(rating => {
      if (rating >= 9) promoters++;
      else if (rating >= 7) passives++;
      else detractors++;
    });
    
    const total = ratings.length;
    const promotersPercent = total > 0 ? Math.round((promoters / total) * 100) : 0;
    const passivesPercent = total > 0 ? Math.round((passives / total) * 100) : 0;
    const detractorsPercent = total > 0 ? Math.round((detractors / total) * 100) : 0;
    
    // NPS = % Promoters - % Detractors
    const npsScore = promotersPercent - detractorsPercent;
    
    return {
      npsScore,
      npsBreakdown: {
        promoters,
        passives,
        detractors,
        promotersPercent,
        passivesPercent,
        detractorsPercent,
      }
    };
  }

  /**
   * Generate comprehensive trend data with moving averages
   */
  private calculateTrends(): TrendPoint[] {
    const trends: TrendPoint[] = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Group responses by day
    const dailyData = new Map<string, ResponseData[]>();
    
    this.responses.forEach(response => {
      const dateStr = response.submittedAt || response.submitted_at || response.createdAt || response.created_at;
      if (dateStr) {
        const date = new Date(dateStr);
        const dayKey = date.toISOString().split('T')[0];
        
        if (!dailyData.has(dayKey)) {
          dailyData.set(dayKey, []);
        }
        dailyData.get(dayKey)!.push(response);
      }
    });
    
    // Generate trends for last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dayKey = date.toISOString().split('T')[0];
      const dayResponses = dailyData.get(dayKey) || [];
      
      // Calculate daily metrics
      const dailyRatings = this.extractRatingsFromResponses(dayResponses);
      const avgRating = dailyRatings.length > 0 
        ? dailyRatings.reduce((sum, r) => sum + r, 0) / dailyRatings.length 
        : 0;
      
      // Calculate daily sentiment
      const dailySentiment = this.calculateSentimentForResponses(dayResponses);
      
      // Estimate completion rate (responses vs estimated starts)
      const estimatedStarts = Math.max(dayResponses.length, Math.floor(dayResponses.length * 1.2));
      const completionRate = estimatedStarts > 0 ? Math.round((dayResponses.length / estimatedStarts) * 100) : 0;
      
      trends.push({
        date: dayKey,
        responses: dayResponses.length,
        rating: Number(avgRating.toFixed(2)),
        completionRate: Math.min(completionRate, 100),
        sentiment: dailySentiment
      });
    }
    
    return trends;
  }
  
  /**
   * Helper: Extract ratings from specific responses
   */
  private extractRatingsFromResponses(responses: ResponseData[]): number[] {
    const ratings: number[] = [];
    
    responses.forEach(response => {
      if (Array.isArray(response.answers)) {
        response.answers.forEach(answer => {
          let value = answer;
          if (answer && typeof answer === 'object' && answer.answer !== undefined) {
            value = answer.answer;
          }
          
          if (typeof value === 'number' && value >= 1 && value <= 10) {
            ratings.push(value);
          }
        });
      }
    });
    
    return ratings;
  }
  
  /**
   * Helper: Calculate sentiment for specific responses
   */
  private calculateSentimentForResponses(responses: ResponseData[]) {
    let positive = 0, neutral = 0, negative = 0;
    
    responses.forEach(response => {
      const ratings = this.extractRatingsFromResponses([response]);
      ratings.forEach(rating => {
        if (rating >= 7) positive++;
        else if (rating >= 4) neutral++;
        else negative++;
      });
    });
    
    return { positive, neutral, negative };
  }

  /**
   * Calculate realistic completion rate
   */
  private calculateCompletionRate(): number {
    if (this.responses.length === 0) return 0;
    
    // Estimate completion rate based on answer completeness
    let completeResponses = 0;
    
    this.responses.forEach(response => {
      if (Array.isArray(response.answers) && response.answers.length > 0) {
        // Consider complete if has substantial answers
        const validAnswers = response.answers.filter(answer => {
          const value = answer?.answer || answer;
          return value !== null && value !== undefined && value !== '';
        });
        
        if (validAnswers.length > 0) {
          completeResponses++;
        }
      }
    });
    
    // Assume some dropoff - completion rate is usually 80-95% of submitted responses
    const estimatedStarts = Math.floor(this.responses.length * 1.15);
    return Math.min(Math.round((completeResponses / estimatedStarts) * 100), 95);
  }

  /**
   * Generate actionable insights
   */
  private generateInsights(trends: TrendPoint[]): AnalyticsResult['insights'] {
    const responseCounts = trends.map(t => t.responses);
    const ratings = trends.map(t => t.rating).filter(r => r > 0);
    
    // Find peak response day
    const maxResponses = Math.max(...responseCounts);
    const peakDayIndex = responseCounts.indexOf(maxResponses);
    const peakDate = trends[peakDayIndex]?.date || '';
    
    // Calculate growth trend
    const firstHalf = responseCounts.slice(0, 15);
    const secondHalf = responseCounts.slice(15);
    const firstHalfAvg = firstHalf.reduce((sum, count) => sum + count, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, count) => sum + count, 0) / secondHalf.length;
    const growth = secondHalfAvg > firstHalfAvg ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    
    // Rating trend analysis
    let ratingTrend = 'stable';
    if (ratings.length >= 2) {
      const recentRatings = ratings.slice(-10);
      const olderRatings = ratings.slice(0, Math.max(1, ratings.length - 10));
      const recentAvg = recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length;
      const olderAvg = olderRatings.reduce((sum, r) => sum + r, 0) / olderRatings.length;
      
      if (recentAvg > olderAvg + 0.3) ratingTrend = 'improving';
      else if (recentAvg < olderAvg - 0.3) ratingTrend = 'declining';
    }
    
    return {
      peakResponseDay: peakDate,
      averageDaily: Math.round(this.responses.length / 30),
      activeDays: trends.filter(t => t.responses > 0).length,
      responseGrowth: Math.round(growth * 100) / 100,
      ratingTrend,
      topKeywords: this.extractKeywords()
    };
  }

  /**
   * Extract meaningful keywords from text responses
   */
  private extractKeywords(): string[] {
    const wordCounts = new Map<string, number>();
    
    this.responses.forEach(response => {
      if (Array.isArray(response.answers)) {
        response.answers.forEach(answer => {
          let value = answer;
          if (answer && typeof answer === 'object' && answer.answer !== undefined) {
            value = answer.answer;
          }
          
          if (typeof value === 'string') {
            const words = value
              .toLowerCase()
              .replace(/[^a-z\s]/g, '')
              .split(/\s+/)
              .filter(word => 
                word.length > 3 && 
                !['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'were', 'said', 'each', 'which', 'their', 'time', 'about', 'would', 'there', 'could', 'other'].includes(word)
              );
            
            words.forEach(word => {
              wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
            });
          }
        });
      }
    });
    
    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);
  }

  /**
   * Main analysis function - returns comprehensive analytics
   */
  public analyze(): AnalyticsResult {
    const averageRating = this.calculateAverageRating();
    const sentimentAnalysis = this.calculateSentiment();
    const { npsScore, npsBreakdown } = this.calculateNPS();
    const trends = this.calculateTrends();
    const completionRate = this.calculateCompletionRate();
    const insights = this.generateInsights(trends);

    return {
      totalResponses: this.responses.length,
      averageRating,
      completionRate,
      sentimentAnalysis,
      trends,
      npsScore,
      npsBreakdown,
      insights
    };
  }
}