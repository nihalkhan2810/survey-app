import { NextRequest, NextResponse } from 'next/server';
import { getVapiApiKey } from '../config/route';

export async function POST(req: NextRequest) {
  try {
    const { assistantId, testText } = await req.json();

    if (!assistantId) {
      return NextResponse.json({ 
        message: 'Assistant ID is required' 
      }, { status: 400 });
    }

    const apiKey = await getVapiApiKey();
    if (!apiKey) {
      return NextResponse.json({ 
        message: 'VAPI not configured. Please add your API key first.' 
      }, { status: 400 });
    }

    // Check if we have a phone number for making calls
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
    if (!phoneNumberId) {
      return NextResponse.json({ 
        message: 'VAPI phone number not configured. Add VAPI_PHONE_NUMBER_ID to environment variables.' 
      }, { status: 400 });
    }

    // First, verify the assistant exists
    const assistantResponse = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!assistantResponse.ok) {
      return NextResponse.json({ 
        message: 'Assistant not found. Please check the Assistant ID is correct.' 
      }, { status: 400 });
    }

    const assistant = await assistantResponse.json();

    // Return assistant details for testing
    const voiceInfo = assistant.voice ? 
      `${assistant.voice.provider} voice (${assistant.voice.voiceId || 'default'})` : 
      'Default voice';

    return NextResponse.json({ 
      success: true,
      message: `✅ Assistant "${assistant.name}" found and ready for testing!`,
      assistantName: assistant.name,
      assistantId: assistantId,
      voiceConfiguration: voiceInfo,
      testInstructions: 'Go to dashboard.vapi.ai → Assistants → Find your assistant → Click "Talk to Assistant" to test the voice'
    });

  } catch (error: any) {
    console.error('VAPI assistant test error:', error);
    return NextResponse.json({ 
      message: 'Assistant test failed' 
    }, { status: 500 });
  }
} 