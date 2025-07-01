import { getCurrentIndustryConfig, isUsingDummyData } from './industry-config';

// Universal response structure - same for all industries
export interface UniversalResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  respondentName: string;
  responseType: 'link' | 'call';
  timestamp: string;
  duration?: number;
  entityName: string; // Professor, Team, Product, Initiative, etc.
  entityCategory: string; // Department, Business Unit, Category, District, etc.
  entityContext: string; // Course, Project, Product Line, Program, etc.
  semester?: string; // For education
  responses: {
    question: string;
    answer: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    category: string; // Industry-specific categories
  }[];
  overallSentiment: 'positive' | 'negative' | 'neutral';
  satisfactionScore: number;
  ratings: Record<string, number>; // Industry-specific rating categories
}

// Universal entity stats - adaptable to any industry
export interface UniversalEntityStats {
  id: string;
  name: string;
  category: string; // Department, Business Unit, District, etc.
  totalResponses: number;
  averageRating: number;
  ratings: Record<string, number>; // Industry-specific ratings
  contexts: string[]; // Courses, Projects, Products, Programs, etc.
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentTrend: 'up' | 'down' | 'stable';
  photoUrl?: string;
  additionalMetrics?: Record<string, any>; // Industry-specific extra data
}

// Demo data that adapts to current industry
export const getUniversalDemoResponses = (): UniversalResponse[] => {
  const industryConfig = getCurrentIndustryConfig();
  
  // Base template responses that get adapted per industry
  const baseResponses = [
    {
      id: 'resp_1',
      respondentName: 'Sarah Johnson',
      responseType: 'link' as const,
      timestamp: '2024-12-15T10:30:00Z',
      overallSentiment: 'positive' as const,
      satisfactionScore: 9,
      responses: [{
        question: 'How would you rate the overall quality?',
        answer: 'Outstanding quality! Everything exceeded my expectations and was delivered professionally.',
        sentiment: 'positive' as const,
        confidence: 0.95,
        category: industryConfig.metrics[0].toLowerCase().replace(/\s+/g, '_')
      }]
    },
    {
      id: 'resp_2',
      respondentName: 'Michael Chen',
      responseType: 'call' as const,
      timestamp: '2024-12-14T14:22:00Z',
      duration: 180,
      overallSentiment: 'negative' as const,
      satisfactionScore: 5,
      responses: [{
        question: 'How clear was the communication?',
        answer: 'Communication was unclear and confusing. Expectations were not properly set.',
        sentiment: 'negative' as const,
        confidence: 0.82,
        category: 'communication'
      }]
    },
    {
      id: 'resp_3',
      respondentName: 'Emily Rodriguez',
      responseType: 'link' as const,
      timestamp: '2024-12-13T09:15:00Z',
      overallSentiment: 'positive' as const,
      satisfactionScore: 8,
      responses: [{
        question: 'How helpful was the support provided?',
        answer: 'Very helpful and responsive. All my questions were answered thoroughly.',
        sentiment: 'positive' as const,
        confidence: 0.87,
        category: 'support'
      }]
    },
    {
      id: 'resp_4',
      respondentName: 'David Thompson',
      responseType: 'call' as const,
      timestamp: '2024-12-12T16:45:00Z',
      duration: 240,
      overallSentiment: 'positive' as const,
      satisfactionScore: 8,
      responses: [{
        question: 'How would you rate the overall experience?',
        answer: 'Great experience overall. Everything was well-organized and professional.',
        sentiment: 'positive' as const,
        confidence: 0.94,
        category: 'experience'
      }]
    },
    {
      id: 'resp_5',
      respondentName: 'Jessica Park',
      responseType: 'link' as const,
      timestamp: '2024-12-11T11:20:00Z',
      overallSentiment: 'positive' as const,
      satisfactionScore: 9,
      responses: [{
        question: 'How organized was everything?',
        answer: 'Very well organized with clear structure and excellent attention to detail.',
        sentiment: 'positive' as const,
        confidence: 0.98,
        category: 'organization'
      }]
    },
    {
      id: 'resp_6',
      respondentName: 'Alex Kim',
      responseType: 'call' as const,
      timestamp: '2024-12-10T13:30:00Z',
      duration: 150,
      overallSentiment: 'positive' as const,
      satisfactionScore: 9,
      responses: [{
        question: 'How engaging was the content?',
        answer: 'Highly engaging and well-presented. Kept my attention throughout.',
        sentiment: 'positive' as const,
        confidence: 0.89,
        category: 'engagement'
      }]
    },
    {
      id: 'resp_7',
      respondentName: 'Ryan Davis',
      responseType: 'link' as const,
      timestamp: '2024-12-09T15:20:00Z',
      overallSentiment: 'negative' as const,
      satisfactionScore: 4,
      responses: [{
        question: 'How accessible was the service?',
        answer: 'Very difficult to access and get help when needed. Poor availability.',
        sentiment: 'negative' as const,
        confidence: 0.91,
        category: 'accessibility'
      }]
    },
    {
      id: 'resp_8',
      respondentName: 'Sophia Brown',
      responseType: 'link' as const,
      timestamp: '2024-12-08T10:45:00Z',
      overallSentiment: 'positive' as const,
      satisfactionScore: 8,
      responses: [{
        question: 'How fair was the process?',
        answer: 'Very fair and transparent. Everything was handled professionally.',
        sentiment: 'positive' as const,
        confidence: 0.85,
        category: 'fairness'
      }]
    }
  ];

  // Industry-specific adaptations
  return baseResponses.map((response, index) => {
    switch (industryConfig.id) {
      case 'education':
        return {
          ...response,
          surveyId: `survey_${['cs_101', 'math_201', 'eng_301', 'phys_101', 'bio_200', 'hist_150', 'chem_101', 'psyc_201'][index]}`,
          surveyTitle: ['CS 101 - Programming', 'MATH 201 - Calculus II', 'ENG 301 - Composition', 'PHYS 101 - Physics', 'BIO 200 - Cell Biology', 'HIST 150 - World History', 'CHEM 101 - Chemistry', 'PSYC 201 - Psychology'][index],
          entityName: ['Dr. Emily Chen', 'Prof. Robert Johnson', 'Dr. Sarah Martinez', 'Dr. Lisa Wang', 'Prof. James Wilson', 'Dr. Maria Garcia', 'Prof. David Lee', 'Dr. Amanda Taylor'][index],
          entityCategory: ['Computer Science', 'Mathematics', 'English', 'Physics', 'Biology', 'History', 'Chemistry', 'Psychology'][index],
          entityContext: ['CS 101', 'MATH 201', 'ENG 301', 'PHYS 101', 'BIO 200', 'HIST 150', 'CHEM 101', 'PSYC 201'][index],
          semester: 'Fall 2024',
          ratings: { teaching: 5, communication: response.satisfactionScore > 7 ? 5 : 3, knowledge: 5, availability: 4, fairness: 4 }
        };
      
      case 'employee':
        return {
          ...response,
          surveyId: `survey_team_${index + 1}`,
          surveyTitle: ['Team Performance Review', 'Quarterly Check-in', 'Project Retrospective', 'Skills Assessment', 'Culture Survey', 'Leadership Feedback', 'Work-Life Balance', 'Career Development'][index],
          entityName: ['Product Engineering', 'Data Science Team', 'Customer Success', 'Revenue Operations', 'Design & UX', 'Marketing Team', 'Sales Team', 'HR Operations'][index],
          entityCategory: ['Engineering', 'Analytics', 'Customer', 'Operations', 'Design', 'Marketing', 'Sales', 'Human Resources'][index],
          entityContext: ['Product Development', 'Data Analysis', 'Customer Support', 'Revenue Growth', 'User Experience', 'Brand Marketing', 'Lead Generation', 'Employee Relations'][index],
          ratings: { productivity: response.satisfactionScore, collaboration: response.satisfactionScore > 7 ? 9 : 6, innovation: 8, satisfaction: response.satisfactionScore, growth: 7 }
        };
      
      case 'customer':
        return {
          ...response,
          surveyId: `survey_product_${index + 1}`,
          surveyTitle: ['Product Experience Survey', 'Service Quality Review', 'Customer Satisfaction', 'Feature Feedback', 'Support Experience', 'Purchase Experience', 'User Experience', 'Loyalty Assessment'][index],
          entityName: ['Enterprise Champions', 'Growth Accelerators', 'Emerging Innovators', 'Value Seekers', 'Premium Loyalists', 'Strategic Partners', 'Digital Natives', 'Enterprise Solutions'][index],
          entityCategory: ['Enterprise', 'Mid-Market', 'Small Business', 'Consumer', 'Premium', 'Strategic', 'Digital', 'Enterprise'][index],
          entityContext: ['SaaS Platform', 'Analytics Suite', 'Mobile App', 'Web Service', 'API Integration', 'Consulting', 'Support Service', 'Training Program'][index],
          ratings: { satisfaction: response.satisfactionScore, quality: response.satisfactionScore > 7 ? 9 : 6, value: 8, support: response.satisfactionScore, loyalty: 7 }
        };
      
      case 'community':
        return {
          ...response,
          surveyId: `survey_initiative_${index + 1}`,
          surveyTitle: ['Community Initiative Feedback', 'Public Service Review', 'Civic Engagement Survey', 'Municipal Service Rating', 'Community Development', 'Public Safety Feedback', 'Infrastructure Review', 'Public Program Assessment'][index],
          entityName: ['Smart City Hub', 'Green Energy Program', 'Safety Network', 'Youth Innovation', 'Housing Coalition', 'Transit Improvement', 'Park Renovation', 'Business Support'][index],
          entityCategory: ['Technology', 'Environment', 'Safety', 'Education', 'Housing', 'Transportation', 'Recreation', 'Economic'][index],
          entityContext: ['Tech Corridor', 'Riverside Commons', 'Downtown Core', 'Education District', 'Northside Village', 'Transit Routes', 'Central Park', 'Main Street'][index],
          ratings: { impact: response.satisfactionScore, engagement: response.satisfactionScore > 7 ? 9 : 6, transparency: 8, effectiveness: response.satisfactionScore, accessibility: 7 }
        };
      
      case 'public':
        return {
          ...response,
          surveyId: `survey_poll_${index + 1}`,
          surveyTitle: ['Presidential Election Poll', 'Policy Opinion Survey', 'Public Issue Assessment', 'Government Performance', 'Economic Policy Poll', 'Social Issue Survey', 'Environmental Policy', 'Healthcare Policy Poll'][index],
          entityName: ['Presidential Race', 'Climate Policy', 'Economic Recovery', 'Healthcare Reform', 'Social Justice', 'Immigration Reform', 'Education Funding', 'Infrastructure Bill'][index],
          entityCategory: ['National Elections', 'Environmental', 'Economic', 'Healthcare', 'Social Issues', 'Immigration', 'Education', 'Infrastructure'][index],
          entityContext: ['2024 Election', 'Federal Policy', 'Economic Relief', 'Health Coverage', 'Reform Measures', 'Border Policy', 'School Funding', 'Public Works'][index],
          ratings: { agreement: response.satisfactionScore, confidence: response.satisfactionScore > 7 ? 9 : 6, importance: 8, urgency: response.satisfactionScore, support: 7 }
        };
      
      case 'event':
        return {
          ...response,
          surveyId: `survey_event_${index + 1}`,
          surveyTitle: ['Conference Feedback', 'Workshop Evaluation', 'Summit Assessment', 'Training Review', 'Expo Experience', 'Seminar Feedback', 'Convention Review', 'Symposium Evaluation'][index],
          entityName: ['AI Future Summit', 'Sustainability Forum', 'Medical Innovation', 'Fintech Revolution', 'Creative Leadership', 'Tech Conference', 'Leadership Summit', 'Innovation Expo'][index],
          entityCategory: ['Technology', 'Environment', 'Healthcare', 'Finance', 'Leadership', 'Technology', 'Business', 'Innovation'][index],
          entityContext: ['Conference Hall A', 'Main Auditorium', 'Innovation Center', 'Financial District', 'Executive Center', 'Tech Campus', 'Business Center', 'Expo Hall'][index],
          ratings: { content: response.satisfactionScore, organization: response.satisfactionScore > 7 ? 9 : 6, networking: 8, value: response.satisfactionScore, venue: 7 }
        };
      
      case 'healthcare':
        return {
          ...response,
          surveyId: `survey_medical_${index + 1}`,
          surveyTitle: ['Patient Experience Survey', 'Treatment Feedback', 'Care Quality Review', 'Service Assessment', 'Provider Evaluation', 'Facility Review', 'Treatment Outcome', 'Patient Satisfaction'][index],
          entityName: ['Cardiac Excellence', 'Neuroscience Hub', 'Oncology Division', 'Surgical Robotics', 'Maternal Care', 'Emergency Medicine', 'Pediatric Care', 'Mental Health'][index],
          entityCategory: ['Cardiovascular', 'Neurological', 'Oncology', 'Surgery', 'Maternal', 'Emergency', 'Pediatrics', 'Psychiatry'][index],
          entityContext: ['Heart Institute', 'Brain Center', 'Cancer Center', 'Surgery Center', 'Women\'s Health', 'Emergency Dept', 'Children\'s Wing', 'Behavioral Health'][index],
          ratings: { care_quality: response.satisfactionScore, communication: response.satisfactionScore > 7 ? 9 : 6, treatment: 8, accessibility: response.satisfactionScore, outcome: 7 }
        };
      
      default:
        return {
          ...response,
          surveyId: `survey_general_${index + 1}`,
          surveyTitle: `General Survey ${index + 1}`,
          entityName: `Entity ${index + 1}`,
          entityCategory: 'General',
          entityContext: `Context ${index + 1}`,
          ratings: { satisfaction: response.satisfactionScore, quality: response.satisfactionScore > 7 ? 9 : 6, value: 8, service: response.satisfactionScore, overall: 7 }
        };
    }
  });
};

