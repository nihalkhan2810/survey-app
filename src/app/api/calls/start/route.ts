import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const { surveyId, phoneNumbers } = await req.json();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL; // You will need to add this to .env.local

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    return NextResponse.json({ message: 'Twilio credentials are not configured.' }, { status: 500 });
  }
  if (!appBaseUrl) {
      return NextResponse.json({ message: 'NEXT_PUBLIC_APP_URL is not configured in .env.local' }, { status: 500 });
  }

  const client = twilio(accountSid, authToken);

  try {
    const callPromises = phoneNumbers.map((number: string) => {
      return client.calls.create({
        to: number,
        from: twilioPhoneNumber,
        // Twilio will make a GET request to this URL when the call is answered
        url: `${appBaseUrl}/api/calls/webhook?surveyId=${surveyId}`,
        method: 'GET',
      });
    });

    await Promise.all(callPromises);

    return NextResponse.json({ message: 'Calls initiated successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Twilio API error:', error);
    return NextResponse.json({ message: `Failed to initiate calls: ${error.message}` }, { status: 500 });
  }
} 