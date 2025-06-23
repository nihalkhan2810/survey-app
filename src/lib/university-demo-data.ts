export interface DemoResponse {
  id: string;
  surveyId: string;
  surveyTitle: string;
  respondentName: string;
  responseType: 'link' | 'call';
  timestamp: string;
  duration?: number;
  professorName: string;
  department: string;
  course: string;
  semester: string;
  responses: {
    question: string;
    answer: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    category: 'teaching' | 'communication' | 'knowledge' | 'availability' | 'fairness';
  }[];
  overallSentiment: 'positive' | 'negative' | 'neutral';
  satisfactionScore: number;
  ratings: {
    teaching: number;
    communication: number;
    knowledge: number;
    availability: number;
    fairness: number;
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

export const universityDemoResponses: DemoResponse[] = [
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
        answer: 'Dr. Chen is an outstanding teacher! She explains complex concepts clearly and makes programming fun.',
        sentiment: 'positive',
        confidence: 0.95,
        category: 'teaching'
      }
    ],
    overallSentiment: 'positive',
    satisfactionScore: 9,
    ratings: { teaching: 5, communication: 5, knowledge: 5, availability: 5, fairness: 4 }
  },
  {
    id: 'resp_2',
    surveyId: 'survey_math_201',
    surveyTitle: 'MATH 201 - Calculus II',
    respondentName: 'Michael Chen',
    responseType: 'call',
    timestamp: '2024-12-14T14:22:00Z',
    duration: 180,
    professorName: 'Prof. Robert Johnson',
    department: 'Mathematics',
    course: 'MATH 201',
    semester: 'Fall 2024',
    responses: [
      {
        question: 'How clear were the professor\'s explanations?',
        answer: 'Sometimes the explanations were too fast and hard to follow. The material is challenging.',
        sentiment: 'negative',
        confidence: 0.82,
        category: 'communication'
      }
    ],
    overallSentiment: 'negative',
    satisfactionScore: 5,
    ratings: { teaching: 3, communication: 2, knowledge: 4, availability: 3, fairness: 4 }
  },
  {
    id: 'resp_3',
    surveyId: 'survey_eng_301',
    surveyTitle: 'ENG 301 - Advanced Composition',
    respondentName: 'Emily Rodriguez',
    responseType: 'link',
    timestamp: '2024-12-13T09:15:00Z',
    professorName: 'Dr. Sarah Martinez',
    department: 'English',
    course: 'ENG 301',
    semester: 'Fall 2024',
    responses: [
      {
        question: 'How helpful was the professor\'s feedback?',
        answer: 'Dr. Martinez provides incredibly detailed feedback that really helps improve my writing.',
        sentiment: 'positive',
        confidence: 0.87,
        category: 'teaching'
      }
    ],
    overallSentiment: 'positive',
    satisfactionScore: 8,
    ratings: { teaching: 5, communication: 4, knowledge: 5, availability: 4, fairness: 5 }
  },
  {
    id: 'resp_4',
    surveyId: 'survey_phys_101',
    surveyTitle: 'PHYS 101 - General Physics',
    respondentName: 'David Thompson',
    responseType: 'call',
    timestamp: '2024-12-12T16:45:00Z',
    duration: 240,
    professorName: 'Dr. Lisa Wang',
    department: 'Physics',
    course: 'PHYS 101',
    semester: 'Fall 2024',
    responses: [
      {
        question: 'How would you rate the course difficulty?',
        answer: 'The course is very challenging but Dr. Wang makes the concepts understandable with great examples.',
        sentiment: 'positive',
        confidence: 0.94,
        category: 'teaching'
      }
    ],
    overallSentiment: 'positive',
    satisfactionScore: 8,
    ratings: { teaching: 5, communication: 4, knowledge: 5, availability: 4, fairness: 4 }
  },
  {
    id: 'resp_5',
    surveyId: 'survey_bio_200',
    surveyTitle: 'BIO 200 - Cell Biology',
    respondentName: 'Jessica Park',
    responseType: 'link',
    timestamp: '2024-12-11T11:20:00Z',
    professorName: 'Prof. James Wilson',
    department: 'Biology',
    course: 'BIO 200',
    semester: 'Fall 2024',
    responses: [
      {
        question: 'How organized were the lectures?',
        answer: 'Prof. Wilson\'s lectures are well-structured and he uses great visual aids.',
        sentiment: 'positive',
        confidence: 0.98,
        category: 'teaching'
      }
    ],
    overallSentiment: 'positive',
    satisfactionScore: 9,
    ratings: { teaching: 5, communication: 5, knowledge: 5, availability: 3, fairness: 4 }
  },
  {
    id: 'resp_6',
    surveyId: 'survey_hist_150',
    surveyTitle: 'HIST 150 - World History',
    respondentName: 'Alex Kim',
    responseType: 'call',
    timestamp: '2024-12-10T13:30:00Z',
    duration: 150,
    professorName: 'Dr. Maria Garcia',
    department: 'History',
    course: 'HIST 150',
    semester: 'Fall 2024',
    responses: [
      {
        question: 'How engaging were the lectures?',
        answer: 'Dr. Garcia brings history to life with her storytelling. Very engaging and passionate.',
        sentiment: 'positive',
        confidence: 0.89,
        category: 'teaching'
      }
    ],
    overallSentiment: 'positive',
    satisfactionScore: 9,
    ratings: { teaching: 5, communication: 5, knowledge: 5, availability: 4, fairness: 5 }
  },
  {
    id: 'resp_7',
    surveyId: 'survey_chem_101',
    surveyTitle: 'CHEM 101 - General Chemistry',
    respondentName: 'Ryan Davis',
    responseType: 'link',
    timestamp: '2024-12-09T15:20:00Z',
    professorName: 'Prof. David Lee',
    department: 'Chemistry',
    course: 'CHEM 101',
    semester: 'Fall 2024',
    responses: [
      {
        question: 'How helpful were office hours?',
        answer: 'Prof. Lee is rarely available and when he is, he seems rushed and unhelpful.',
        sentiment: 'negative',
        confidence: 0.91,
        category: 'availability'
      }
    ],
    overallSentiment: 'negative',
    satisfactionScore: 4,
    ratings: { teaching: 3, communication: 3, knowledge: 4, availability: 2, fairness: 3 }
  },
  {
    id: 'resp_8',
    surveyId: 'survey_psyc_201',
    surveyTitle: 'PSYC 201 - Developmental Psychology',
    respondentName: 'Sophia Brown',
    responseType: 'link',
    timestamp: '2024-12-08T10:45:00Z',
    professorName: 'Dr. Amanda Taylor',
    department: 'Psychology',
    course: 'PSYC 201',
    semester: 'Fall 2024',
    responses: [
      {
        question: 'How fair were the exams?',
        answer: 'Dr. Taylor\'s exams are very fair and directly related to what we covered in class.',
        sentiment: 'positive',
        confidence: 0.85,
        category: 'fairness'
      }
    ],
    overallSentiment: 'positive',
    satisfactionScore: 8,
    ratings: { teaching: 4, communication: 4, knowledge: 5, availability: 4, fairness: 5 }
  }
];

