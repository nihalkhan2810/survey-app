import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

// Ensure the surveys directory exists
const surveysDir = path.join(process.cwd(), 'data', 'surveys');

async function ensureDirExists() {
  try {
    await fs.access(surveysDir);
  } catch (error) {
    await fs.mkdir(surveysDir, { recursive: true });
  }
}

ensureDirExists();

export async function POST(req: NextRequest) {
  try {
    const { topic, questions, start_date, end_date, reminder_dates } = await req.json();

    if (!topic || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ message: 'Invalid survey data' }, { status: 400 });
    }

    if (!start_date || !end_date) {
      return NextResponse.json({ message: 'Start date and end date are required' }, { status: 400 });
    }

    const surveyId = nanoid(10); // Generate a 10-character unique ID
    const surveyData = {
      id: surveyId,
      topic,
      questions,
      start_date,
      end_date,
      reminder_dates: reminder_dates || [],
      createdAt: new Date().toISOString(),
    };

    const filePath = path.join(surveysDir, `${surveyId}.json`);
    await fs.writeFile(filePath, JSON.stringify(surveyData, null, 2));

    return NextResponse.json({ surveyId }, { status: 201 });
  } catch (error) {
    console.error('Failed to save survey:', error);
    return NextResponse.json({ message: 'Failed to save survey' }, { status: 500 });
  }
}

// New GET function to list all surveys
export async function GET(req: NextRequest) {
  try {
    const files = await fs.readdir(surveysDir);
    const surveys = await Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map(async (file) => {
          const filePath = path.join(surveysDir, file);
          const fileContents = await fs.readFile(filePath, 'utf8');
          const surveyData = JSON.parse(fileContents);
          return {
            id: surveyData.id,
            topic: surveyData.topic,
            createdAt: surveyData.createdAt,
            created_at: surveyData.createdAt, // For compatibility
            start_date: surveyData.start_date,
            end_date: surveyData.end_date,
            reminder_dates: surveyData.reminder_dates,
          };
        })
    );

    // Sort surveys by creation date, newest first
    surveys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(surveys, { status: 200 });
  } catch (error) {
    console.error('Failed to list surveys:', error);
    // This could happen if the directory doesn't exist yet, which is not an error in that case.
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json([], { status: 200 }); // Return empty array if no surveys directory
    }
    return NextResponse.json({ message: 'Failed to list surveys' }, { status: 500 });
  }
} 