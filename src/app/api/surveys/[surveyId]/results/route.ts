import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(
  req: NextRequest,
  context: { params: { surveyId: string } }
) {
  try {
    const { surveyId } = context.params;

    // Fetch the survey data
    const surveyData = await database.findSurveyById(surveyId);
    if (!surveyData) {
      return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
    }

    // Fetch the responses for this survey
    const responsesData = await database.getResponsesBySurvey(surveyId);

    return NextResponse.json({ 
      survey: surveyData, 
      responses: responsesData 
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to read survey results:', error);
    return NextResponse.json({ message: 'Survey or results not found' }, { status: 404 });
  }
} 