// Fetch real responses from API
export const getRealUniversalResponses = async (): Promise<UniversalResponse[]> => {
  try {
    const response = await fetch('/api/all-responses');
    if (!response.ok) {
      throw new Error('Failed to fetch responses');
    }
    
    const data = await response.json();
    const industryConfig = getCurrentIndustryConfig();
    
    // Filter responses by current industry and convert to universal format
    const industryResponses = data.filter((r: any) => r.industry === industryConfig.id || (!r.industry && industryConfig.id === 'education'));
    
    return industryResponses.map((response: any, index: number): UniversalResponse => {
      // Convert database response to universal format
      const answers = response.answers || {};
      const answerTexts = Object.values(answers) as string[];
      
      // Simple sentiment analysis - this would be enhanced with real AI
      const hasPositiveWords = answerTexts.some((text: string) => 
        typeof text === 'string' && /excellent|great|good|amazing|wonderful|helpful|clear|organized|professional/i.test(text)
      );
      const hasNegativeWords = answerTexts.some((text: string) => 
        typeof text === 'string' && /poor|bad|terrible|confusing|unclear|disorganized|unprofessional/i.test(text)
      );
      
      const overallSentiment: 'positive' | 'negative' | 'neutral' = 
        hasPositiveWords && !hasNegativeWords ? 'positive' : 
        hasNegativeWords && !hasPositiveWords ? 'negative' : 'neutral';
      
      const satisfactionScore = hasPositiveWords ? 8 + Math.random() * 2 : 
                               hasNegativeWords ? 3 + Math.random() * 3 : 
                               5 + Math.random() * 4;
      
      // Get survey info if available
      const surveyId = response.surveyId || 'unknown';
      
      // Generate industry-specific entity data based on current industry
      const entityNames = getEntityNamesForIndustry(industryConfig.id);
      const entityCategories = getEntityCategoriesForIndustry(industryConfig.id);
      const entityContexts = getEntityContextsForIndustry(industryConfig.id);
      
      const entityIndex = index % entityNames.length;
      
      return {
        id: response.id,
        surveyId,
        surveyTitle: `Survey ${surveyId}`,
        respondentName: `Respondent ${index + 1}`,
        responseType: response.type === 'voice-vapi' ? 'call' : 'link',
        timestamp: response.submittedAt || new Date().toISOString(),
        duration: response.metadata?.duration,
        entityName: entityNames[entityIndex],
        entityCategory: entityCategories[entityIndex],
        entityContext: entityContexts[entityIndex],
        responses: answerTexts.map((answer: string, i: number) => ({
          question: `Question ${i + 1}`,
          answer: answer || 'No response',
          sentiment: overallSentiment,
          confidence: 0.8 + Math.random() * 0.2,
          category: industryConfig.metrics[i % industryConfig.metrics.length].toLowerCase().replace(/\s+/g, '_')
        })),
        overallSentiment,
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
        ratings: generateIndustryRatings(industryConfig, satisfactionScore)
      };
    });
  } catch (error) {
    console.error('Failed to fetch real responses:', error);
    return [];
  }
};

