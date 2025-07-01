import { nanoid } from 'nanoid';

export interface DummyResponse {
  id: string;
  surveyId: string;
  submittedAt: string;
  answers: Record<string, string>;
  type: 'text' | 'voice-extracted' | 'anonymous';
  email?: string;
  callSid?: string;
  metadata?: {
    extractedFrom?: string;
    questionCount?: number;
    extractedAnswers?: number;
    duration?: number;
  };
}

export interface DummySurvey {
  id: string;
  title?: string;
  topic: string;
  questions: Array<{ id: string; text: string; type: string }>;
}

const dummySurveys: DummySurvey[] = [
  {
    id: 'survey-customer-satisfaction',
    topic: 'Customer Satisfaction',
    questions: [
      { id: '1', text: 'How satisfied are you with our service?', type: 'rating' },
      { id: '2', text: 'What can we improve?', type: 'text' },
      { id: '3', text: 'Would you recommend us to others?', type: 'boolean' },
      { id: '4', text: 'Any additional comments?', type: 'text' }
    ]
  },
  {
    id: 'survey-product-feedback',
    topic: 'Product Feedback',
    questions: [
      { id: '1', text: 'How easy was it to use our product?', type: 'rating' },
      { id: '2', text: 'What features do you use most?', type: 'text' },
      { id: '3', text: 'What features are missing?', type: 'text' },
      { id: '4', text: 'Overall rating', type: 'rating' }
    ]
  },
  {
    id: 'survey-employee-engagement',
    topic: 'Employee Engagement',
    questions: [
      { id: '1', text: 'How engaged do you feel at work?', type: 'rating' },
      { id: '2', text: 'What motivates you most?', type: 'text' },
      { id: '3', text: 'How is your work-life balance?', type: 'rating' },
      { id: '4', text: 'Suggestions for improvement?', type: 'text' }
    ]
  },
  {
    id: 'survey-market-research',
    topic: 'Market Research',
    questions: [
      { id: '1', text: 'Which brands do you prefer?', type: 'text' },
      { id: '2', text: 'How often do you shop online?', type: 'text' },
      { id: '3', text: 'What influences your buying decisions?', type: 'text' },
      { id: '4', text: 'Price sensitivity rating', type: 'rating' }
    ]
  },
  {
    id: 'survey-event-feedback',
    topic: 'Event Feedback',
    questions: [
      { id: '1', text: 'How was the overall event experience?', type: 'rating' },
      { id: '2', text: 'Which session did you enjoy most?', type: 'text' },
      { id: '3', text: 'How was the venue?', type: 'rating' },
      { id: '4', text: 'Would you attend future events?', type: 'boolean' }
    ]
  },
  {
    id: 'survey-course-feedback',
    topic: 'Course Feedback',
    questions: [
      { id: '1', text: 'How would you rate this course overall?', type: 'rating' },
      { id: '2', text: 'What did you like most about the course?', type: 'text' },
      { id: '3', text: 'What could be improved?', type: 'text' },
      { id: '4', text: 'Would you recommend this course?', type: 'boolean' }
    ]
  }
];

const sampleEmails = [
  'john.doe@email.com',
  'sarah.smith@company.com',
  'mike.johnson@business.org',
  'emily.davis@startup.io',
  'david.wilson@enterprise.com',
  'lisa.brown@agency.net',
  'alex.jones@consulting.biz',
  'jessica.taylor@nonprofit.org',
  'ryan.miller@tech.co',
  'amanda.garcia@design.studio'
];

