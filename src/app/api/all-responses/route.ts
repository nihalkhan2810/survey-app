import { NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { generateDummyResponses } from '@/lib/dummy-responses';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Try to get responses from database first
    const responses = await database.getAllResponses();
    
    // Only add dummy responses for demonstration in responses page
    const { responses: dummyResponses } = generateDummyResponses();
    const allResponses = [...responses, ...dummyResponses];
    
    return NextResponse.json(allResponses, { status: 200 });
  } catch (dbError) {
    console.warn('Failed to get responses from database, falling back to file system:', dbError);
    
    // Fallback to file system
    const responsesDir = path.join(process.cwd(), 'data', 'responses');
    try {
      const responseFiles = await fs.readdir(responsesDir);
      const fileResponses = [];

      for (const file of responseFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(responsesDir, file);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const surveyResponses = JSON.parse(fileContent);
          fileResponses.push(...surveyResponses);
        }
      }

      // Only add dummy responses for demonstration in responses page
      const { responses: dummyResponses } = generateDummyResponses();
      const allResponses = [...fileResponses, ...dummyResponses];

      return NextResponse.json(allResponses, { status: 200 });
    } catch (error) {
      console.error('Failed to read response files:', error);
      // If the directory doesn't exist, return dummy data
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        const { responses: dummyResponses } = generateDummyResponses();
        return NextResponse.json(dummyResponses, { status: 200 });
      }
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }
} 