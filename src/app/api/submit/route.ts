import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { database } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { surveyId, answers } = await req.json();

    if (!surveyId || !answers) {
      return NextResponse.json({ message: 'Missing surveyId or answers' }, { status: 400 });
    }

    // Create response record
    const responseData = {
      id: nanoid(),
      surveyId,
      answers,
      submittedAt: new Date().toISOString(),
    };

    // Save response to database
    await database.createResponse(responseData);

    return NextResponse.json({ message: 'Survey submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit survey:', error);
    return NextResponse.json({ message: 'Failed to submit survey' }, { status: 500 });
  }
} 