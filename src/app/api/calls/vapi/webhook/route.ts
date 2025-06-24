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

// Extract answers from transcript using AI fallback
async function extractAnswersFromTranscript(transcript: string, surveyQuestions?: any[]): Promise<Record<string, string> | null> {
  if (!transcript || transcript.trim().length === 0) {
    return null;
  }

  // First try structured parsing
  const structuredAnswers = parseSurveyCompletion(transcript);
  if (structuredAnswers) {
    return structuredAnswers;
  }

  // Fallback: extract from conversation flow
  const answers: Record<string, string> = {};
  
  // Look for specific patterns in the conversation
  const lines = transcript.split('\n').filter(line => line.trim());
  
  // Extract user responses that follow assistant questions
  let questionCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If this is a user response
    if (line.startsWith('User:')) {
      const userResponse = line.replace('User:', '').trim();
      
      // Skip empty or very short responses like "Okay", "Yes", "No" but be more permissive
      const skipWords = ['okay', 'yes', 'no', 'sure', 'hi', 'hello', 'great'];
      const isSkippable = userResponse.length <= 5 || 
                         skipWords.includes(userResponse.toLowerCase().trim());
      
      if (!isSkippable) {
        // Look back to find if there was a question before this response
        let foundQuestion = false;
        for (let j = i - 1; j >= 0; j--) {
          const prevLine = lines[j];
          if (prevLine.startsWith('Assistant:')) {
            // Check if this assistant message contains question words
            const questionWords = ['what', 'how', 'why', 'when', 'where', 'opinion', 'think', 'feel'];
            const hasQuestionWord = questionWords.some(word => 
              prevLine.toLowerCase().includes(word)
            );
            
            if (hasQuestionWord || prevLine.includes('?')) {
              foundQuestion = true;
              break;
            }
          }
        }
        
        if (foundQuestion || questionCount === 0) {
          // This looks like a substantive answer
          questionCount++;
          answers[`question_${questionCount}`] = userResponse;
        }
      }
    }
  }

  // If we still have no answers, try to extract from the AI's summary
  if (Object.keys(answers).length === 0) {
    // Look for patterns like "Question 1, he's good" in the AI's final message
    const summaryPattern = /question\s*(\d+)[,\s]+([^.]+)/gi;
    let match;
    while ((match = summaryPattern.exec(transcript)) !== null) {
      const questionNum = match[1];
      const answer = match[2].trim();
      answers[`question_${questionNum}`] = answer;
    }
  }

  console.log('Debug - Processing transcript lines:', lines.length);
  console.log('Debug - Found answers:', answers);
  console.log('Debug - Final answer count:', Object.keys(answers).length);
  
  return Object.keys(answers).length > 0 ? answers : null;
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
    // First try to extract structured answers
    let answers = parseSurveyCompletion(transcript);
    
    // If no structured answers, try basic extraction
    if (!answers) {
      answers = await extractAnswersFromTranscript(transcript);
    }
    
    // Save the response regardless of whether we have structured answers
    await saveSurveyResponse(surveyId, answers, { call: callData }, transcript);
    console.log('Voice survey response processed and saved');
    
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