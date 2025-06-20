import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { generateAIReminderMessage, getSurveyUrl } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { surveyId, reminderType, emails } = await req.json();

    if (!surveyId || !reminderType || !emails || !Array.isArray(emails)) {
      return NextResponse.json({ 
        message: 'Missing required fields: surveyId, reminderType, emails' 
      }, { status: 400 });
    }

    // Get survey data from database
    const survey = await database.findSurveyById(surveyId);
    if (!survey) {
      return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
    }

    // Check if survey is still active
    const now = new Date();
    const endDate = new Date(survey.end_date);
    if (now > endDate) {
      return NextResponse.json({ message: 'Survey has expired' }, { status: 400 });
    }

    // Get reminder configuration
    const reminderConfig = survey.reminder_config || [];
    const relevantConfig = reminderConfig.find((config: any) => 
      config.type === reminderType
    );

    // Generate survey link
    const surveyUrl = getSurveyUrl(surveyId);

    // Generate reminder message
    let reminderMessage;
    let emailSubject;

    if (relevantConfig && !relevantConfig.useAI && relevantConfig.customMessage) {
      // Use custom message
      reminderMessage = `${relevantConfig.customMessage}\n\n📋 Take the survey: ${surveyUrl}`;
      emailSubject = `${reminderType === 'closing' ? 'Final Reminder' : 'Reminder'}: ${survey.topic}`;
    } else {
      // Use AI-generated message
      reminderMessage = generateAIReminderMessage(survey.topic, surveyUrl, reminderType as any);
      emailSubject = `${
        reminderType === 'opening' ? 'Survey Available' :
        reminderType === 'midpoint' ? 'Survey Reminder' : 
        'Final Call'
      }: ${survey.topic}`;
    }

    // Send emails using the existing send-survey endpoint
    const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/send-survey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surveyLink: surveyUrl,
        emailSubject,
        emailBody: reminderMessage,
        emails
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.message || 'Failed to send reminder emails');
    }

    return NextResponse.json({ 
      message: 'Reminder emails sent successfully',
      reminderType,
      emailsSent: emails.length,
      surveyUrl,
      subject: emailSubject
    }, { status: 200 });

  } catch (error: any) {
    console.error('Failed to generate reminder:', error);
    return NextResponse.json({ 
      message: error.message || 'Failed to generate reminder' 
    }, { status: 500 });
  }
}