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


    // Get existing assistant ID and phone number ID from environment  
    const assistantId = process.env.VAPI_ASSISTANT_ID;
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
    
    console.log('DEBUG: VAPI_ASSISTANT_ID from env:', assistantId);
    console.log('DEBUG: VAPI_PHONE_NUMBER_ID from env:', phoneNumberId);
    
    if (!assistantId) {
      return NextResponse.json({ 
        message: 'VAPI_ASSISTANT_ID is not configured. Please add it to your .env.local file.' 
      }, { status: 500 });
    }
    
    if (!phoneNumberId) {
      return NextResponse.json({ 
        message: 'VAPI_PHONE_NUMBER_ID is not configured. Please add it to your .env.local file.' 
      }, { status: 500 });
    }

    // Create calls for each phone number using the phone call API
    const callPromises = phoneNumbers.map(async (phoneNumber: string) => {
      const callPayload = {
        type: "outboundPhoneCall",
        phoneNumberId: phoneNumberId,
        assistantId: assistantId,
        customer: {
          number: phoneNumber
        },
        metadata: {
          surveyId: surveyId,
          surveyTopic: survey.topic,
          timestamp: new Date().toISOString()
        },
        assistantOverrides: {
          variableValues: {
            surveyTopic: survey.topic,
            surveyQuestions: survey.questions.map((q: any, i: number) => 
              `${i + 1}. ${q.text} (ID: ${q.id || `question_${i + 1}`})${q.options ? ` (Options: ${q.options.join(', ')})` : ''}`
            ).join('\n'),
            questionCount: survey.questions.length.toString(),
            firstMessage: `Hello! This is Bob calling to conduct a brief survey about ${survey.topic}. This should only take a few minutes of your time. Are you available to answer a few questions?`,
            endCallInstructions: `After the user responds to the final question, acknowledge their response briefly, then say "Thank you for your response. That's the end of the survey. Have a great day!" The call will end naturally.`
          }
        }
      };

      console.log(`Initiating VAPI call to ${phoneNumber} for survey ${surveyId}`);
      console.log('DEBUG: Call payload:', JSON.stringify(callPayload, null, 2));

      const response = await fetch('https://api.vapi.ai/call', {
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