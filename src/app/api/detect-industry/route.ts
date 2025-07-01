import { NextRequest, NextResponse } from 'next/server';
import { industryConfigs } from '@/lib/industry-config';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    // Simple keyword-based industry detection
    // In a real implementation, this would use a more sophisticated AI model
    const topicLower = topic.toLowerCase();
    
    const industryKeywords = {
      education: [
        'professor', 'teacher', 'student', 'course', 'class', 'lecture', 'academic', 
        'university', 'college', 'school', 'curriculum', 'learning', 'exam', 'grade',
        'semester', 'campus', 'faculty', 'education', 'classroom', 'homework'
      ],
      employee: [
        'employee', 'team', 'manager', 'workplace', 'office', 'performance', 'productivity',
        'staff', 'colleague', 'supervisor', 'department', 'company', 'work', 'job',
        'career', 'review', 'feedback', 'collaboration', 'leadership', 'culture'
      ],
      customer: [
        'customer', 'client', 'product', 'service', 'purchase', 'buying', 'satisfaction',
        'quality', 'support', 'experience', 'user', 'consumer', 'sales', 'business',
        'price', 'value', 'recommendation', 'review', 'rating', 'loyalty'
      ],
      community: [
        'community', 'public', 'citizen', 'local', 'neighborhood', 'city', 'town',
        'government', 'municipal', 'civic', 'initiative', 'project', 'development',
        'infrastructure', 'services', 'residents', 'district', 'council', 'policy'
      ],
      public: [
        'poll', 'opinion', 'political', 'election', 'vote', 'candidate', 'policy',
        'government', 'politics', 'democratic', 'survey', 'demographic', 'population',
        'public opinion', 'constituency', 'referendum', 'ballot', 'campaign'
      ],
      event: [
        'event', 'conference', 'meeting', 'workshop', 'seminar', 'symposium', 'convention',
        'expo', 'forum', 'summit', 'gathering', 'session', 'presentation', 'speaker',
        'attendee', 'venue', 'program', 'agenda', 'networking', 'training'
      ],
      healthcare: [
        'patient', 'doctor', 'medical', 'health', 'care', 'treatment', 'hospital',
        'clinic', 'nurse', 'physician', 'healthcare', 'medicine', 'therapy',
        'diagnosis', 'wellness', 'provider', 'clinical', 'surgery', 'appointment'
      ]
    };

    // Calculate scores for each industry
    const scores: Record<string, number> = {};
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (topicLower.includes(keyword)) {
          // Give higher weight to exact matches vs partial matches
          const exactMatch = topicLower.split(/\s+/).includes(keyword);
          score += exactMatch ? 2 : 1;
        }
      }
      scores[industry] = score;
    }

    // Find the industry with the highest score
    const detectedIndustry = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    // Calculate confidence based on score difference
    const maxScore = scores[detectedIndustry];
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    // If no keywords matched, default to education with low confidence
    if (maxScore === 0) {
      return NextResponse.json({
        industry: 'education',
        confidence: 0.1,
        scores
      });
    }

    // Calculate confidence (0-1 scale)
    const confidence = Math.min(0.95, Math.max(0.3, maxScore / Math.max(totalScore, 1)));

    return NextResponse.json({
      industry: detectedIndustry,
      confidence,
      scores
    });

  } catch (error) {
    console.error('Industry detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect industry' },
      { status: 500 }
    );
  }
}