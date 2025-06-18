import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const responsesDir = path.join(process.cwd(), 'data', 'responses');
  try {
    const responseFiles = await fs.readdir(responsesDir);
    const allResponses = [];

    for (const file of responseFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(responsesDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const surveyResponses = JSON.parse(fileContent);
        allResponses.push(...surveyResponses);
      }
    }

    return NextResponse.json(allResponses, { status: 200 });
  } catch (error) {
    console.error('Failed to read response files:', error);
    // If the directory doesn't exist, it's not an error, just return empty.
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 