export interface DemoResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  respondentName: string;
  responseType: 'link' | 'call';
  timestamp: string;
  duration?: number; // in seconds for call responses
  professorName?: string;
  department?: string;
  course?: string;
  semester?: string;
  responses: {
    question: string;
    answer: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number; // 0-1
    category?: 'teaching' | 'communication' | 'knowledge' | 'availability' | 'fairness';
  }[];
  overallSentiment: 'positive' | 'negative' | 'neutral';
  satisfactionScore: number; // 1-10
  ratings: {
    teaching: number; // 1-5
    communication: number; // 1-5
    knowledge: number; // 1-5
    availability: number; // 1-5
    fairness: number; // 1-5
  };
}

export interface ProfessorStats {
  id: string;
  name: string;
  department: string;
  totalResponses: number;
  averageRating: number;
  ratings: {
    teaching: number;
    communication: number;
    knowledge: number;
    availability: number;
    fairness: number;
  };
  courses: string[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentTrend: 'up' | 'down' | 'stable';
  photoUrl?: string;
}

export const demoResponses: DemoResponse[] = [
  {
    id: 'resp_1',
    surveyId: 'survey_cs_101',
    surveyTitle: 'CS 101 - Introduction to Programming',
    respondentName: 'Sarah Johnson',
    responseType: 'link',
    timestamp: '2024-12-15T10:30:00Z',
    professorName: 'Dr. Emily Chen',
    department: 'Computer Science',
    course: 'CS 101',
    semester: 'Fall 2024',
    responses: [
      {
        question: 'How would you rate the professor\'s teaching effectiveness?',
        answer: 'Dr. Chen is an outstanding teacher! She explains complex concepts clearly and makes programming fun and engaging.',
        sentiment: 'positive',
        confidence: 0.95,
        category: 'teaching'
      },
      {
        question: 'How accessible was the professor for help?',
        answer: 'She always made time for students during office hours and responded to emails quickly. Very supportive.',
        sentiment: 'positive',
        confidence: 0.92,
        category: 'availability'
      },
      {
        question: 'Any suggestions for improvement?',
        answer: 'Maybe add more hands-on coding exercises, but overall the course structure is excellent.',
        sentiment: 'neutral',
        confidence: 0.78,
        category: 'teaching'
      }
    ],
    overallSentiment: 'positive',
    satisfactionScore: 9,
    ratings: {
      teaching: 5,
      communication: 5,
      knowledge: 5,
      availability: 5,
      fairness: 4
    }
  },
  {
    id: 'resp_2',
    surveyId: 'survey_product_feedback',
    surveyTitle: 'Product Feedback Survey',
    respondentName: 'Michael Chen',
    responseType: 'call',
    timestamp: '2024-12-14T14:22:00Z',
    duration: 180,
    responses: [
      {
        question: 'What\'s your overall experience with our service?',
        answer: 'It\'s been okay, but I\'ve had some issues with the login process. Sometimes it takes multiple attempts.',
        sentiment: 'negative',
        confidence: 0.82
      },
      {
        question: 'How likely are you to recommend us?',
        answer: 'I\'d give it a 6 out of 10. There\'s room for improvement but it gets the job done.',
        sentiment: 'neutral',
        confidence: 0.85
      },
      {
        question: 'What would make your experience better?',
        answer: 'Fix the login issues and maybe improve the mobile app. It feels a bit slow.',
        sentiment: 'negative',
        confidence: 0.88
      }
    ],
    overallSentiment: 'negative',
    satisfactionScore: 6
  },
  {
    id: 'resp_3',
    surveyId: 'survey_employee_wellness',
    surveyTitle: 'Employee Wellness Check',
    respondentName: 'Emily Rodriguez',
    responseType: 'link',
    timestamp: '2024-12-13T09:15:00Z',
    responses: [
      {
        question: 'How do you feel about work-life balance?',
        answer: 'It\'s pretty good. I appreciate the flexible hours and remote work options.',
        sentiment: 'positive',
        confidence: 0.87
      },
      {
        question: 'Any concerns about workplace wellness?',
        answer: 'The office could use better ergonomic furniture, but otherwise I\'m satisfied.',
        sentiment: 'neutral',
        confidence: 0.75
      },
      {
        question: 'Suggestions for improvement?',
        answer: 'More team building activities would be great. Also, maybe a gym membership benefit.',
        sentiment: 'positive',
        confidence: 0.80
      }
    ],
    overallSentiment: 'positive',
    satisfactionScore: 8
  },
  {
    id: 'resp_4',
    surveyId: 'survey_customer_sat',
    surveyTitle: 'Customer Satisfaction Q4 2024',
    respondentName: 'David Thompson',
    responseType: 'call',
    timestamp: '2024-12-12T16:45:00Z',
    duration: 240,
    responses: [
      {
        question: 'How satisfied are you with our product?',
        answer: 'Honestly, I\'m quite disappointed. The product doesn\'t work as advertised and I\'ve had multiple issues.',
        sentiment: 'negative',
        confidence: 0.94
      },
      {
        question: 'What specific issues have you encountered?',
        answer: 'The software crashes frequently, and when I contacted support, it took days to get a response.',
        sentiment: 'negative',
        confidence: 0.96
      },
      {
        question: 'Would you consider using our product again?',
        answer: 'Not unless these issues are resolved. I\'m looking at alternatives.',
        sentiment: 'negative',
        confidence: 0.91
      }
    ],
    overallSentiment: 'negative',
    satisfactionScore: 3
  },
  {
    id: 'resp_5',
    surveyId: 'survey_product_feedback',
    surveyTitle: 'Product Feedback Survey',
    respondentName: 'Lisa Wang',
    responseType: 'link',
    timestamp: '2024-12-11T11:20:00Z',
    responses: [
      {
        question: 'What\'s your overall experience with our service?',
        answer: 'Amazing! I love how easy it is to use. The interface is clean and everything works smoothly.',
        sentiment: 'positive',
        confidence: 0.98
      },
      {
        question: 'How likely are you to recommend us?',
        answer: 'Definitely a 10! I\'ve already recommended it to my colleagues.',
        sentiment: 'positive',
        confidence: 0.99
      },
      {
        question: 'What features do you use most?',
        answer: 'The dashboard and reporting features are fantastic. They save me so much time.',
        sentiment: 'positive',
        confidence: 0.93
      }
    ],
    overallSentiment: 'positive',
    satisfactionScore: 10
  },
  {
    id: 'resp_6',
    surveyId: 'survey_employee_wellness',
    surveyTitle: 'Employee Wellness Check',
    respondentName: 'James Parker',
    responseType: 'call',
    timestamp: '2024-12-10T13:30:00Z',
    duration: 150,
    responses: [
      {
        question: 'How do you feel about work-life balance?',
        answer: 'It\'s been challenging lately. Too many overtime hours and not enough time for family.',
        sentiment: 'negative',
        confidence: 0.89
      },
      {
        question: 'What would help improve your wellness at work?',
        answer: 'Better workload management and maybe some mental health resources.',
        sentiment: 'neutral',
        confidence: 0.72
      },
      {
        question: 'Any positive aspects you\'d like to highlight?',
        answer: 'The team is supportive and management does listen to feedback.',
        sentiment: 'positive',
        confidence: 0.84
      }
    ],
    overallSentiment: 'neutral',
    satisfactionScore: 6
  }
];

export const getSentimentAnalysis = () => {
  const totalResponses = demoResponses.length;
  const sentimentCounts = demoResponses.reduce((acc, response) => {
    acc[response.overallSentiment]++;
    return acc;
  }, { positive: 0, negative: 0, neutral: 0 });

  const averageSatisfaction = demoResponses.reduce((sum, response) => sum + response.satisfactionScore, 0) / totalResponses;

  const responseTypeBreakdown = demoResponses.reduce((acc, response) => {
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
    topKeywords: ['product', 'experience', 'satisfied', 'improvement', 'support', 'interface', 'performance'],
    recentTrends: {
      thisWeek: { positive: 65, negative: 20, neutral: 15 },
      lastWeek: { positive: 58, negative: 25, neutral: 17 },
      change: { positive: +7, negative: -5, neutral: -2 }
    }
  };
};

export const getRecentResponses = (limit: number = 5) => {
  return demoResponses
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
};