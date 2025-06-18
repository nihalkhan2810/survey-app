import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { surveyTopic, reminderType, recipientCount } = await req.json();

  if (!surveyTopic || !reminderType) {
    return NextResponse.json({ message: 'Survey topic and reminder type are required' }, { status: 400 });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return NextResponse.json(
      { message: 'Gemini API key not configured.' },
      { status: 500 }
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

  let prompt = '';
  
  switch (reminderType) {
    case 'opening':
      prompt = `Write a professional and engaging email reminder for a survey that is opening today. The survey topic is "${surveyTopic}". 
      
      The email should:
      - Be warm and welcoming
      - Emphasize the importance of their participation
      - Mention that the survey is now open
      - Be concise but friendly
      - Include a clear call to action
      
      Output only the email body text, no subject line. Keep it under 150 words.`;
      break;
      
    case 'closing':
      prompt = `Write a professional and urgent email reminder for a survey that is closing today. The survey topic is "${surveyTopic}". 
      
      The email should:
      - Create appropriate urgency without being pushy
      - Emphasize this is the last chance to participate
      - Mention the value of their feedback
      - Be concise and actionable
      - Include a clear call to action
      
      Output only the email body text, no subject line. Keep it under 150 words.`;
      break;
      
    case 'midpoint':
      prompt = `Write a professional and encouraging email reminder for a survey that is currently open. The survey topic is "${surveyTopic}". 
      
      The email should:
      - Be friendly and encouraging
      - Mention that there's still time to participate
      - Emphasize the value of their input
      - Be motivating but not pushy
      - Include a clear call to action
      
      Output only the email body text, no subject line. Keep it under 150 words.`;
      break;
      
    default:
      prompt = `Write a professional email reminder for a survey about "${surveyTopic}". 
      
      The email should be friendly, professional, and encourage participation. Keep it under 150 words and output only the email body text.`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json(
        {
          message: `Failed to generate reminder message. API responded with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ 
      message: content.trim(),
      subject: `Reminder: ${surveyTopic}${reminderType === 'closing' ? ' - Last Chance!' : ''}`
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating reminder message:', error);
    return NextResponse.json(
      { message: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}