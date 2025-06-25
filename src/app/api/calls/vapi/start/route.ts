import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { surveyId, phoneNumbers, surveyData } = requestBody;

    // Try to get VAPI API key from environment variables directly (bypass DynamoDB issues)
    const vapiApiKey = process.env.VAPI_API_KEY;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!vapiApiKey) {
      return NextResponse.json({ 
        message: 'VAPI API key is not configured. Please add VAPI_API_KEY to your .env.local file.' 
      }, { status: 500 });
    }

    if (!appBaseUrl) {
      return NextResponse.json({ 
        message: 'NEXT_PUBLIC_APP_URL is not configured in .env.local' 
      }, { status: 500 });
    }
    
    if (!surveyData) {
      return NextResponse.json({ 
        message: 'Survey data is required in request body' 
      }, { status: 400 });
    }
    
    const survey = surveyData;

    // Create system message for the AI assistant
    const systemMessage = `You are a professional and friendly survey assistant named Alex. Your goal is to conduct a voice survey about "${survey.topic}" in a natural, conversational manner.

Survey Questions to ask:
${survey.questions.map((q: any, i: number) => `${i + 1}. ${q.text} (ID: ${q.id || `question_${i + 1}`})${q.options ? ` (Options: ${q.options.join(', ')})` : ''}`).join('\n')}

Instructions:
- Start by introducing yourself and explaining the survey purpose
- Ask questions one at a time and wait for complete answers
- Keep responses concise and natural for voice conversation (1-2 sentences max)
- Be patient and allow users to elaborate on their answers
- If users go off-topic, gently guide them back to the survey
- Once you have clear answers for all questions, output the structured summary then thank them and end the call
- Always be polite, professional, and speak clearly at a moderate pace
- Sound friendly and engaged throughout the conversation

CRITICAL: After collecting all responses, you MUST do these in EXACT order:
1. Say: "Thank you for participating in our survey. Your responses are valuable to us. Have a great day!"
2. Output this EXACT structured summary (replace with actual answers): SURVEY_COMPLETE {"answers": {"question_1": "their actual response word for word"}}
3. Say: "Goodbye!" and stop talking - the call will end automatically

EXAMPLE of step 2:
If user said "I think Bob is really great and helpful", you must output:
SURVEY_COMPLETE {"answers": {"question_1": "I think Bob is really great and helpful"}}

STRICT RULES:
- Ask ONLY the ${survey.questions.length} question(s) listed above
- DO NOT ask additional questions beyond what's listed  
- DO NOT ask for confirmation or repeat answers back to the user
- DO NOT ask "just to confirm" or similar phrases
- Accept the first clear answer and move on immediately
- After getting an answer to each question, move to the next or end the call
- Be conversational but stay focused on the survey questions only
- The SURVEY_COMPLETE format is for system processing only - don't mention it to the user

Begin by greeting the participant and asking if they have a few minutes for a brief survey about ${survey.topic}.`;

    // Configure AI model - support both OpenAI and custom LLM (Gemini)
    const useGemini = process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY;
    
    const modelConfig = useGemini ? {
      provider: "custom-llm",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      model: "gemini-1.5-flash-latest",
      temperature: 0.7,
      maxTokens: 150
    } : {
      provider: "openai",
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 150
    };

    // Create assistant dynamically (don't use pre-configured assistant)
    const assistantConfig = {
      name: `Survey Assistant - ${survey.topic}`,
      model: modelConfig,
      systemMessage: systemMessage,
      voice: {
        provider: "11labs",
        voiceId: "paula", // Professional female voice
        model: "eleven_turbo_v2",
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.2,
        useSpeakerBoost: true
      },
      firstMessage: `Hello! This is Alex calling to conduct a brief survey about ${survey.topic}. This should only take a few minutes of your time. Are you available to answer a few questions?`,
      recordingEnabled: true,
      endCallMessage: "Thank you for participating in our survey. Your responses are valuable to us. Have a great day!",
      // Additional configuration options
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 600, // 10 minutes max
      backgroundSound: "office",
      backchannelingEnabled: true,
      backgroundDenoisingEnabled: true,
      modelOutputInMessagesEnabled: true,
      transportConfigurations: [
        {
          provider: "twilio",
          timeout: 60,
          record: true
        }
      ]
    };

    // Create calls for each phone number using the phone call API
    const callPromises = phoneNumbers.map(async (phoneNumber: string) => {
      const callPayload = {
        assistant: assistantConfig,
        customer: {
          number: phoneNumber,
          numberE164CheckEnabled: false // Allow various phone number formats
        },
        metadata: {
          surveyId: surveyId,
          surveyTopic: survey.topic,
          timestamp: new Date().toISOString()
        }
      };

      console.log(`Initiating VAPI call to ${phoneNumber} for survey ${surveyId}`);

      const response = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callPayload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`VAPI API error for ${phoneNumber}:`, errorData);
        throw new Error(`VAPI API error for ${phoneNumber}: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log(`Call initiated successfully to ${phoneNumber}:`, result.id);
      
      return {
        phoneNumber,
        callId: result.id,
        status: result.status || 'initiated'
      };
    });

    const results = await Promise.allSettled(callPromises);
    
    // Process results and separate successful and failed calls
    const successful = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
    
    const failed = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => ({
        error: result.reason.message
      }));

    const response = {
      message: `Voice calls initiated with VAPI.`,
      total: phoneNumbers.length,
      successful: successful.length,
      failed: failed.length,
      calls: successful,
      errors: failed.length > 0 ? failed : undefined
    };

    if (failed.length > 0) {
      console.warn(`Some calls failed:`, failed);
    }

    return NextResponse.json(response, { 
      status: successful.length > 0 ? 200 : 500 
    });

  } catch (error: any) {
    console.error('VAPI API error:', error);
    return NextResponse.json({ 
      message: `Failed to initiate voice calls: ${error.message}`,
      error: error.message
    }, { status: 500 });
  }
}