import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const surveysDir = path.join(process.cwd(), 'data', 'surveys');

export async function GET(
  req: NextRequest,
  context: { params: { surveyId: string } }
) {
  try {
    const { surveyId } = context.params;
    const filePath = path.join(surveysDir, `${surveyId}.json`);

    const fileContents = await fs.readFile(filePath, 'utf8');
    const surveyData = JSON.parse(fileContents);

    return NextResponse.json(surveyData, { status: 200 });
  } catch (error) {
    // This could be a file not found error, which is expected for invalid IDs.
    console.error('Failed to read survey:', error);
    return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { surveyId: string } }
) {
  try {
    const { surveyId } = context.params;
    const surveyFilePath = path.join(surveysDir, `${surveyId}.json`);
    
    // Check if survey exists
    try {
      await fs.access(surveyFilePath);
    } catch {
      return NextResponse.json({ message: 'Survey not found' }, { status: 404 });
    }
    
    // Delete survey file
    await fs.unlink(surveyFilePath);
    
    // Also delete associated responses if they exist
    const responsesDir = path.join(process.cwd(), 'data', 'responses');
    const responseFilePath = path.join(responsesDir, `${surveyId}.json`);
    try {
      await fs.unlink(responseFilePath);
    } catch {
      // Responses file might not exist, which is fine
    }

    return NextResponse.json({ message: 'Survey deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete survey:', error);
    return NextResponse.json({ message: 'Failed to delete survey' }, { status: 500 });
  }
} 