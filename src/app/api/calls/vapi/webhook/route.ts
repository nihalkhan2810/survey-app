import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { database } from '@/lib/database';
import { nanoid } from 'nanoid';

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Parse survey completion from transcript
function parseSurveyCompletion(transcript: string) {
  try {
    // Look for SURVEY_COMPLETE marker in transcript
    const completionIndex = transcript.lastIndexOf('SURVEY_COMPLETE');
    if (completionIndex === -1) return null;
    
    // Extract everything after SURVEY_COMPLETE
    const afterMarker = transcript.substring(completionIndex + 'SURVEY_COMPLETE'.length).trim();
    
    // Find the JSON object - look for balanced braces
    let braceCount = 0;
    let jsonStart = -1;
    let jsonEnd = -1;
    
    for (let i = 0; i < afterMarker.length; i++) {
      const char = afterMarker[i];
      if (char === '{') {
        if (jsonStart === -1) jsonStart = i;
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && jsonStart !== -1) {
          jsonEnd = i;
          break;
        }
      }
    }
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = afterMarker.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);
      return parsed.answers || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing survey completion:', error);
    return null;
  }
}

// Extract answers from transcript using Gemini API
async function extractAnswersWithGemini(transcript: string, surveyId: string): Promise<Record<string, string> | null> {
  try {
    if (!transcript || transcript.trim().length === 0) {
      return null;
    }

    // Get survey data to know what questions were asked
    const survey = await database.findSurveyById(surveyId);
    if (!survey || !survey.questions || survey.questions.length === 0) {
      console.log('No survey questions found for transcript processing');
      return null;
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.log('GEMINI_API_KEY not configured, falling back to basic extraction');
      return await extractAnswersFromTranscriptBasic(transcript);
    }

    // Prepare questions for Gemini
    const questionsList = survey.questions.map((q: any, i: number) => 
      `Question ${i + 1}: ${q.text}`
    ).join('\n');

    const geminiPrompt = `You are analyzing a voice survey transcript to extract the participant's answers to specific questions.

SURVEY QUESTIONS:
${questionsList}

TRANSCRIPT:
${transcript}

Your task: Extract the participant's answers from the transcript and return them in this EXACT JSON format:
{"answers": {"0": "answer to question 1", "1": "answer to question 2"}}

RULES:
- Use numeric keys starting from "0" (question 1 = "0", question 2 = "1", etc.)
- Extract the user's actual spoken responses, not the assistant's questions
- If no clear answer exists for a question, use "No response given"
- Be concise but capture the essence of their response
- Return ONLY the JSON object, no other text

EXAMPLE:
If user said "I think Bob is really helpful and knowledgeable" for question 1:
{"answers": {"0": "I think Bob is really helpful and knowledgeable"}}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: geminiPrompt }]
        }]
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return await extractAnswersFromTranscriptBasic(transcript);
    }

    const data = await response.json();
    const geminiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!geminiResponse) {
      console.log('No response from Gemini, falling back to basic extraction');
      return await extractAnswersFromTranscriptBasic(transcript);
    }

    // Try to parse the JSON response
    try {
      console.log('Raw Gemini response:', geminiResponse);
      
      // More flexible JSON extraction
      let jsonStr = geminiResponse.trim();
      
      // Remove any markdown code blocks
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON object - look for balanced braces
      const openIndex = jsonStr.indexOf('{');
      if (openIndex === -1) {
        console.log('No JSON object found in Gemini response, falling back');
        return await extractAnswersFromTranscriptBasic(transcript);
      }
      
      let braceCount = 0;
      let endIndex = -1;
      
      for (let i = openIndex; i < jsonStr.length; i++) {
        if (jsonStr[i] === '{') braceCount++;
        if (jsonStr[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
      
      if (endIndex === -1) {
        console.log('Incomplete JSON in Gemini response, falling back');
        return await extractAnswersFromTranscriptBasic(transcript);
      }
      
      const extractedJson = jsonStr.substring(openIndex, endIndex + 1);
      console.log('Extracted JSON:', extractedJson);
      
      const parsed = JSON.parse(extractedJson);
      console.log('Gemini extracted answers:', parsed.answers);
      return parsed.answers || null;
      
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Falling back to basic extraction');
      return await extractAnswersFromTranscriptBasic(transcript);
    }

  } catch (error) {
    console.error('Error with Gemini extraction:', error);
    return await extractAnswersFromTranscriptBasic(transcript);
  }
}

// Basic fallback extraction method
async function extractAnswersFromTranscriptBasic(transcript: string): Promise<Record<string, string> | null> {
  if (!transcript || transcript.trim().length === 0) {
    return null;
  }

  console.log('Using basic transcript extraction fallback');
  const answers: Record<string, string> = {};
  const lines = transcript.split('\n').filter(line => line.trim());
  let questionCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('User:')) {
      const userResponse = line.replace('User:', '').trim();
      
      // Skip very short responses but be more permissive
      if (userResponse.length <= 2) {
        continue;
      }
      
      // Skip greeting responses only
      const greetingWords = ['hi', 'hello', 'hey'];
      const isGreeting = greetingWords.includes(userResponse.toLowerCase().trim());
      
      if (isGreeting) {
        continue;
      }
      
      // Look for a question before this response
      let foundQuestion = false;
      for (let j = i - 1; j >= 0; j--) {
        const prevLine = lines[j];
        if (prevLine.startsWith('Assistant:')) {
          const questionWords = ['what', 'how', 'why', 'when', 'where', 'opinion', 'think', 'feel', 'would', 'do you'];
          const hasQuestionWord = questionWords.some(word => 
            prevLine.toLowerCase().includes(word)
          );
          
          if (hasQuestionWord || prevLine.includes('?')) {
            foundQuestion = true;
            break;
          }
        }
      }
      
      if (foundQuestion) {
        answers[questionCount.toString()] = userResponse;
        questionCount++;
        console.log(`Basic extraction found answer ${questionCount}: ${userResponse}`);
      }
    }
  }
  
  console.log('Basic extraction results:', answers);
  
  // If no substantial answers found, mark as incomplete survey
  if (Object.keys(answers).length === 0) {
    console.log('No substantial answers found in transcript');
    return { "0": "No response given - survey may have been incomplete" };
  }
  
  return answers;
}

// Validate answers and convert to dashboard-compatible format
async function validateAnswers(surveyId: string, answers: Record<string, string>): Promise<Record<string, string>> {
  try {
    // Try to get survey data to validate question IDs
    const survey = await database.findSurveyById(surveyId);
    if (!survey || !survey.questions) {
      console.log('Survey not found or has no questions, returning answers as-is');
      return answers;
    }

    const validatedAnswers: Record<string, string> = {};

    // Convert answers to numeric index format expected by dashboard
    for (const [questionKey, answer] of Object.entries(answers)) {
      // Extract question number from keys like "question_1", "question_2", etc.
      const questionMatch = questionKey.match(/question_(\d+)/);
      if (questionMatch) {
        const questionIndex = parseInt(questionMatch[1]) - 1; // Convert to 0-based index
        validatedAnswers[questionIndex.toString()] = answer;
      } else {
        // If it's already a numeric key or other format, try to map it
        const questionNum = parseInt(questionKey);
        if (!isNaN(questionNum)) {
          validatedAnswers[questionKey] = answer;
        } else {
          // If we can't parse it, try to map to the question position
          const answerKeys = Object.keys(answers);
          const answerIndex = answerKeys.indexOf(questionKey);
          if (answerIndex >= 0) {
            validatedAnswers[answerIndex.toString()] = answer;
          }
        }
      }
    }

    console.log('Converted answers for dashboard:', validatedAnswers);
    return validatedAnswers;
  } catch (error) {
    console.error('Error validating answers:', error);
    return answers; // Return original answers if validation fails
  }
}

// Save survey responses using database abstraction
async function saveSurveyResponse(surveyId: string, answers: Record<string, string> | null, callData: any, transcript: string) {
  try {
    // Validate answers if we have them
    const validatedAnswers = answers ? await validateAnswers(surveyId, answers) : {};
    
    const responseData = {
      id: nanoid(),
      surveyId,
      answers: validatedAnswers,
      identity: { isAnonymous: true }, // Voice responses are anonymous by default
      submittedAt: new Date().toISOString(),
      type: 'voice-vapi',
      metadata: {
        callId: callData.call?.id || callData.id,
        duration: callData.call?.duration || callData.duration,
        timestamp: new Date().toISOString(),
        phoneNumber: callData.call?.customer?.number || callData.customer?.number,
        cost: callData.call?.cost || callData.cost,
        provider: 'vapi',
        transcript: transcript,
        endedReason: callData.call?.endedReason || callData.endedReason,
        hasStructuredAnswers: !!answers && Object.keys(answers).length > 0,
        originalAnswerCount: answers ? Object.keys(answers).length : 0,
        validatedAnswerCount: Object.keys(validatedAnswers).length
      }
    };

    // Use the proper database abstraction layer
    await database.createResponse(responseData);
    console.log(`Voice survey response saved for surveyId: ${surveyId}, callId: ${responseData.metadata.callId}`);
    
    return responseData;
  } catch (error) {
    console.error('Error saving voice survey response:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    
    // Handle both signature verification methods
    const signature = req.headers.get('x-vapi-signature');
    const providedSecret = req.headers.get('x-vapi-secret');
    const secret = process.env.VAPI_WEBHOOK_SECRET || 'default-secret-change-me';
    
    // Verify webhook authentication
    let isAuthenticated = false;
    if (signature && verifyWebhookSignature(body, signature, secret)) {
      isAuthenticated = true;
    } else if (providedSecret === secret) {
      isAuthenticated = true;
    }
    
    if (!isAuthenticated) {
      console.error('Invalid webhook authentication');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webhookData = JSON.parse(body);
    console.log('VAPI Webhook received:', {
      type: webhookData.message?.type || webhookData.type || 'unknown',
      callId: webhookData.call?.id || webhookData.message?.call?.id,
      surveyId: webhookData.call?.metadata?.surveyId || webhookData.message?.call?.metadata?.surveyId
    });

    // Handle different webhook message types
    const message = webhookData.message || webhookData;
    if (!message) {
      console.log('No message in webhook data');
      return NextResponse.json({ received: true });
    }

    switch (message.type) {
      case 'status-update':
        await handleStatusUpdate(message);
        break;

      case 'transcript':
        await handleTranscript(message, webhookData);
        break;

      case 'function-call':
        return await handleFunctionCall(message);

      case 'hang':
      case 'end-of-call-report':
        await handleCallEnd(message, webhookData);
        break;

      case 'speech-update':
        console.log(`Speech update: ${message.status}`);
        break;

      case 'conversation-update':
        console.log(`Conversation update for call ${message.call?.id}`);
        break;

      default:
        console.log(`Unhandled webhook type: ${message.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('VAPI Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
}

// Handle status updates
async function handleStatusUpdate(message: any) {
  console.log(`Call ${message.call?.id} status: ${message.call?.status}`);
  
  if (message.call?.status === 'ended') {
    await processCallEnd(message.call, message);
  }
}

// Handle transcript messages
async function handleTranscript(message: any, webhookData: any) {
  const transcript = message.transcript || message.transcriptPart;
  const role = message.role;
  
  console.log(`Transcript from ${role}: ${transcript}`);
  
  // Check if this is an assistant message containing SURVEY_COMPLETE
  if (role === 'assistant' && transcript?.includes('SURVEY_COMPLETE')) {
    console.log('Survey completion detected in transcript');
    
    const callData = webhookData.call || message.call;
    const surveyId = callData?.metadata?.surveyId;
    
    if (surveyId) {
      const answers = parseSurveyCompletion(transcript);
      if (answers) {
        await saveSurveyResponse(surveyId, answers, callData, transcript);
        console.log('Survey response saved successfully from transcript');
      }
    }
  }
}

// Handle function calls
async function handleFunctionCall(message: any) {
  console.log('Function call received:', message.functionCall);
  
  // Temporarily disabled endCall function to test natural ending
  /*
  if (message.functionCall?.name === 'endCall') {
    console.log('EndCall function called, ending call');
    
    // Return instruction to end the call
    return NextResponse.json({
      result: {
        message: "Survey completed successfully"
      },
      endCall: true
    });
  }
  */
  
  if (message.functionCall?.name === 'end_survey_call') {
    console.log('Survey completion function called, ending call');
    
    // Return instruction to end the call
    return NextResponse.json({
      result: {
        message: "Survey completed successfully"
      },
      endCall: true
    });
  }
  
  if (message.functionCall?.name === 'get_survey_info') {
    return NextResponse.json({
      result: {
        message: "Survey information retrieved successfully"
      }
    });
  }
  
  return NextResponse.json({ received: true });
}

// Handle call end
async function handleCallEnd(message: any, webhookData: any) {
  const callData = webhookData.call || message.call;
  await processCallEnd(callData, message);
}

// Process call end and save response
async function processCallEnd(callData: any, message: any) {
  if (!callData?.metadata?.surveyId) {
    console.log('No survey ID found in call metadata');
    return;
  }

  const surveyId = callData.metadata.surveyId;
  
  // Extract transcript from artifact messages or call transcript
  let transcript = callData.transcript || '';
  
  // If no direct transcript, build it from artifact messages
  if (!transcript && message.artifact?.messages) {
    transcript = message.artifact.messages
      .filter((msg: any) => msg.role === 'user' || msg.role === 'bot' || msg.role === 'assistant')
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.message || msg.content}`)
      .join('\n');
  }
  
  if (!transcript || transcript === 'No transcript available') {
    console.log('No transcript found in call data or artifact');
    transcript = 'No transcript available';
  }
  
  console.log(`Processing call end for survey ${surveyId}, call ${callData.id}`);
  console.log(`Transcript length: ${transcript.length}`);
  console.log(`Transcript content:`, transcript.substring(0, 500) + (transcript.length > 500 ? '...' : ''));

  try {
    // Use Gemini API to extract answers from transcript
    console.log('Processing transcript with Gemini API...');
    const answers = await extractAnswersWithGemini(transcript, surveyId);
    
    // Save the response
    await saveSurveyResponse(surveyId, answers, { call: callData }, transcript);
    console.log('Voice survey response processed and saved with Gemini extraction');
    
  } catch (error) {
    console.error('Error processing call end:', error);
  }
}

// VAPI also sends GET requests for webhook verification
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'VAPI webhook endpoint is active',
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
}