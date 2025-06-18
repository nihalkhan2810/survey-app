import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { promises as fs } from 'fs';
import path from 'path';

const { VoiceResponse } = twilio.twiml;
const conversationsDir = path.join(process.cwd(), 'data', 'conversations');

type Survey = {
  id: string;
  topic: string;
  questions: { text: string; type: string; options?: string[] }[];
};

type Conversation = {
  callSid: string;
  survey: Survey;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  startTime: string;
};

// Helper to ensure directory exists
async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Gemini API call helper
async function callGemini(history: any[], survey: Survey) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

  const systemPrompt = `You are a friendly, patient, and conversational AI survey agent. Your goal is to guide a student through a survey over the phone.
  - The survey topic is: "${survey.topic}".
  - Here are the questions you need to ask: ${JSON.stringify(survey.questions.map(q => q.text))}
  - Keep your responses concise and natural for a voice conversation.
  - Guide the user one question at a time.
  - If the user says something off-topic, gently guide them back to the survey.
  - Once you have clear answers for all the questions, your *very last* response must be a JSON object containing the answers. The JSON object must look like this: {"status": "complete", "answers": {"0": "answer to first question", "1": "answer to second question", ...}}. Do not say anything else, just output the raw JSON.`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'model', parts: [{ text: 'Hello! Let\'s begin.' }] }, ...history],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    }),
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Final response saving helper
async function saveFinalAnswers(surveyId: string, callSid: string, answers: { [key: string]: string }) {
    const responsesDir = path.join(process.cwd(), 'data', 'responses');
    await ensureDir(responsesDir);
    const filePath = path.join(responsesDir, `${surveyId}.json`);
    let allResponses: any[] = [];
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        allResponses = JSON.parse(fileContents);
    } catch {}

    const response = {
        submittedAt: new Date().toISOString(),
        type: 'voice-ai',
        callSid: callSid,
        answers: answers,
    };
    allResponses.push(response);
    await fs.writeFile(filePath, JSON.stringify(allResponses, null, 2));
}

async function handler(req: NextRequest) {
  await ensureDir(conversationsDir);
  const twiml = new VoiceResponse();
  const searchParams = req.nextUrl.searchParams;
  const surveyId = searchParams.get('surveyId');

  let callSid: string | null = null;
  let speechResult: string | null = null;

  // Read the body ONCE if it's a POST request
  if (req.method === 'POST') {
    const formData = await req.formData();
    callSid = formData.get('CallSid') as string;
    speechResult = (formData.get('SpeechResult') as string) || '';
  } else {
    // For GET requests, the CallSid is in the query params
    callSid = searchParams.get('CallSid');
  }

  if (!surveyId || !callSid) {
    twiml.say('Application error: Missing survey or call ID.');
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
  }

  const conversationPath = path.join(conversationsDir, `${callSid}.json`);
  let conversation: Conversation;

  try {
    // Is this a new call?
    if (req.method === 'GET') {
      const surveysDir = path.join(process.cwd(), 'data', 'surveys');
      const surveyPath = path.join(surveysDir, `${surveyId}.json`);
      const survey: Survey = JSON.parse(await fs.readFile(surveyPath, 'utf8'));
      conversation = {
        callSid,
        survey,
        history: [],
        startTime: new Date().toISOString(),
      };
    } else {
      // Ongoing call (POST)
      conversation = JSON.parse(await fs.readFile(conversationPath, 'utf8'));
      if (speechResult) {
        conversation.history.push({ role: 'user', parts: [{ text: speechResult }] });
      }
    }

    const aiResponse = await callGemini(conversation.history, conversation.survey);

    // Clean potential markdown from AI response for parsing
    const cleanedResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    // Check if the AI has finished the survey
    try {
      const jsonResponse = JSON.parse(cleanedResponse);
      if (jsonResponse.status === 'complete' && jsonResponse.answers) {
        await saveFinalAnswers(surveyId, callSid, jsonResponse.answers);
        twiml.say('Thank you for completing the survey. Goodbye!');
        twiml.hangup();
        await fs.unlink(conversationPath); // Clean up conversation file
        return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
      }
    } catch (e) {
      // Not JSON, so it's a normal conversational turn. Continue.
    }

    // This is a normal conversational turn, save and speak the response.
    conversation.history.push({ role: 'model', parts: [{ text: aiResponse }] });
    await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));

    const gather = twiml.gather({
      input: ['speech'],
      speechTimeout: '2',
      timeout: 5,
      action: `/api/calls/webhook?surveyId=${surveyId}`,
      method: 'POST',
    });
    gather.say(aiResponse); // The AI's spoken response

    // If user says nothing, loop back to let the AI handle it
    twiml.redirect({ method: 'POST' }, `/api/calls/webhook?surveyId=${surveyId}`);

    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
  } catch (error: any) {
    console.error(`Webhook Error for CallSid ${callSid}:`, error);
    twiml.say('An application error has occurred. We apologize for the inconvenience. Goodbye.');
    twiml.hangup();
    if (callSid) await fs.unlink(path.join(conversationsDir, `${callSid}.json`)).catch(() => {});
    return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
  }
}

export { handler as GET, handler as POST }; 