const voiceResponseTemplates = {
  'survey-customer-satisfaction': [
    ['Very satisfied, 8 out of 10', 'Maybe improve response time', 'Yes, definitely', 'Great service overall'],
    ['Pretty good, around 7', 'Better communication needed', 'Probably', 'Keep up the good work'],
    ['Extremely happy, 10/10', 'Nothing really', 'Absolutely', 'Amazing experience'],
    ['Somewhat satisfied, 6', 'Pricing could be better', 'Maybe', 'It was okay'],
    ['Very pleased, 9', 'Faster delivery', 'Yes', 'Excellent quality']
  ],
  'survey-product-feedback': [
    ['Really easy, 9 out of 10', 'Dashboard and reporting', 'Better mobile app', '8'],
    ['Pretty simple, 7', 'Analytics features', 'More integrations', '7'],
    ['Very intuitive, 8', 'User management', 'Advanced filtering', '8'],
    ['Could be better, 6', 'Basic features only', 'Better documentation', '6'],
    ['Excellent, 10', 'Everything', 'Nothing missing', '10']
  ],
  'survey-employee-engagement': [
    ['Highly engaged, 9', 'Challenging projects', 'Great, 8', 'More team events'],
    ['Moderately engaged, 7', 'Recognition', 'Good, 7', 'Better work flexibility'],
    ['Very engaged, 8', 'Learning opportunities', 'Excellent, 9', 'Nothing specific'],
    ['Somewhat engaged, 6', 'Career growth', 'Okay, 6', 'More communication'],
    ['Extremely engaged, 10', 'Company culture', 'Perfect, 10', 'Keep it up']
  ],
  'survey-market-research': [
    ['Apple and Google', 'Weekly', 'Quality and reviews', '7'],
    ['Nike and Adidas', 'Daily', 'Price and brand', '8'],
    ['Amazon and Target', 'Few times a week', 'Convenience', '6'],
    ['Local brands', 'Monthly', 'Recommendations', '9'],
    ['Premium brands', 'Occasionally', 'Quality over price', '5']
  ],
  'survey-event-feedback': [
    ['Excellent, 9', 'Keynote speech', 'Great venue, 8', 'Yes, definitely'],
    ['Good, 7', 'Networking session', 'Nice location, 7', 'Probably'],
    ['Amazing, 10', 'Technical workshop', 'Perfect venue, 9', 'Absolutely'],
    ['Okay, 6', 'Panel discussion', 'Decent, 6', 'Maybe'],
    ['Great, 8', 'Q&A session', 'Good setup, 8', 'Yes']
  ],
  'survey-course-feedback': [
    ['Solid three out of 10, didn\'t really like it very much', 'The practical examples were helpful', 'More interactive content needed', 'No, wouldn\'t recommend'],
    ['Pretty good, 7 out of 10', 'Clear explanations', 'Better pacing', 'Yes, would recommend'],
    ['Excellent course, 9', 'Hands-on exercises', 'Nothing major', 'Definitely recommend'],
    ['Average, 5', 'Some good points', 'More examples', 'Maybe'],
    ['Great content, 8', 'Well structured', 'More time for questions', 'Yes']
  ]
};

const textResponseTemplates = {
  'survey-customer-satisfaction': [
    ['Excellent service, very happy with everything', 'Could improve website navigation', 'Yes, I recommend to everyone', 'Thank you for great support'],
    ['Good overall experience', 'Faster response times needed', 'Yes, likely to recommend', 'Professional team'],
    ['Satisfied with the service quality', 'Better mobile experience', 'Definitely recommend', 'Keep improving'],
    ['Above average service', 'More payment options', 'Would recommend', 'Good value for money'],
    ['Very professional service', 'Nothing major to improve', 'Absolutely recommend', 'Excellent experience']
  ],
  'survey-product-feedback': [
    ['Very user-friendly interface', 'Dashboard, reports, analytics', 'Better API documentation', 'Excellent product overall'],
    ['Easy to learn and use', 'User management features', 'More customization options', 'Great tool for our needs'],
    ['Intuitive design', 'Reporting capabilities', 'Mobile app improvements', 'Solid product'],
    ['Good functionality', 'Basic features work well', 'More advanced features', 'Does what we need'],
    ['Excellent user experience', 'All features are useful', 'Nothing missing', 'Perfect for our use case']
  ],
  'survey-employee-engagement': [
    ['Very engaged and motivated', 'Challenging work and growth opportunities', 'Excellent work-life balance', 'More team building activities'],
    ['Moderately engaged', 'Recognition and feedback', 'Good balance overall', 'Better communication from leadership'],
    ['Highly engaged at work', 'Meaningful projects', 'Great flexibility', 'Continue current practices'],
    ['Somewhat engaged', 'Career development opportunities', 'Could be better', 'More learning opportunities'],
    ['Extremely engaged', 'Company culture and values', 'Perfect balance', 'No suggestions, everything is great']
  ],
  'survey-market-research': [
    ['Apple, Microsoft, Google', 'Several times per week', 'Product reviews and recommendations', 'Moderately price sensitive'],
    ['Nike, Adidas, Under Armour', 'Almost daily', 'Brand reputation and quality', 'Somewhat price sensitive'],
    ['Amazon, Walmart, Target', 'Weekly shopping trips', 'Convenience and price', 'Very price sensitive'],
    ['Local and sustainable brands', 'Monthly purchases', 'Environmental impact', 'Less price sensitive'],
    ['Premium luxury brands', 'Occasional purchases', 'Quality and exclusivity', 'Not price sensitive']
  ],
  'survey-event-feedback': [
    ['Outstanding event, very well organized', 'The main keynote presentation', 'Perfect venue and setup', 'Definitely attending future events'],
    ['Good event overall', 'Networking opportunities', 'Nice location and facilities', 'Likely to attend again'],
    ['Excellent organization and content', 'Technical workshops were great', 'Venue was perfect', 'Absolutely will attend'],
    ['Average event experience', 'Panel discussions', 'Venue was adequate', 'Maybe will attend'],
    ['Great learning experience', 'Interactive sessions', 'Excellent venue choice', 'Yes, planning to attend']
  ],
  'survey-course-feedback': [
    ['Not very satisfied, only 3 out of 10', 'Some practical examples', 'Need more interactive content', 'Would not recommend this course'],
    ['Good course overall, 7/10', 'Clear and structured content', 'Could use better pacing', 'Yes, would recommend'],
    ['Excellent learning experience', 'Hands-on practical exercises', 'Nothing significant to improve', 'Definitely recommend'],
    ['Average course, meets expectations', 'Some useful insights', 'More real-world examples', 'Maybe recommend'],
    ['Very good course content', 'Well organized material', 'More time for Q&A', 'Yes, recommend']
  ]
};

