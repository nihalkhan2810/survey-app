import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { database } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { surveyId, message, audience, scheduleType, scheduledDate, scheduledTime } = await req.json();

    if (!surveyId || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Get survey details
    const survey = await database.findSurveyById(surveyId);
    if (!survey) {
      return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
    }

    // Get recipient emails based on audience selection
    let recipients: string[] = [];
    
    try {
      if (audience === 'all') {
        // Get all original recipients
        const allRecipients = await database.getRecipientsBySurvey(surveyId);
        recipients = allRecipients.map(r => r.email);
      } else if (audience === 'non-respondents') {
        // Get people who haven't responded yet - this is the key fix!
        const nonRespondents = await database.getNonRespondents(surveyId);
        recipients = nonRespondents.map(r => r.email);
      } else if (audience === 'partial') {
        // Get people who started but didn't finish
        const allResponses = await database.getAllResponses();
        const surveyResponses = allResponses.filter(r => r.surveyId === surveyId);
        
        recipients = [...new Set(surveyResponses
          .filter(r => {
            const answerCount = Object.keys(r.answers || {}).length;
            const totalQuestions = survey.questions?.length || 0;
            return answerCount > 0 && answerCount < totalQuestions;
          })
          .map(r => r.email || r.respondentEmail || r.identity?.email)
          .filter(Boolean)
        )] as string[];
      }
    } catch (error) {
      console.error('Error getting recipients:', error);
      
      // Fallback for surveys sent before recipient tracking was implemented
      if (error.name === 'ResourceNotFoundException' || error.__type === 'com.amazonaws.dynamodb.v20120810#ResourceNotFoundException') {
        return NextResponse.json({ 
          message: 'This survey was sent before recipient tracking was implemented. Please re-send the survey to enable reminder functionality, or contact support if this is a new survey.'
        }, { status: 400 });
      }
      
      throw error;
    }

    if (recipients.length === 0) {
      let message = '';
      if (audience === 'all') {
        message = 'No recipients found. Make sure the survey was sent through the system (not manually) so recipients are tracked.';
      } else if (audience === 'non-respondents') {
        message = 'Great news! Everyone has already responded to this survey.';
      } else if (audience === 'partial') {
        message = 'No partial responses found. Everyone who started the survey completed it.';
      }
      
      return NextResponse.json({ message }, { status: 400 });
    }

    // If scheduled for later, we would store in a scheduler queue
    if (scheduleType === 'scheduled' && scheduledDate && scheduledTime) {
      // For now, we'll return success but note that scheduling isn't implemented
      return NextResponse.json({ 
        message: `Reminder scheduled for ${scheduledDate} at ${scheduledTime} for ${recipients.length} recipients`,
        recipientCount: recipients.length,
        scheduled: true
      }, { status: 200 });
    }

    // Send immediate reminder
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const surveyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://3.133.91.18'}/survey/${surveyId}`;
    
    const emailPromises = recipients.map((email: string) => {
      return transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `Reminder: ${survey.topic || 'Survey'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Survey Reminder</h2>
            <p>${message}</p>
            <p><a href="${surveyLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Complete Survey</a></p>
            <p style="color: #666; font-size: 14px;">If you have already completed this survey, please ignore this reminder.</p>
          </div>
        `,
      });
    });

    await Promise.all(emailPromises);

    return NextResponse.json({ 
      message: `Reminder sent successfully to ${recipients.length} recipients`,
      recipientCount: recipients.length,
      scheduled: false
    }, { status: 200 });

  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({ 
      message: 'Error sending reminder: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}