import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Ensure the responses directory exists
const responsesDir = path.join(process.cwd(), 'data', 'responses');

async function ensureDirExists() {
  try {
    await fs.access(responsesDir);
  } catch (error) {
    await fs.mkdir(responsesDir, { recursive: true });
  }
}

ensureDirExists();

export async function POST(req: NextRequest) {
  try {
    const { surveyId, answers } = await req.json();

    if (!surveyId || !answers) {
      return NextResponse.json({ message: 'Missing surveyId or answers' }, { status: 400 });
    }

    const filePath = path.join(responsesDir, `${surveyId}.json`);
    let allResponses: any[] = [];

    try {
      // If the file exists, read it
      const fileContents = await fs.readFile(filePath, 'utf8');
      allResponses = JSON.parse(fileContents);
    } catch (error) {
      // File doesn't exist yet, which is fine
    }

    // Add the new response with a timestamp
    allResponses.push({ submittedAt: new Date().toISOString(), answers });

    // Write the updated responses back to the file
    await fs.writeFile(filePath, JSON.stringify(allResponses, null, 2));

    return NextResponse.json({ message: 'Survey submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit survey:', error);
    return NextResponse.json({ message: 'Failed to submit survey' }, { status: 500 });
  }
} 