function getRandomDate(daysAgo: number) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  date.setHours(randomHours, randomMinutes, 0, 0);
  
  return date.toISOString();
}

function generateCallSid() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'CA';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateDummyResponses(): { responses: DummyResponse[], surveys: DummySurvey[] } {
  const responses: DummyResponse[] = [];
  
  // Generate responses for each survey
  dummySurveys.forEach((survey, surveyIndex) => {
    const responseCount = Math.floor(Math.random() * 6) + 3; // 3-8 responses per survey
    
    for (let i = 0; i < responseCount; i++) {
      const responseType = Math.random();
      let type: 'text' | 'voice-extracted' | 'anonymous';
      let email: string | undefined;
      let callSid: string | undefined;
      let metadata: any = undefined;
      let answers: Record<string, string> = {};
      
      if (responseType < 0.3) {
        // 30% voice responses
        type = 'voice-extracted';
        email = Math.random() < 0.8 ? sampleEmails[Math.floor(Math.random() * sampleEmails.length)] : undefined;
        callSid = generateCallSid();
        const duration = Math.floor(Math.random() * 180) + 30; // 30-210 seconds
        metadata = {
          extractedFrom: `${callSid}.json`,
          questionCount: survey.questions.length,
          extractedAnswers: survey.questions.length,
          duration
        };
        
        // Use voice response templates
        const templates = voiceResponseTemplates[survey.id as keyof typeof voiceResponseTemplates];
        const template = templates[Math.floor(Math.random() * templates.length)];
        survey.questions.forEach((_, idx) => {
          answers[idx.toString()] = template[idx] || 'No response';
        });
      } else if (responseType < 0.7) {
        // 40% text responses with email
        type = 'text';
        email = sampleEmails[Math.floor(Math.random() * sampleEmails.length)];
        
        // Use text response templates
        const templates = textResponseTemplates[survey.id as keyof typeof textResponseTemplates];
        const template = templates[Math.floor(Math.random() * templates.length)];
        survey.questions.forEach((_, idx) => {
          answers[idx.toString()] = template[idx] || 'No response';
        });
      } else {
        // 30% anonymous responses
        type = 'anonymous';
        
        // Use simplified responses for anonymous
        const templates = textResponseTemplates[survey.id as keyof typeof textResponseTemplates];
        const template = templates[Math.floor(Math.random() * templates.length)];
        survey.questions.forEach((_, idx) => {
          answers[idx.toString()] = template[idx]?.split(' ').slice(0, 3).join(' ') || 'Brief response';
        });
      }
      
      responses.push({
        id: nanoid(),
        surveyId: survey.id,
        submittedAt: getRandomDate(90), // Within last 90 days
        answers,
        type,
        email,
        callSid,
        metadata
      });
    }
  });
  
  return { responses, surveys: dummySurveys };
}