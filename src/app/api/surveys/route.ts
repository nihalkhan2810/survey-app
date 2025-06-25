import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { database } from '@/lib/database';
import { generateDummyResponses } from '@/lib/dummy-responses';
import { scheduleCallReminder, type CallReminderConfig } from '@/lib/call_reminder_scheduler';

export async function POST(req: NextRequest) {
  try {
    const { 
      topic, 
      questions, 
      start_date, 
      end_date, 
      reminder_dates, 
      reminder_config, 
      auto_send_reminders,
      call_reminder_enabled,
      call_reminder_phone,
      call_reminder_test_mode
    } = await req.json();

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
      call_reminder_enabled: call_reminder_enabled || false,
      call_reminder_phone: call_reminder_phone || '',
      call_reminder_test_mode: call_reminder_test_mode || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database (DynamoDB or in-memory based on configuration)
    await database.createSurvey(surveyData);

    // Schedule call reminder if enabled
    if (call_reminder_enabled && call_reminder_phone) {
      try {
        const callConfig: CallReminderConfig = {
          enabled: true,
          phoneNumber: call_reminder_phone,
          surveyId: surveyId,
          surveyTopic: topic,
          callScheduledAt: end_date,
          testMode: call_reminder_test_mode
        };
        
        await scheduleCallReminder(callConfig);
        console.log(`Call reminder scheduled for survey ${surveyId} to ${call_reminder_phone}`);
      } catch (callError) {
        console.error('Failed to schedule call reminder:', callError);
        // Don't fail the survey creation if call scheduling fails
      }
    }

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

    // Sort surveys by creation date, newest first
    formattedSurveys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(formattedSurveys, { status: 200 });
  } catch (error) {
    console.error('Failed to list surveys:', error);
    return NextResponse.json([], { status: 200 });
  }
} 