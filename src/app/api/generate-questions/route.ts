import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  if (!topic) {
    return NextResponse.json({ message: 'Topic is required' }, { status: 400 });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return NextResponse.json(
      { message: 'Gemini API key not configured.' },
      { status: 500 }
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

  const prompt = `You are an expert in creating surveys. Your task is to generate a list of 5 to 7 concise, clear, and relevant survey questions based on the provided topic.

The output must be a single valid JSON object with a key named "questions", which holds an array of question objects. Each question object must have these properties:
- 'text' (the question string)
- 'type' (one of: 'text', 'single-choice', 'multiple-choice', 'rating')
- For 'single-choice' and 'multiple-choice' questions: 'options' property containing an array of 4-5 string options
- For 'rating' questions: 'min' and 'max' properties (typically 1 and 10)

Mix different question types appropriately for the topic. Use rating questions for satisfaction, experience, or preference scales. Use single-choice for exclusive selections, multiple-choice for multiple selections, and text for open-ended responses.

Do not include any extra text, markdown, or explanation outside of the single JSON object.

Topic: "${topic}"`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json(
        {
          message: `Failed to generate questions. API responded with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    const parsedContent = JSON.parse(content);

    return NextResponse.json({ questions: parsedContent.questions }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { message: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
} 