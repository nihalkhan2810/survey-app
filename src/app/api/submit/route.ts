import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { database } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { surveyId, answers, identity } = await req.json();

    if (!surveyId || !answers) {
      return NextResponse.json({ message: 'Missing surveyId or answers' }, { status: 400 });
    }

    // Create response record with identity information
    const responseData = {
      id: nanoid(),
      surveyId,
      answers,
      identity: identity || { isAnonymous: true }, // Default to anonymous if not provided
      submittedAt: new Date().toISOString(),
      type: 'web' // Mark as web submission vs voice
    };

    // Save response to database
    await database.createResponse(responseData);

    return NextResponse.json({ message: 'Survey submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit survey:', error);
    return NextResponse.json({ message: 'Failed to submit survey' }, { status: 500 });
  }
} 