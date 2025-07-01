// Industry configuration utilities

export interface IndustryConfig {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  questionTypes: string[];
}

export interface DataSourceConfig {
  useDummyData: boolean;
  industryId: string;
}

export const industryConfigs: Record<string, IndustryConfig> = {
  education: {
    id: 'education',
    name: 'Education Surveys',
    description: 'Course evaluations, student feedback, and academic assessments',
    metrics: ['Student Satisfaction', 'Course Difficulty', 'Teaching Quality', 'Learning Outcomes'],
    questionTypes: ['Course Rating', 'Professor Evaluation', 'Curriculum Feedback', 'Campus Experience']
  },
  employee: {
    id: 'employee',
    name: 'Employee Feedback',
    description: 'Workplace satisfaction, performance reviews, and team dynamics',
    metrics: ['Job Satisfaction', 'Work-Life Balance', 'Management Quality', 'Career Development'],
    questionTypes: ['Performance Review', 'Team Collaboration', 'Company Culture', 'Training Needs']
  },
  customer: {
    id: 'customer',
    name: 'Customer Insights',
    description: 'Product feedback, service quality, and customer satisfaction',
    metrics: ['Customer Satisfaction', 'Product Quality', 'Service Rating', 'Loyalty Score'],
    questionTypes: ['Product Review', 'Service Experience', 'Purchase Intent', 'Recommendation']
  },
  community: {
    id: 'community',
    name: 'Community Voices',
    description: 'Local opinions, civic engagement, and community feedback',
    metrics: ['Community Engagement', 'Service Satisfaction', 'Local Issues', 'Participation Rate'],
    questionTypes: ['Public Opinion', 'Local Services', 'Community Events', 'Civic Participation']
  },
  public: {
    id: 'public',
    name: 'Public Polls',
    description: 'Political opinions, social issues, and demographic research',
    metrics: ['Opinion Distribution', 'Demographic Breakdown', 'Trend Analysis', 'Confidence Level'],
    questionTypes: ['Political Opinion', 'Social Issues', 'Demographics', 'Trend Questions']
  },
  event: {
    id: 'event',
    name: 'Event Feedback',
    description: 'Conference evaluations, event experience, and attendee satisfaction',
    metrics: ['Event Satisfaction', 'Content Quality', 'Organization Rating', 'Attendance Value'],
    questionTypes: ['Session Rating', 'Speaker Evaluation', 'Venue Experience', 'Future Attendance']
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Wellness',
    description: 'Patient satisfaction, treatment feedback, and wellness assessments',
    metrics: ['Patient Satisfaction', 'Treatment Effectiveness', 'Care Quality', 'Wellness Score'],
    questionTypes: ['Treatment Review', 'Care Experience', 'Health Assessment', 'Provider Rating']
  }
};

export function getCurrentIndustryConfig(): IndustryConfig {
  // Check if we're on client side
  if (typeof window !== 'undefined') {
    const selectedIndustry = localStorage.getItem('selectedIndustry') || 'education';
    const customMetrics = localStorage.getItem('customMetrics');
    
    const baseConfig = industryConfigs[selectedIndustry] || industryConfigs.education;
    
    // Add custom metrics if they exist
    if (customMetrics) {
      try {
        const parsed = JSON.parse(customMetrics);
        return {
          ...baseConfig,
          metrics: [...baseConfig.metrics, ...parsed]
        };
      } catch (e) {
        return baseConfig;
      }
    }
    
    return baseConfig;
  }
  
  // Server-side fallback to education
  return industryConfigs.education;
}

export function getIndustryMetrics(): string[] {
  return getCurrentIndustryConfig().metrics;
}

export function getIndustryName(): string {
  return getCurrentIndustryConfig().name;
}

export function getIndustryQuestionTypes(): string[] {
  return getCurrentIndustryConfig().questionTypes;
}

// Generic labels for metrics (used when industry isn't specified)
export const genericMetricLabels: Record<string, string> = {
  'Student Satisfaction': 'Satisfaction Score',
  'Course Difficulty': 'Difficulty Rating',
  'Teaching Quality': 'Quality Rating',
  'Learning Outcomes': 'Outcome Score',
  'Job Satisfaction': 'Satisfaction Score',
  'Work-Life Balance': 'Balance Rating',
  'Management Quality': 'Leadership Score',
  'Career Development': 'Growth Rating',
  'Customer Satisfaction': 'Satisfaction Score',
  'Product Quality': 'Quality Rating',
  'Service Rating': 'Service Score',
  'Loyalty Score': 'Loyalty Index',
  'Community Engagement': 'Engagement Level',
  'Service Satisfaction': 'Service Rating',
  'Local Issues': 'Issue Priority',
  'Participation Rate': 'Participation %',
  'Opinion Distribution': 'Opinion Spread',
  'Demographic Breakdown': 'Demographics',
  'Trend Analysis': 'Trend Score',
  'Confidence Level': 'Confidence %',
  'Event Satisfaction': 'Event Rating',
  'Content Quality': 'Content Score',
  'Organization Rating': 'Organization Score',
  'Attendance Value': 'Value Rating',
  'Patient Satisfaction': 'Patient Score',
  'Treatment Effectiveness': 'Treatment Score',
  'Care Quality': 'Care Rating',
  'Wellness Score': 'Wellness Index'
};

// Data source configuration
export function getDataSourceConfig(): DataSourceConfig {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('sayz_data_source_config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fall back to defaults if parsing fails
      }
    }
  }
  
  // Default configuration
  return {
    useDummyData: true, // Default to dummy data for demo purposes
    industryId: getCurrentIndustryConfig().id
  };
}

export function setDataSourceConfig(config: DataSourceConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sayz_data_source_config', JSON.stringify(config));
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'sayz_data_source_config',
      newValue: JSON.stringify(config)
    }));
  }
}

export function toggleDummyData(): boolean {
  const config = getDataSourceConfig();
  const newConfig = { ...config, useDummyData: !config.useDummyData };
  setDataSourceConfig(newConfig);
  return newConfig.useDummyData;
}

export function isUsingDummyData(): boolean {
  return getDataSourceConfig().useDummyData;
}