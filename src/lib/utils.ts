import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
  process.env.NEXTAUTH_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://3.133.91.18');

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSurveyUrl(surveyId: string): string {
  const baseUrl = appUrl;
  return `${baseUrl}/survey/${surveyId}`;
}

export function getSubmitUrl(surveyId: string): string {
  const baseUrl = appUrl;
  return `${baseUrl}/api/submit`;
}

export function getBaseUrl(): string {
  return appUrl;
}

// Professional reminder calculation logic
export interface ReminderConfig {
  dates: string[];
  type: 'opening' | 'midpoint' | 'closing';
  description: string;
}

export function calculateReminderDates(startDate: string, endDate: string): ReminderConfig[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const reminders: ReminderConfig[] = [];
  
  if (diffDays <= 3) {
    // Short surveys: Only closing day reminder
    reminders.push({
      dates: [endDate],
      type: 'closing',
      description: 'Final day reminder'
    });
  } else if (diffDays <= 14) {
    // Medium surveys: Midpoint + closing day
    const midpoint = new Date(start.getTime() + (diffTime / 2));
    const midpointStr = midpoint.toISOString().split('T')[0];
    
    reminders.push({
      dates: [midpointStr],
      type: 'midpoint', 
      description: 'Midpoint reminder'
    });
    reminders.push({
      dates: [endDate],
      type: 'closing',
      description: 'Final day reminder'
    });
  } else {
    // Long surveys: Opening + midpoint + closing
    const midpoint = new Date(start.getTime() + (diffTime / 2));
    const midpointStr = midpoint.toISOString().split('T')[0];
    
    reminders.push({
      dates: [startDate],
      type: 'opening',
      description: 'Survey opening reminder'
    });
    reminders.push({
      dates: [midpointStr],
      type: 'midpoint',
      description: 'Midpoint reminder'
    });
    reminders.push({
      dates: [endDate],
      type: 'closing', 
      description: 'Final day reminder'
    });
  }
  
  return reminders;
}

// AI-powered reminder message generation
export function generateAIReminderMessage(surveyTopic: string, surveyUrl: string, reminderType: 'opening' | 'midpoint' | 'closing'): string {
  const messages = {
    opening: `🎯 **Survey Now Available: ${surveyTopic}**

Your participation is valuable! We've just launched a new survey about ${surveyTopic.toLowerCase()}.

📅 **Take the survey now:** ${surveyUrl}

This will only take a few minutes of your time, and your responses will help us gather important insights.

Thank you for your participation!`,

    midpoint: `⏰ **Reminder: ${surveyTopic} Survey**

Hi there! We wanted to remind you about our ongoing survey on ${surveyTopic.toLowerCase()}.

🔗 **Complete the survey here:** ${surveyUrl}

If you've already participated, thank you! If not, there's still time to share your valuable insights.

Your input matters to us!`,

    closing: `🚨 **Final Call: ${surveyTopic} Survey Closing Soon**

This is your last chance to participate in our survey about ${surveyTopic.toLowerCase()}.

⚡ **Take the survey now:** ${surveyUrl}

The survey will be closing soon, so don't miss this opportunity to share your thoughts.

Thank you for your time and participation!`
  };

  return messages[reminderType];
}

// Professional validation for reminder messages
export function validateReminderMessage(message: string): { isValid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Reminder message cannot be empty' };
  }
  
  if (message.length < 10) {
    return { isValid: false, error: 'Reminder message must be at least 10 characters long' };
  }
  
  if (message.length > 1000) {
    return { isValid: false, error: 'Reminder message must be less than 1000 characters' };
  }
  
  return { isValid: true };
}