// Helper functions for industry-specific entity data
function getEntityNamesForIndustry(industryId: string): string[] {
  switch (industryId) {
    case 'education':
      return ['Dr. Emily Chen', 'Prof. Robert Johnson', 'Dr. Sarah Martinez', 'Dr. Lisa Wang', 'Prof. James Wilson', 'Dr. Maria Garcia', 'Prof. David Lee', 'Dr. Amanda Taylor'];
    case 'employee':
      return ['Product Engineering', 'Data Science Team', 'Customer Success', 'Revenue Operations', 'Design & UX', 'Marketing Team', 'Sales Team', 'HR Operations'];
    case 'customer':
      return ['Enterprise Champions', 'Growth Accelerators', 'Emerging Innovators', 'Value Seekers', 'Premium Loyalists', 'Strategic Partners', 'Digital Natives', 'Enterprise Solutions'];
    case 'community':
      return ['Smart City Hub', 'Green Energy Program', 'Safety Network', 'Youth Innovation', 'Housing Coalition', 'Transit Improvement', 'Park Renovation', 'Business Support'];
    case 'public':
      return ['Presidential Race', 'Climate Policy', 'Economic Recovery', 'Healthcare Reform', 'Social Justice', 'Immigration Reform', 'Education Funding', 'Infrastructure Bill'];
    case 'event':
      return ['AI Future Summit', 'Sustainability Forum', 'Medical Innovation', 'Fintech Revolution', 'Creative Leadership', 'Tech Conference', 'Leadership Summit', 'Innovation Expo'];
    case 'healthcare':
      return ['Cardiac Excellence', 'Neuroscience Hub', 'Oncology Division', 'Surgical Robotics', 'Maternal Care', 'Emergency Medicine', 'Pediatric Care', 'Mental Health'];
    default:
      return ['Entity 1', 'Entity 2', 'Entity 3', 'Entity 4'];
  }
}

