import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createParticipants } from '@/lib/participant_tracker';

export async function POST(req: NextRequest) {
  const { surveyLink, emailSubject, emailBody, emails, phoneNumbers, callReminderEnabled, surveyId } = await req.json();

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

  const emailPromises = emails.map((email: string, index: number) => {
    let personalizedLink = surveyLink;
    
    // Add participant ID to survey link if tracking is enabled
    if (participantBatch) {
      const participant = participantBatch.participants[index];
      if (participant) {
        personalizedLink = `${surveyLink}?participantId=${participant.id}`;
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
    
    return NextResponse.json({ 
      message: 'Emails sent successfully',
      surveyId,
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