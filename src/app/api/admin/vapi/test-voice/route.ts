import { NextRequest, NextResponse } from 'next/server';
import { getVapiApiKey } from '../config/route';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    if (!text) {
      return NextResponse.json({ 
        message: 'Text is required for voice test' 
      }, { status: 400 });
    }

    const apiKey = await getVapiApiKey();
    if (!apiKey) {
      return NextResponse.json({ 
        message: 'VAPI not configured. Please add your API key first.' 
      }, { status: 400 });
    }

    // Check if we have HTTPS webhook URL
    const webhookUrl = process.env.VAPI_WEBHOOK_URL;
    const isProduction = webhookUrl && webhookUrl.startsWith('https://');

    // Determine voice configuration based on voiceId
    let voiceConfig;
    
    // For VAPI built-in voices (no ElevenLabs account needed)
    const vapiBuiltInVoices = ['Elliot', 'Kylie', 'Rohan', 'Lily', 'Savannah', 'Hana', 'Neha', 'Cole', 'Harry', 'Paige', 'Spencer'];
    
    if (!voiceId || vapiBuiltInVoices.includes(voiceId)) {
      // Use VAPI's built-in voices
      voiceConfig = {
        provider: "vapi",
        voiceId: voiceId || "Lily"
      };
    } else {
      // Fallback to VAPI built-in if unknown voice
      voiceConfig = {
        provider: "vapi",
        voiceId: "Lily"
      };
    }

    // Create a temporary assistant for voice testing
    const assistantConfig: any = {
      name: 'Voice Test Assistant',
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a voice test assistant. Say exactly what the user asks you to say, then end the call."
          }
        ]
      },
      voice: voiceConfig,
      firstMessage: text,
      endCallMessage: "Voice test complete.",
      // Only add webhook URL if it's HTTPS (production)
      ...(isProduction && {
        serverUrl: webhookUrl,
        serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET || 'default-secret'
      })
    };

    // Create the test assistant
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ 
        message: `Failed to create voice test assistant: ${error}` 
      }, { status: 400 });
    }

    const assistant = await response.json();

    return NextResponse.json({ 
      success: true,
      message: 'Voice test assistant created! Use the phone test feature in VAPI dashboard to hear the voice.',
      assistantId: assistant.id,
      note: 'Go to VAPI Dashboard → Assistants → Test this assistant to hear the voice'
    });

  } catch (error: any) {
    console.error('VAPI voice test error:', error);
    return NextResponse.json({ 
      message: 'Voice test failed' 
    }, { status: 500 });
  }
}