function getEntityCategoriesForIndustry(industryId: string): string[] {
  switch (industryId) {
    case 'education':
      return ['Computer Science', 'Mathematics', 'English', 'Physics', 'Biology', 'History', 'Chemistry', 'Psychology'];
    case 'employee':
      return ['Engineering', 'Analytics', 'Customer', 'Operations', 'Design', 'Marketing', 'Sales', 'Human Resources'];
    case 'customer':
      return ['Enterprise', 'Mid-Market', 'Small Business', 'Consumer', 'Premium', 'Strategic', 'Digital', 'Enterprise'];
    case 'community':
      return ['Technology', 'Environment', 'Safety', 'Education', 'Housing', 'Transportation', 'Recreation', 'Economic'];
    case 'public':
      return ['National Elections', 'Environmental', 'Economic', 'Healthcare', 'Social Issues', 'Immigration', 'Education', 'Infrastructure'];
    case 'event':
      return ['Technology', 'Environment', 'Healthcare', 'Finance', 'Leadership', 'Technology', 'Business', 'Innovation'];
    case 'healthcare':
      return ['Cardiovascular', 'Neurological', 'Oncology', 'Surgery', 'Maternal', 'Emergency', 'Pediatrics', 'Psychiatry'];
    default:
      return ['General', 'General', 'General', 'General'];
  }
}

