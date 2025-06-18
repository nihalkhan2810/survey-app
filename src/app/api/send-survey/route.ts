import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { surveyLink, emailSubject, emailBody, emails } = await req.json();

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

  const emailPromises = emails.map((email: string) => {
    return transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: emailSubject,
      html: `<p>${emailBody}</p><p><a href="${surveyLink}">Click here to take the survey</a></p>`,
    });
  });

  try {
    await Promise.all(emailPromises);
    return NextResponse.json({ message: 'Emails sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ message: 'Error sending emails' }, { status: 500 });
  }
} 