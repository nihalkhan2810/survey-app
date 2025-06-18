import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const surveysDir = path.join(process.cwd(), 'data', 'surveys');
const responsesDir = path.join(process.cwd(), 'data', 'responses');

export async function GET(
  req: NextRequest,
  context: { params: { surveyId: string } }
) {
  try {
    const { surveyId } = context.params;

    // Fetch the survey questions
    const surveyFilePath = path.join(surveysDir, `${surveyId}.json`);
    const surveyFileContents = await fs.readFile(surveyFilePath, 'utf8');
    const surveyData = JSON.parse(surveyFileContents);

    // Fetch the responses
    const responsesFilePath = path.join(responsesDir, `${surveyId}.json`);
    let responsesData = [];
    try {
      const responsesFileContents = await fs.readFile(responsesFilePath, 'utf8');
      responsesData = JSON.parse(responsesFileContents);
    } catch (error) {
      // No responses yet, which is fine
    }

    return NextResponse.json({ survey: surveyData, responses: responsesData }, { status: 200 });
  } catch (error) {
    console.error('Failed to read survey results:', error);
    return NextResponse.json({ message: 'Survey or results not found' }, { status: 404 });
  }
} 