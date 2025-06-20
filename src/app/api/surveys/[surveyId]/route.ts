import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await context.params;
    
    const surveyData = await database.findSurveyById(surveyId);
    
    if (!surveyData) {
      return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
    }

    return NextResponse.json(surveyData, { status: 200 });
  } catch (error) {
    console.error('Failed to read survey:', error);
    return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ surveyId: string }> }
) {
  try {
    const { surveyId } = await context.params;
    
    // Check if survey exists
    const existingSurvey = await database.findSurveyById(surveyId);
    if (!existingSurvey) {
      return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
    }
    
    // Delete survey from database
    await database.deleteSurvey(surveyId);

    return NextResponse.json({ message: 'Survey deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete survey:', error);
    return NextResponse.json({ message: 'Failed to delete survey' }, { status: 500 });
  }
} 