function getEntityContextsForIndustry(industryId: string): string[] {
  switch (industryId) {
    case 'education':
      return ['CS 101', 'MATH 201', 'ENG 301', 'PHYS 101', 'BIO 200', 'HIST 150', 'CHEM 101', 'PSYC 201'];
    case 'employee':
      return ['Product Development', 'Data Analysis', 'Customer Support', 'Revenue Growth', 'User Experience', 'Brand Marketing', 'Lead Generation', 'Employee Relations'];
    case 'customer':
      return ['SaaS Platform', 'Analytics Suite', 'Mobile App', 'Web Service', 'API Integration', 'Consulting', 'Support Service', 'Training Program'];
    case 'community':
      return ['Tech Corridor', 'Riverside Commons', 'Downtown Core', 'Education District', 'Northside Village', 'Transit Routes', 'Central Park', 'Main Street'];
    case 'public':
      return ['2024 Election', 'Federal Policy', 'Economic Relief', 'Health Coverage', 'Reform Measures', 'Border Policy', 'School Funding', 'Public Works'];
    case 'event':
      return ['Conference Hall A', 'Main Auditorium', 'Innovation Center', 'Financial District', 'Executive Center', 'Tech Campus', 'Business Center', 'Expo Hall'];
    case 'healthcare':
      return ['Heart Institute', 'Brain Center', 'Cancer Center', 'Surgery Center', 'Women\'s Health', 'Emergency Dept', 'Children\'s Wing', 'Behavioral Health'];
    default:
      return ['Context 1', 'Context 2', 'Context 3', 'Context 4'];
  }
}

