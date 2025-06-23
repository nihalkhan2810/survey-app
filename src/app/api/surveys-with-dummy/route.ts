import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { generateDummyResponses } from '@/lib/dummy-responses';

export async function GET(req: NextRequest) {
  try {
    // Get all surveys from database
    const surveys = await database.getAllSurveys();
    
    // Transform data for compatibility with frontend
    const formattedSurveys = surveys.map(survey => ({
      id: survey.id,
      title: survey.topic || survey.title,
      topic: survey.topic,
      createdAt: survey.createdAt,
      created_at: survey.createdAt, // For compatibility
      start_date: survey.start_date,
      end_date: survey.end_date,
      reminder_dates: survey.reminder_dates,
      reminder_config: survey.reminder_config || [],
      auto_send_reminders: survey.auto_send_reminders || false,
      questions: survey.questions || []
    }));

    // Add dummy surveys for responses filtering only
    const { surveys: dummySurveys } = generateDummyResponses();
    const allSurveys = [...formattedSurveys, ...dummySurveys];

    // Sort surveys by creation date, newest first
    allSurveys.sort((a, b) => {
      const dateA = new Date(a.createdAt || new Date()).getTime();
      const dateB = new Date(b.createdAt || new Date()).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(allSurveys, { status: 200 });
  } catch (error) {
    console.error('Failed to list surveys:', error);
    
    // Return dummy surveys as fallback
    const { surveys: dummySurveys } = generateDummyResponses();
    return NextResponse.json(dummySurveys, { status: 200 });
  }
}