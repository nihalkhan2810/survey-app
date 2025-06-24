import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { surveyId, surveyData } = await req.json();
    
    const vapiApiKey = process.env.VAPI_API_KEY;
    if (!vapiApiKey) {
      return NextResponse.json({ error: 'VAPI API key not configured' }, { status: 500 });
    }

    // Get the survey details
    const { topic, questions } = surveyData;
    
    // Create the system prompt for the survey
    const systemPrompt = `You are a friendly, patient, and conversational AI survey agent conducting a phone survey.

SURVEY TOPIC: "${topic}"

QUESTIONS TO ASK:
${questions.map((q: any, index: number) => `${index + 1}. ${q.text} (ID: ${q.id || `question_${index + 1}`})`).join('\n')}

INSTRUCTIONS:
- Start with a warm greeting and introduce yourself
- Ask questions one at a time in a natural, conversational way
- Listen carefully to responses and ask follow-up questions if needed
- Keep responses concise and natural for voice conversation
- If the user says something off-topic, gently guide them back
- Once you have clear answers for all questions, thank them and end the call

CRITICAL: After collecting all responses, you MUST do these in EXACT order:
1. Say: "Thank you for completing our survey! Have a great day!"
2. Output this EXACT structured summary (replace with actual answers): SURVEY_COMPLETE {"answers": {"question_1": "their actual response word for word"}}
3. Say: "Goodbye!" and stop talking - the call will end automatically

EXAMPLE of step 2:
If user said "I think Bob is really great and helpful", you must output:
SURVEY_COMPLETE {"answers": {"question_1": "I think Bob is really great and helpful"}}

STRICT RULES:
- Ask ONLY the ${questions.length} question(s) listed above
- DO NOT ask additional questions beyond what's listed
- DO NOT ask for confirmation or repeat answers back to the user
- DO NOT ask "just to confirm" or similar phrases
- Accept the first clear answer and move on immediately
- After getting an answer to each question, move to the next or end the call
- Be conversational but stay focused on the survey questions only
- The SURVEY_COMPLETE format is for system processing only - don't mention it to the user`;

    // Get webhook URL - prefer environment variable, fallback to constructing from app URL
    const webhookUrl = process.env.VAPI_WEBHOOK_URL || 
                      `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/vapi/webhook`;
    const isProduction = webhookUrl && webhookUrl.startsWith('https://');

    // Create VAPI assistant
    const assistantConfig: any = {
      name: `Survey Assistant - ${topic}`,
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ]
      },
      voice: {
        provider: "vapi",
        voiceId: "Lily" // Use VAPI's built-in voice (valid options: Elliot, Kylie, Rohan, Lily, Savannah, Hana, Neha, Cole, Harry, Paige, Spencer)
      },
      firstMessage: `Hello! Thank you for participating in our survey about ${topic}. This will only take a few minutes. Let's get started!`,
      endCallMessage: "Thank you for completing our survey! Have a great day!",
      // Add webhook URL for response handling
      ...(isProduction && {
        serverUrl: webhookUrl,
        serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET || 'default-secret'
      })
    };

    // Create assistant via VAPI API
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('VAPI assistant creation failed:', error);
      return NextResponse.json({ 
        error: 'Failed to create VAPI assistant', 
        details: error,
        statusCode: response.status 
      }, { status: response.status });
    }

    const assistant = await response.json();
    
    return NextResponse.json({ 
      assistantId: assistant.id,
      message: 'Survey assistant created successfully'
    });

  } catch (error: any) {
    console.error('Error creating VAPI survey assistant:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Make outbound calls using VAPI
export async function PUT(req: NextRequest) {
  try {
    const { assistantId, phoneNumber, surveyId } = await req.json();
    
    const vapiApiKey = process.env.VAPI_API_KEY;
    if (!vapiApiKey) {
      return NextResponse.json({ error: 'VAPI API key not configured' }, { status: 500 });
    }

    // Check if VAPI phone number is configured
    const vapiPhoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
    if (!vapiPhoneNumberId) {
      return NextResponse.json({ 
        error: 'VAPI phone number not configured. Please add VAPI_PHONE_NUMBER_ID to environment variables.' 
      }, { status: 500 });
    }

    // Make outbound call via VAPI
    const callConfig = {
      type: 'outboundPhoneCall',
      phoneNumberId: vapiPhoneNumberId,
      customer: {
        number: phoneNumber
      },
      assistantId: assistantId,
      metadata: {
        surveyId: surveyId
      }
    };

    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(callConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('VAPI call creation failed:', error);
      return NextResponse.json({ 
        error: 'Failed to initiate call', 
        details: error,
        statusCode: response.status 
      }, { status: response.status });
    }

    const call = await response.json();
    
    return NextResponse.json({ 
      callId: call.id,
      message: 'Call initiated successfully'
    });

  } catch (error: any) {
    console.error('Error making VAPI call:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 