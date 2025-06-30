import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createParticipants } from '@/lib/participant_tracker';
import { scheduleEmailReminders } from '@/lib/email_reminder_scheduler';

export async function POST(req: NextRequest) {
  const { 
    surveyLink, 
    emailSubject, 
    emailBody, 
    emails, 
    phoneNumbers, 
    callReminderEnabled, 
    surveyId,
    autoSendReminders,
    testReminderMode
  } = await req.json();

  if (!surveyLink || !emailSubject || !emailBody || !emails || !emails.length) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Create participant tracking if call reminders are enabled
  let participantBatch = null;
  if (callReminderEnabled && phoneNumbers) {
    const emailPhonePairs = emails.map((email: string, index: number) => ({
      email,
      phone: phoneNumbers[index] || ''
    }));
    participantBatch = await createParticipants(surveyId, emailPhonePairs);
  }

  // Generate a unique batch identifier for this email send
  const batchId = Date.now().toString();

  const emailPromises = emails.map((email: string, index: number) => {
    let personalizedLink = surveyLink;
    
    // Create a simple token to hide email (base64 encode email:batch)
    const token = Buffer.from(`${email}:${batchId}`).toString('base64');
    
    // Always include token parameter for tracking
    const hasParams = personalizedLink.includes('?');
    personalizedLink = `${personalizedLink}${hasParams ? '&' : '?'}t=${token}`;
    
    // Add participant ID to survey link if tracking is enabled
    if (participantBatch) {
      const participant = participantBatch.participants[index];
      if (participant) {
        personalizedLink = `${personalizedLink}&participantId=${participant.id}`;
      }
    }
    
    return transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: emailSubject,
      html: `<p>${emailBody}</p><p><a href="${personalizedLink}">Click here to take the survey</a></p>`,
    });
  });

  try {
    await Promise.all(emailPromises);
    
    // Call reminders are now triggered immediately after the first response
    if (callReminderEnabled && phoneNumbers && surveyId && participantBatch) {
      console.log(`Call reminder tracking enabled for survey ${surveyId}, batch ${participantBatch.batchId}`);
      console.log(`Calls will be triggered immediately after the first participant responds`);
    }
    
    // Schedule email reminders if enabled
    let emailReminderScheduled = false;
    if (autoSendReminders && surveyId) {
      try {
        // Get survey data to get end date
        const surveyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/surveys/${surveyId}`);
        if (surveyResponse.ok) {
          const surveyData = await surveyResponse.json();
          
          if (surveyData.end_date) {
            // Extract survey topic from subject or use surveyData
            const surveyTopic = surveyData.topic || emailSubject.replace('Survey: ', '');
            
            emailReminderScheduled = await scheduleEmailReminders(
              surveyId,
              emails,
              surveyTopic,
              surveyLink,
              surveyData.end_date,
              testReminderMode || false
            );
          }
        }
      } catch (reminderError) {
        console.error('Failed to schedule email reminder:', reminderError);
        // Don't fail the entire send operation if reminder scheduling fails
      }
    }
    
    return NextResponse.json({ 
      message: 'Emails sent successfully',
      surveyId,
      emailReminderScheduled,
      participantBatch: participantBatch ? {
        batchId: participantBatch.batchId,
        participantCount: participantBatch.participants.length,
        callRemindersScheduled: callReminderEnabled
      } : undefined
    }, { status: 200 });
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ message: 'Error sending emails' }, { status: 500 });
  }
} 