export const professorStats: ProfessorStats[] = [
  {
    id: 'prof_1',
    name: 'Dr. Emily Chen',
    department: 'Computer Science',
    totalResponses: 45,
    averageRating: 4.8,
    ratings: { teaching: 4.9, communication: 4.8, knowledge: 4.9, availability: 4.7, fairness: 4.6 },
    courses: ['CS 101', 'CS 201', 'CS 301'],
    sentimentBreakdown: { positive: 89, neutral: 8, negative: 3 },
    recentTrend: 'up'
  },
  {
    id: 'prof_2',
    name: 'Dr. Maria Garcia',
    department: 'History',
    totalResponses: 38,
    averageRating: 4.7,
    ratings: { teaching: 4.8, communication: 4.9, knowledge: 4.8, availability: 4.5, fairness: 4.7 },
    courses: ['HIST 150', 'HIST 250', 'HIST 350'],
    sentimentBreakdown: { positive: 84, neutral: 13, negative: 3 },
    recentTrend: 'stable'
  },
  {
    id: 'prof_3',
    name: 'Dr. Lisa Wang',
    department: 'Physics',
    totalResponses: 42,
    averageRating: 4.6,
    ratings: { teaching: 4.7, communication: 4.4, knowledge: 4.9, availability: 4.3, fairness: 4.5 },
    courses: ['PHYS 101', 'PHYS 201'],
    sentimentBreakdown: { positive: 79, neutral: 16, negative: 5 },
    recentTrend: 'up'
  },
  {
    id: 'prof_4',
    name: 'Prof. James Wilson',
    department: 'Biology',
    totalResponses: 36,
    averageRating: 4.5,
    ratings: { teaching: 4.6, communication: 4.7, knowledge: 4.8, availability: 4.1, fairness: 4.3 },
    courses: ['BIO 200', 'BIO 300'],
    sentimentBreakdown: { positive: 75, neutral: 19, negative: 6 },
    recentTrend: 'stable'
  },
  {
    id: 'prof_5',
    name: 'Dr. Sarah Martinez',
    department: 'English',
    totalResponses: 33,
    averageRating: 4.4,
    ratings: { teaching: 4.6, communication: 4.3, knowledge: 4.7, availability: 4.2, fairness: 4.4 },
    courses: ['ENG 301', 'ENG 401'],
    sentimentBreakdown: { positive: 73, neutral: 21, negative: 6 },
    recentTrend: 'up'
  },
  {
    id: 'prof_6',
    name: 'Dr. Amanda Taylor',
    department: 'Psychology',
    totalResponses: 40,
    averageRating: 4.3,
    ratings: { teaching: 4.2, communication: 4.1, knowledge: 4.6, availability: 4.2, fairness: 4.7 },
    courses: ['PSYC 201', 'PSYC 301'],
    sentimentBreakdown: { positive: 68, neutral: 25, negative: 7 },
    recentTrend: 'stable'
  },
  {
    id: 'prof_7',
    name: 'Prof. Robert Johnson',
    department: 'Mathematics',
    totalResponses: 44,
    averageRating: 3.8,
    ratings: { teaching: 3.9, communication: 3.2, knowledge: 4.3, availability: 3.8, fairness: 4.0 },
    courses: ['MATH 201', 'MATH 301'],
    sentimentBreakdown: { positive: 52, neutral: 31, negative: 17 },
    recentTrend: 'down'
  },
  {
    id: 'prof_8',
    name: 'Prof. David Lee',
    department: 'Chemistry',
    totalResponses: 29,
    averageRating: 3.4,
    ratings: { teaching: 3.5, communication: 3.3, knowledge: 4.1, availability: 2.8, fairness: 3.2 },
    courses: ['CHEM 101', 'CHEM 201'],
    sentimentBreakdown: { positive: 38, neutral: 34, negative: 28 },
    recentTrend: 'down'
  },
  {
    id: 'prof_9',
    name: 'Dr. Michael Brown',
    department: 'Economics',
    totalResponses: 35,
    averageRating: 4.2,
    ratings: { teaching: 4.1, communication: 4.0, knowledge: 4.5, availability: 4.1, fairness: 4.3 },
    courses: ['ECON 101', 'ECON 201'],
    sentimentBreakdown: { positive: 66, neutral: 26, negative: 8 },
    recentTrend: 'stable'
  },
  {
    id: 'prof_10',
    name: 'Dr. Jennifer Adams',
    department: 'Sociology',
    totalResponses: 31,
    averageRating: 4.1,
    ratings: { teaching: 4.0, communication: 4.2, knowledge: 4.3, availability: 3.9, fairness: 4.1 },
    courses: ['SOC 101', 'SOC 201'],
    sentimentBreakdown: { positive: 65, neutral: 23, negative: 12 },
    recentTrend: 'up'
  }
];

