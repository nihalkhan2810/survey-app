import { NextRequest, NextResponse } from 'next/server';
import { 
  scheduleCallReminder, 
  testCallReminderFlow, 
  createTestSurvey,
  type CallReminderConfig 
} from '@/lib/call_reminder_scheduler';

export async function POST(req: NextRequest) {
  try {
    const { surveyId, phoneNumber, surveyTopic, testMode = true } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ 
        message: 'Phone number is required for call reminder simulation' 
      }, { status: 400 });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ 
        message: 'Invalid phone number format. Please use: +1 (XXX) XXX-XXXX' 
      }, { status: 400 });
    }

    let finalSurveyId = surveyId;
    let timeline = '';

    // If no survey ID provided, create a test survey
    if (!surveyId) {
      console.log('Creating test survey for call reminder simulation...');
      finalSurveyId = await createTestSurvey();
      
      const now = new Date();
      timeline = [
        `• Survey Start: ${now.toLocaleTimeString()}`,
        `• First Reminder: ${new Date(now.getTime() + (4 * 60 * 1000)).toLocaleTimeString()}`,
        `• Second Reminder: ${new Date(now.getTime() + (5 * 60 * 1000)).toLocaleTimeString()}`,
        `• Survey End: ${new Date(now.getTime() + (6 * 60 * 1000)).toLocaleTimeString()}`,
        `• Call Reminder: ${new Date(now.getTime() + (8 * 60 * 1000)).toLocaleTimeString()} (if no response)`
      ].join('\n');
    }

    // Create call reminder configuration
    const callConfig: CallReminderConfig = {
      enabled: true,
      phoneNumber: phoneNumber,
      surveyId: finalSurveyId,
      surveyTopic: surveyTopic || 'Test Survey',
      testMode: testMode
    };

    // Schedule the call reminder
    console.log(`Scheduling call reminder for survey ${finalSurveyId}...`);
    await scheduleCallReminder(callConfig);

    // Prepare response message
    let message = `Call reminder simulation initiated successfully!`;
    
    if (!surveyId) {
      message += `\n\nTest survey created with ID: ${finalSurveyId}`;
      message += `\nYou can view responses at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/survey/${finalSurveyId}`;
    }
    
    message += `\n\nCall will be triggered 2 minutes after survey end time if you haven't responded.`;
    message += `\nTo test: Wait 6 minutes, then check console logs for call execution.`;
    message += `\n\nMonitor the browser console and server logs for real-time updates.`;

    return NextResponse.json({
      success: true,
      message,
      timeline,
      surveyId: finalSurveyId,
      callConfig: {
        phoneNumber: callConfig.phoneNumber,
        surveyTopic: callConfig.surveyTopic,
        testMode: callConfig.testMode
      }
    });

  } catch (error: any) {
    console.error('Test call reminder error:', error);
    return NextResponse.json({ 
      message: `Failed to initialize call reminder simulation: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}

// GET endpoint to check call reminder status
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const surveyId = url.searchParams.get('surveyId');

    if (!surveyId) {
      return NextResponse.json({ 
        message: 'Survey ID is required' 
      }, { status: 400 });
    }

    // Import the function to get call reminders
    const { getCallRemindersForSurvey } = await import('@/lib/call_reminder_scheduler');
    const reminders = await getCallRemindersForSurvey(surveyId);

    return NextResponse.json({
      surveyId,
      reminders,
      total: reminders.length
    });

  } catch (error: any) {
    console.error('Get call reminders error:', error);
    return NextResponse.json({ 
      message: `Failed to get call reminders: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}