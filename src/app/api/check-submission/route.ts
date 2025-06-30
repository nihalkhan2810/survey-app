import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { surveyId, email, batchId } = await req.json();

    if (!surveyId || !email) {
      return NextResponse.json({ message: 'Survey ID and email are required' }, { status: 400 });
    }

    // Check if this email has already submitted a response for this survey and batch
    const normalizedEmail = email.trim().toLowerCase();
    
    // Always check by email, survey, and batch for proper tracking
    const existingSubmission = await database.findResponseByEmailSurveyAndBatch(normalizedEmail, surveyId, batchId);
    
    return NextResponse.json({ 
      hasSubmitted: !!existingSubmission 
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking submission:', error);
    // Fail open - if we can't check, allow submission
    return NextResponse.json({ 
      hasSubmitted: false 
    }, { status: 200 });
  }
}