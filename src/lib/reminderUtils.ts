export interface ReminderConfig {
  dates: string[];
  useAI: boolean;
  customMessage?: string;
  surveyLink: string;
  surveyTopic: string;
}

export const calculateReminderDates = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const reminders: string[] = [];
  
  if (durationDays <= 1) {
    // Same day: 2 hours before end
    const reminderTime = new Date(end.getTime() - (2 * 60 * 60 * 1000));
    reminders.push(reminderTime.toISOString());
  } else if (durationDays <= 3) {
    // Short survey (2-3 days): closing day only
    reminders.push(endDate);
  } else if (durationDays <= 7) {
    // Week-long: midpoint and closing
    const midpoint = new Date(start.getTime() + ((end.getTime() - start.getTime()) / 2));
    reminders.push(midpoint.toISOString().split('T')[0]);
    reminders.push(endDate);
  } else if (durationDays <= 30) {
    // Month-long: 1/3 before end and closing
    const reminderPoint = new Date(end.getTime() - ((end.getTime() - start.getTime()) / 3));
    reminders.push(reminderPoint.toISOString().split('T')[0]);
    reminders.push(endDate);
  } else {
    // Long-term: weekly reminders and closing
    const weeklyReminder = new Date(end.getTime() - (7 * 24 * 60 * 60 * 1000));
    const finalReminder = new Date(end.getTime() - (24 * 60 * 60 * 1000));
    reminders.push(weeklyReminder.toISOString().split('T')[0]);
    reminders.push(finalReminder.toISOString().split('T')[0]);
    reminders.push(endDate);
  }
  
  return reminders;
};

export const generateReminderMessage = async (
  surveyTopic: string, 
  surveyLink: string, 
  isClosingReminder: boolean = false
): Promise<string> => {
  const prompt = isClosingReminder 
    ? `Generate a professional, urgent reminder message for a survey titled "${surveyTopic}". This is the final reminder as the survey closes today. Include a call to action. Keep it concise and professional.`
    : `Generate a professional, friendly reminder message for a survey titled "${surveyTopic}". This is a mid-period reminder. Keep it encouraging and professional.`;

  try {
    const response = await fetch('/api/generate-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, surveyLink }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate reminder message');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    // Fallback message if AI fails
    return isClosingReminder
      ? `⏰ Final Reminder: "${surveyTopic}" survey closes today! Your input is valuable - please take a moment to participate: ${surveyLink}`
      : `📝 Friendly Reminder: Please take a moment to complete our "${surveyTopic}" survey. Your feedback matters! ${surveyLink}`;
  }
}; 