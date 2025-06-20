import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { database } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { topic, questions, start_date, end_date, reminder_dates, reminder_config, auto_send_reminders } = await req.json();

    if (!topic || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ message: 'Invalid survey data' }, { status: 400 });
    }

    if (!start_date || !end_date) {
      return NextResponse.json({ message: 'Start date and end date are required' }, { status: 400 });
    }

    // Professional validation for reminder configuration
    if (reminder_config && !Array.isArray(reminder_config)) {
      return NextResponse.json({ message: 'Invalid reminder configuration' }, { status: 400 });
    }

    const surveyId = nanoid(10);
    const surveyData = {
      id: surveyId,
      topic,
      questions,
      start_date,
      end_date,
      reminder_dates: reminder_dates || [],
      reminder_config: reminder_config || [],
      auto_send_reminders: auto_send_reminders || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database (DynamoDB or in-memory based on configuration)
    await database.createSurvey(surveyData);

    return NextResponse.json({ surveyId }, { status: 201 });
  } catch (error) {
    console.error('Failed to save survey:', error);
    return NextResponse.json({ message: 'Failed to save survey' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get all surveys from database
    const surveys = await database.getAllSurveys();
    
    // Transform data for compatibility with frontend
    const formattedSurveys = surveys.map(survey => ({
      id: survey.id,
      topic: survey.topic,
      createdAt: survey.createdAt,
      created_at: survey.createdAt, // For compatibility
      start_date: survey.start_date,
      end_date: survey.end_date,
      reminder_dates: survey.reminder_dates,
      reminder_config: survey.reminder_config || [],
      auto_send_reminders: survey.auto_send_reminders || false,
    }));

    // Sort surveys by creation date, newest first
    formattedSurveys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(formattedSurveys, { status: 200 });
  } catch (error) {
    console.error('Failed to list surveys:', error);
    return NextResponse.json({ message: 'Failed to list surveys' }, { status: 500 });
  }
} 