export const departmentStats = [
  {
    name: 'Computer Science',
    averageRating: 4.6,
    totalResponses: 128,
    professorCount: 3,
    topCourse: 'CS 101',
    sentiment: { positive: 85, neutral: 12, negative: 3 }
  },
  {
    name: 'History',
    averageRating: 4.5,
    totalResponses: 95,
    professorCount: 2,
    topCourse: 'HIST 150',
    sentiment: { positive: 82, neutral: 15, negative: 3 }
  },
  {
    name: 'Physics',
    averageRating: 4.4,
    totalResponses: 87,
    professorCount: 2,
    topCourse: 'PHYS 101',
    sentiment: { positive: 78, neutral: 17, negative: 5 }
  },
  {
    name: 'Biology',
    averageRating: 4.3,
    totalResponses: 76,
    professorCount: 2,
    topCourse: 'BIO 200',
    sentiment: { positive: 75, neutral: 19, negative: 6 }
  },
  {
    name: 'Mathematics',
    averageRating: 3.9,
    totalResponses: 112,
    professorCount: 3,
    topCourse: 'MATH 201',
    sentiment: { positive: 58, neutral: 28, negative: 14 }
  }
];

export const getUniversitySentimentAnalysis = () => {
  const totalResponses = universityDemoResponses.length;
  const sentimentCounts = universityDemoResponses.reduce((acc, response) => {
    acc[response.overallSentiment]++;
    return acc;
  }, { positive: 0, negative: 0, neutral: 0 });

  const averageSatisfaction = universityDemoResponses.reduce((sum, response) => sum + response.satisfactionScore, 0) / totalResponses;

  return {
    totalResponses,
    sentimentCounts,
    sentimentPercentages: {
      positive: Math.round((sentimentCounts.positive / totalResponses) * 100),
      negative: Math.round((sentimentCounts.negative / totalResponses) * 100),
      neutral: Math.round((sentimentCounts.neutral / totalResponses) * 100)
    },
    averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
    topKeywords: ['teaching', 'clear', 'helpful', 'engaging', 'organized', 'available', 'fair'],
    recentTrends: {
      thisWeek: { positive: 72, negative: 15, neutral: 13 },
      lastWeek: { positive: 68, negative: 18, neutral: 14 },
      change: { positive: +4, negative: -3, neutral: -1 }
    }
  };
};

export const getTopProfessors = (limit: number = 10) => {
  return professorStats
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);
};

export const getTopProfessorsByCategory = (category: keyof ProfessorStats['ratings'], limit: number = 5) => {
  return professorStats
    .sort((a, b) => b.ratings[category] - a.ratings[category])
    .slice(0, limit);
};