function generateIndustryRatings(industryConfig: any, satisfactionScore: number): Record<string, number> {
  const ratings: Record<string, number> = {};
  industryConfig.metrics.forEach((metric: string) => {
    const key = metric.toLowerCase().replace(/\s+/g, '_');
    ratings[key] = Math.round((satisfactionScore + (Math.random() - 0.5) * 2) * 10) / 10;
  });
  return ratings;
}

// Universal sentiment analysis that works for any industry
export const getUniversalSentimentAnalysis = async () => {
  const useDummy = isUsingDummyData();
  const responses = useDummy ? getUniversalDemoResponses() : await getRealUniversalResponses();
  const totalResponses = responses.length;
  
  if (totalResponses === 0) {
    // Return default structure if no responses
    return {
      totalResponses: 0,
      sentimentCounts: { positive: 0, negative: 0, neutral: 0 },
      sentimentPercentages: { positive: 0, negative: 0, neutral: 0 },
      averageSatisfaction: 0,
      responseTypeBreakdown: { link: 0, call: 0 },
      topKeywords: [],
      recentTrends: {
        thisWeek: { positive: 0, negative: 0, neutral: 0 },
        lastWeek: { positive: 0, negative: 0, neutral: 0 },
        change: { positive: 0, negative: 0, neutral: 0 }
      }
    };
  }
  
  const sentimentCounts = responses.reduce((acc, response) => {
    acc[response.overallSentiment]++;
    return acc;
  }, { positive: 0, negative: 0, neutral: 0 });

  const averageSatisfaction = responses.reduce((sum, response) => sum + response.satisfactionScore, 0) / totalResponses;

  const responseTypeBreakdown = responses.reduce((acc, response) => {
    acc[response.responseType]++;
    return acc;
  }, { link: 0, call: 0 });

  // Extract keywords from responses (real or dummy)
  const allAnswers = responses.flatMap(r => r.responses.map(resp => resp.answer)).join(' ');
  const words = allAnswers.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  const wordCounts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topKeywords = Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 7)
    .map(([word]) => word);

  return {
    totalResponses,
    sentimentCounts,
    sentimentPercentages: {
      positive: Math.round((sentimentCounts.positive / totalResponses) * 100),
      negative: Math.round((sentimentCounts.negative / totalResponses) * 100),
      neutral: Math.round((sentimentCounts.neutral / totalResponses) * 100)
    },
    averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
    responseTypeBreakdown,
    topKeywords: topKeywords.length > 0 ? topKeywords : ['quality', 'professional', 'helpful', 'organized', 'clear', 'responsive', 'effective'],
    recentTrends: {
      thisWeek: { positive: 72, negative: 15, neutral: 13 },
      lastWeek: { positive: 68, negative: 18, neutral: 14 },
      change: { positive: +4, negative: -3, neutral: -1 }
    }
  };
};

// Synchronous version for immediate use (returns dummy data, real data via async)
export const getUniversalSentimentAnalysisSync = () => {
  const responses = getUniversalDemoResponses();
  const totalResponses = responses.length;
  
  const sentimentCounts = responses.reduce((acc, response) => {
    acc[response.overallSentiment]++;
    return acc;
  }, { positive: 0, negative: 0, neutral: 0 });

  const averageSatisfaction = responses.reduce((sum, response) => sum + response.satisfactionScore, 0) / totalResponses;

  const responseTypeBreakdown = responses.reduce((acc, response) => {
    acc[response.responseType]++;
    return acc;
  }, { link: 0, call: 0 });

  return {
    totalResponses,
    sentimentCounts,
    sentimentPercentages: {
      positive: Math.round((sentimentCounts.positive / totalResponses) * 100),
      negative: Math.round((sentimentCounts.negative / totalResponses) * 100),
      neutral: Math.round((sentimentCounts.neutral / totalResponses) * 100)
    },
    averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
    responseTypeBreakdown,
    topKeywords: ['quality', 'professional', 'helpful', 'organized', 'clear', 'responsive', 'effective'],
    recentTrends: {
      thisWeek: { positive: 72, negative: 15, neutral: 13 },
      lastWeek: { positive: 68, negative: 18, neutral: 14 },
      change: { positive: +4, negative: -3, neutral: -1 }
    }
  };
};

// Get top entities for current industry
export const getUniversalTopEntities = (limit: number = 10): UniversalEntityStats[] => {
  const industryConfig = getCurrentIndustryConfig();
  const responses = getUniversalDemoResponses();
  
  // Group responses by entity and calculate stats
  const entityMap = new Map<string, {
    responses: UniversalResponse[];
    category: string;
    contexts: Set<string>;
  }>();

  responses.forEach(response => {
    if (!entityMap.has(response.entityName)) {
      entityMap.set(response.entityName, {
        responses: [],
        category: response.entityCategory,
        contexts: new Set()
      });
    }
    entityMap.get(response.entityName)!.responses.push(response);
    entityMap.get(response.entityName)!.contexts.add(response.entityContext);
  });

  // Convert to EntityStats
  const entityStats: UniversalEntityStats[] = Array.from(entityMap.entries()).map(([name, data], index) => {
    const totalResponses = data.responses.length;
    const averageRating = data.responses.reduce((sum, r) => sum + r.satisfactionScore, 0) / totalResponses;
    
    const sentimentCounts = data.responses.reduce((acc, r) => {
      acc[r.overallSentiment]++;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    const ratings: Record<string, number> = {};
    industryConfig.metrics.forEach((metric, i) => {
      const key = metric.toLowerCase().replace(/\s+/g, '_');
      ratings[key] = Math.round((averageRating + (Math.random() - 0.5) * 2) * 10) / 10;
    });

    return {
      id: `entity_${index + 1}`,
      name,
      category: data.category,
      totalResponses,
      averageRating: Math.round(averageRating * 10) / 10,
      ratings,
      contexts: Array.from(data.contexts),
      sentimentBreakdown: {
        positive: Math.round((sentimentCounts.positive / totalResponses) * 100),
        neutral: Math.round((sentimentCounts.neutral / totalResponses) * 100),
        negative: Math.round((sentimentCounts.negative / totalResponses) * 100)
      },
      recentTrend: averageRating > 7 ? 'up' : averageRating > 5 ? 'stable' : 'down'
    };
  });

  return entityStats
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);
};

// Async version that works with both dummy and real data
export const getUniversalTopEntitiesAsync = async (limit: number = 10): Promise<UniversalEntityStats[]> => {
  const useDummy = isUsingDummyData();
  const responses = useDummy ? getUniversalDemoResponses() : await getRealUniversalResponses();
  const industryConfig = getCurrentIndustryConfig();
  
  if (responses.length === 0) {
    return [];
  }
  
  // Group responses by entity and calculate stats
  const entityMap = new Map<string, {
    responses: UniversalResponse[];
    category: string;
    contexts: Set<string>;
  }>();

  responses.forEach(response => {
    if (!entityMap.has(response.entityName)) {
      entityMap.set(response.entityName, {
        responses: [],
        category: response.entityCategory,
        contexts: new Set()
      });
    }
    entityMap.get(response.entityName)!.responses.push(response);
    entityMap.get(response.entityName)!.contexts.add(response.entityContext);
  });

  // Convert to EntityStats
  const entityStats: UniversalEntityStats[] = Array.from(entityMap.entries()).map(([name, data], index) => {
    const totalResponses = data.responses.length;
    const averageRating = data.responses.reduce((sum, r) => sum + r.satisfactionScore, 0) / totalResponses;
    
    const sentimentCounts = data.responses.reduce((acc, r) => {
      acc[r.overallSentiment]++;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    const ratings: Record<string, number> = {};
    industryConfig.metrics.forEach((metric, i) => {
      const key = metric.toLowerCase().replace(/\s+/g, '_');
      ratings[key] = Math.round((averageRating + (Math.random() - 0.5) * 2) * 10) / 10;
    });

    return {
      id: `entity_${index + 1}`,
      name,
      category: data.category,
      totalResponses,
      averageRating: Math.round(averageRating * 10) / 10,
      ratings,
      contexts: Array.from(data.contexts),
      sentimentBreakdown: {
        positive: Math.round((sentimentCounts.positive / totalResponses) * 100),
        neutral: Math.round((sentimentCounts.neutral / totalResponses) * 100),
        negative: Math.round((sentimentCounts.negative / totalResponses) * 100)
      },
      recentTrend: averageRating > 7 ? 'up' : averageRating > 5 ? 'stable' : 'down'
    };
  });

  return entityStats
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);
};